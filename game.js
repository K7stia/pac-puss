// Конфігурація гри
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 600;
const TILE_SIZE = 30;
const PLAYER_SPEED = TILE_SIZE / 15;
const GHOST_SPEED = TILE_SIZE / 20;
const COLLISION_DISTANCE = 0.8;
const ALIGNMENT_THRESHOLD = 0.2;
const GHOST_UPDATE_TARGET_FREQ = 0.05;
const POWER_UP_DURATION = 5000;

// Ініціалізація canvas
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
if (!ctx) throw new Error('Failed to get 2D context');
document.body.appendChild(canvas);
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

// Завантаження зображень для Пакмена
const headImage = new Image();
headImage.src = 'head.png'; // Верхня щелепа (вправо, вниз, вгору)
const butImage = new Image();
butImage.src = 'but.png';   // Нижня щелепа (вправо, вниз, вгору)
const headbImage = new Image();
headbImage.src = 'headb.png'; // Верхня щелепа (вліво)
const butbImage = new Image();
butbImage.src = 'butb.png';   // Нижня щелепа (вліво)

// Адаптація розміру canvas
function resizeCanvas() {
    const scale = Math.min(window.innerWidth / CANVAS_WIDTH, window.innerHeight / CANVAS_HEIGHT);
    canvas.style.width = `${CANVAS_WIDTH * scale}px`;
    canvas.style.height = `${CANVAS_HEIGHT * scale}px`;
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Нормалізація координат для сенсорного введення
function normalizeTouchCoords(touch) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY
    };
}

// Звуки
const eatSound = new Audio('eat.wav');
const powerUpSound = new Audio('power.wav');
const loseSound = new Audio('lose.wav');
const eatGhostSound = new Audio('eatghost.wav');

// Обробник кліку миші
canvas.addEventListener('click', () => {
    if (gameOver || gameWon) {
        resetGame();
    }
});

// Карта гри
const map = [
    '####################',
    '#P..#......#.....P.#',
    '#.#.#.##.#...#.###.#',
    '#.#.#....##..#.#...#',
    '#.#.##.#.#.#.#.#.###',
    '#.#....#.#..##...#.#',
    '#.####.#.#...#.###.#',
    '#..........#.....P.#',
    '######.#.#.###.#####',
    '#....#.#.#.#...#...#',
    '#.####.#.#.###.###.#',
    '#.#....#.#...#...#.#',
    '#.#.##.###.###.###.#',
    '#P...#.............#',
    '#.##.#.#.#######.#.#',
    '#..#.#.#.....#...#.#',
    '##.#.#.#.###.#.###.#',
    '#..#.#.#.#.#.#.#...#',
    '##...#.....#.....#.#',
    '####################'
].map(row => row.split(''));

// Об'єкти гри
let player = { x: 1, y: 1, dx: 0, dy: 0, score: 0, mouth: 0, direction: 0, nextDx: 0, nextDy: 0 };
let ghosts = [];
let gameOver = false;
let gameWon = false;
let powerUpActive = false;
let powerUpTimer = 0;

// Ініціалізація гри
function resetGame() {
    player = { x: 1, y: 1, dx: 0, dy: 0, score: 0, mouth: 0, direction: 0, nextDx: 0, nextDy: 0 };
    ghosts = [
        { x: 18, y: 1, dx: -GHOST_SPEED, dy: 0, color: 'red', anim: 0, targetX: 1, targetY: 1, stuckCounter: 0, vulnerable: false },
        { x: 18, y: 13, dx: -GHOST_SPEED, dy: 0, color: 'pink', anim: 0, targetX: 1, targetY: 1, stuckCounter: 0, vulnerable: false },
        { x: 2, y: 18, dx: GHOST_SPEED, dy: 0, color: 'lime', anim: 0, targetX: 1, targetY: 1, stuckCounter: 0, vulnerable: false }
    ];
    map.forEach((row, y) => row.forEach((cell, x) => {
        if (cell === ' ') map[y][x] = '.';
        if (cell === 'P') map[y][x] = 'P';
    }));
    gameOver = false;
    gameWon = false;
    powerUpActive = false;
    powerUpTimer = 0;
}

// Управління клавіатурою
document.addEventListener('keydown', (e) => {
    if (gameOver || gameWon) {
        if (e.key === 'Enter' || e.key === ' ') {
            resetGame();
        }
        return;
    }
    switch (e.key) {
        case 'ArrowUp': player.nextDx = 0; player.nextDy = -PLAYER_SPEED; player.direction = 3; break;
        case 'ArrowDown': player.nextDx = 0; player.nextDy = PLAYER_SPEED; player.direction = 1; break;
        case 'ArrowLeft': player.nextDx = -PLAYER_SPEED; player.nextDy = 0; player.direction = 2; break;
        case 'ArrowRight': player.nextDx = PLAYER_SPEED; player.nextDy = 0; player.direction = 0; break;
    }
});

// Сенсорне керування з оптимізацією чутливості
let touchStartX = 0;
let touchStartY = 0;
canvas.addEventListener('touchstart', (e) => {
    if (gameOver || gameWon) {
        resetGame();
        return;
    }
    const touch = normalizeTouchCoords(e.touches[0]);
    touchStartX = touch.x;
    touchStartY = touch.y;
});

canvas.addEventListener('touchmove', (e) => {
    if (gameOver || gameWon) return;
    const touch = normalizeTouchCoords(e.touches[0]);
    const deltaX = touch.x - touchStartX;
    const deltaY = touch.y - touchStartY;
    const threshold = 20;

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > threshold) {
        player.nextDx = deltaX > 0 ? PLAYER_SPEED : -PLAYER_SPEED;
        player.nextDy = 0;
        player.direction = deltaX > 0 ? 0 : 2;
        touchStartX = touch.x;
    } else if (Math.abs(deltaY) > threshold) {
        player.nextDx = 0;
        player.nextDy = deltaY > 0 ? PLAYER_SPEED : -PLAYER_SPEED;
        player.direction = deltaY > 0 ? 1 : 3;
        touchStartY = touch.y;
    }
});

// Додаткові кнопки на екрані (тільки для мобільних)
const isMobile = () => {
    return window.matchMedia("(max-width: 600px)").matches || 'ontouchstart' in window;
};

const buttonContainer = document.createElement('div');
buttonContainer.className = 'control-buttons';

const directions = [
    { name: '↑', dx: 0, dy: -PLAYER_SPEED, dir: 3 },
    { name: '↓', dx: 0, dy: PLAYER_SPEED, dir: 1 },
    { name: '←', dx: -PLAYER_SPEED, dy: 0, dir: 2 },
    { name: '→', dx: PLAYER_SPEED, dy: 0, dir: 0 }
];

function initializeControls() {
    if (isMobile()) {
        directions.forEach(d => {
            const btn = document.createElement('button');
            btn.textContent = d.name;
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                player.nextDx = d.dx;
                player.nextDy = d.dy;
                player.direction = d.dir;
            });
            btn.addEventListener('touchend', () => {
                if (player.nextDx === d.dx && player.nextDy === d.dy) {
                    player.nextDx = 0;
                    player.nextDy = 0;
                }
            });
            buttonContainer.appendChild(btn);
        });
        document.body.appendChild(buttonContainer);
    } else {
        if (buttonContainer.parentNode) {
            buttonContainer.parentNode.removeChild(buttonContainer);
        }
    }
}

// Ініціалізація контролів при завантаженні та зміні розміру
initializeControls();
window.addEventListener('resize', initializeControls);

// Перевірка можливості руху
function canMove(x, y, size = 0.9) {
    const tileX = Math.floor(x);
    const tileY = Math.floor(y);
    return map[tileY] &&
        map[tileY][tileX] !== '#' &&
        map[Math.floor(y + size)][Math.floor(x + size)] !== '#' &&
        map[Math.floor(y + size)][tileX] !== '#' &&
        map[tileY][Math.floor(x + size)] !== '#';
}

// Перевірка вирівнювання
function isCloseToAligned(pos) {
    return Math.abs(pos - Math.round(pos)) < ALIGNMENT_THRESHOLD;
}

// Перевірка, чи є тупик
function isDeadEnd(x, y, dx, dy) {
    const nextX = x + dx / TILE_SIZE;
    const nextY = y + dy / TILE_SIZE;
    if (!canMove(nextX, nextY)) {
        const directions = [
            { dx: GHOST_SPEED, dy: 0 },
            { dx: -GHOST_SPEED, dy: 0 },
            { dx: 0, dy: GHOST_SPEED },
            { dx: 0, dy: -GHOST_SPEED }
        ];
        const validDirs = directions.filter(dir =>
            dir.dx !== -dx || dir.dy !== -dy
        ).filter(dir => canMove(nextX + dir.dx / TILE_SIZE, nextY + dir.dy / TILE_SIZE));
        return validDirs.length === 0;
    }
    return false;
}

// Оновлення логіки гри
function update() {
    if (gameOver || gameWon) return;

    if (powerUpActive) {
        powerUpTimer -= 1000 / 60;
        if (powerUpTimer <= 0) {
            powerUpActive = false;
            ghosts.forEach(ghost => ghost.vulnerable = false);
        }
    }

    let newX = player.x + player.dx / TILE_SIZE;
    let newY = player.y + player.dy / TILE_SIZE;

    if ((player.nextDx !== player.dx || player.nextDy !== player.dy) &&
        isCloseToAligned(player.x) && isCloseToAligned(player.y)) {
        const nextX = player.x + player.nextDx / TILE_SIZE;
        const nextY = player.y + player.nextDy / TILE_SIZE;
        if (canMove(nextX, nextY)) {
            player.dx = player.nextDx;
            player.dy = player.nextDy;
            newX = nextX;
            newY = nextY;
        }
    }

    if (canMove(newX, newY)) {
        player.x = newX;
        player.y = newY;
    }

    player.mouth = (player.mouth + 0.1) % (2 * Math.PI);

    const tileX = Math.floor(player.x);
    const tileY = Math.floor(player.y);
    if (map[tileY][tileX] === '.') {
        map[tileY][tileX] = ' ';
        player.score += 10;
        eatSound.play();
    } else if (map[tileY][tileX] === 'P') {
        map[tileY][tileX] = ' ';
        player.score += 50;
        powerUpSound.play();
        powerUpActive = true;
        powerUpTimer = POWER_UP_DURATION;
        ghosts.forEach(ghost => ghost.vulnerable = true);
    }

    checkWin();

    ghosts.forEach(ghost => {
        ghost.anim = (ghost.anim + 0.3) % 10;

        if (Math.random() < GHOST_UPDATE_TARGET_FREQ) {
            if (ghost.vulnerable) {
                const dxToPlayer = player.x - ghost.x;
                const dyToPlayer = player.y - ghost.y;
                ghost.targetX = ghost.x - dxToPlayer;
                ghost.targetY = ghost.y - dyToPlayer;
            } else {
                if (ghost.color === 'red') {
                    ghost.targetX = player.x;
                    ghost.targetY = player.y;
                } else if (ghost.color === 'pink') {
                    const aheadX = player.dx === 0 ? player.x + (Math.random() > 0.5 ? 4 : -4) : player.x + player.dx * 2 / TILE_SIZE;
                    const aheadY = player.dy === 0 ? player.y + (Math.random() > 0.5 ? 4 : -4) : player.y + player.dy * 2 / TILE_SIZE;
                    ghost.targetX = aheadX;
                    ghost.targetY = aheadY;
                } else if (ghost.color === 'lime') {
                    if (Math.random() < 0.6) {
                        ghost.targetX = Math.random() * (map[0].length - 2) + 1;
                        ghost.targetY = Math.random() * (map.length - 2) + 1;
                    } else {
                        const nearestCross = findNearestCrossroad(ghost.x, ghost.y);
                        ghost.targetX = nearestCross.x;
                        ghost.targetY = nearestCross.y;
                    }
                }
            }
        }

        const directions = [
            { dx: GHOST_SPEED, dy: 0 },
            { dx: -GHOST_SPEED, dy: 0 },
            { dx: 0, dy: GHOST_SPEED },
            { dx: 0, dy: -GHOST_SPEED }
        ];

        let validDirs = directions.filter(dir =>
            canMove(ghost.x + dir.dx / TILE_SIZE, ghost.y + dir.dy / TILE_SIZE)
        );

        const nextX = ghost.x + ghost.dx / TILE_SIZE;
        const nextY = ghost.y + ghost.dy / TILE_SIZE;
        const isMoving = canMove(nextX, nextY);

        if (!isMoving) ghost.stuckCounter++;
        else ghost.stuckCounter = 0;

        if (validDirs.length > 0 && (isCloseToAligned(ghost.x) && isCloseToAligned(ghost.y) || ghost.stuckCounter > 5)) {
            let bestDir = validDirs[0];
            let minDist = Infinity;

            validDirs = validDirs.filter(dir =>
                !(dir.dx === -ghost.dx && dir.dy === -ghost.dy) || validDirs.length === 1
            );

            const inDeadEnd = isDeadEnd(ghost.x, ghost.y, ghost.dx, ghost.dy);

            validDirs.forEach(dir => {
                const nextX = ghost.x + dir.dx / TILE_SIZE;
                const nextY = ghost.y + dir.dy / TILE_SIZE;
                const dist = Math.hypot(nextX - ghost.targetX, nextY - ghost.targetY);
                const stuckPenalty = ghost.stuckCounter > 5 && dir.dx === ghost.dx && dir.dy === ghost.dy ? 100 : 0;
                const deadEndPenalty = inDeadEnd && (dir.dx === ghost.dx && dir.dy === ghost.dy) ? 200 : 0;

                if (dist + stuckPenalty + deadEndPenalty < minDist) {
                    minDist = dist + stuckPenalty + deadEndPenalty;
                    bestDir = dir;
                }
            });

            const randomChance = ghost.vulnerable ? 0.7 : (ghost.stuckCounter > 5 || inDeadEnd ? 0.8 : 0.3);
            if (Math.random() < randomChance && validDirs.length > 1) {
                bestDir = validDirs[Math.floor(Math.random() * validDirs.length)];
            }

            ghost.dx = bestDir.dx;
            ghost.dy = bestDir.dy;
        }

        if (isMoving) {
            ghost.x = nextX;
            ghost.y = nextY;
        } else if (ghost.stuckCounter > 10) {
            const randomDir = validDirs[Math.floor(Math.random() * validDirs.length)];
            ghost.dx = randomDir.dx;
            ghost.dy = randomDir.dy;
            ghost.stuckCounter = 0;
        }

        if (Math.hypot(ghost.x - player.x, ghost.y - player.y) < COLLISION_DISTANCE) {
            if (ghost.vulnerable) {
                ghost.x = 18; ghost.y = 1;
                player.score += 200;
                eatGhostSound.play();
            } else {
                gameOver = true;
                loseSound.play();
            }
        }
    });
}

// Перевірка перемоги
function checkWin() {
    const dotsLeft = map.flat().filter(cell => cell === '.' || cell === 'P').length;
    if (dotsLeft === 0) {
        gameWon = true;
    }
}

// Пошук найближчого перехрестя
function findNearestCrossroad(x, y) {
    const tileX = Math.floor(x);
    const tileY = Math.floor(y);
    let closest = { x: tileX, y: tileY, dist: Infinity };

    for (let i = 0; i < map.length; i++) {
        for (let j = 0; j < map[0].length; j++) {
            if (map[i][j] !== '#') {
                const openDirs = [
                    canMove(j + 1, i),
                    canMove(j - 1, i),
                    canMove(j, i + 1),
                    canMove(j, i - 1)
                ].filter(Boolean).length;

                if (openDirs > 2) {
                    const dist = Math.hypot(j - tileX, i - tileY);
                    if (dist < closest.dist) {
                        closest = { x: j, y: i, dist: dist };
                    }
                }
            }
        }
    }
    return closest;
}

// Рендеринг
function drawMap() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    map.forEach((row, y) => {
        row.forEach((cell, x) => {
            if (cell === '#') {
                ctx.fillStyle = 'blue';
                ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            } else if (cell === '.') {
                ctx.fillStyle = 'white';
                ctx.beginPath();
                ctx.arc(x * TILE_SIZE + TILE_SIZE / 2, y * TILE_SIZE + TILE_SIZE / 2, 3, 0, Math.PI * 2);
                ctx.fill();
            } else if (cell === 'P') {
                ctx.fillStyle = 'orange';
                ctx.beginPath();
                ctx.arc(x * TILE_SIZE + TILE_SIZE / 2, y * TILE_SIZE + TILE_SIZE / 2, 8, 0, Math.PI * 2);
                ctx.fill();
            }
        });
    });
}

function drawPlayer() {
    const playerX = player.x * TILE_SIZE + TILE_SIZE / 2;
    const playerY = player.y * TILE_SIZE + TILE_SIZE / 2;
    const mouthAngle = Math.max(0, Math.sin(player.mouth)) * (Math.PI / 4);

    // Вибираємо зображення залежно від напрямку
    const headImg = player.direction === 2 ? headbImage : headImage;
    const butImg = player.direction === 2 ? butbImage : butImage;

    ctx.save();
    ctx.translate(playerX, playerY);
    switch (player.direction) {
        case 0: ctx.rotate(0); break;           // Вправо
        case 1: ctx.rotate(Math.PI / 2); break; // Вниз
        case 2: ctx.rotate(Math.PI); break;     // Вліво
        case 3: ctx.rotate(3 * Math.PI / 2); break; // Вгору
    }

    // Нижня щелепа: малюється першою
    ctx.save();
    ctx.translate(0, 0);
    ctx.rotate(mouthAngle);
    ctx.drawImage(butImg, -TILE_SIZE / 2, 0, TILE_SIZE, TILE_SIZE / 2);
    ctx.restore();

    // Верхня щелепа: малюється другою, щоб бути зверху
    ctx.save();
    ctx.translate(0, -TILE_SIZE / 2);
    ctx.translate(0, TILE_SIZE / 2);
    ctx.rotate(-mouthAngle);
    ctx.translate(0, -TILE_SIZE / 2);
    ctx.drawImage(headImg, -TILE_SIZE / 2, 0, TILE_SIZE, TILE_SIZE / 2);
    ctx.restore();

    ctx.restore();
}

function drawGhosts() {
    ghosts.forEach(ghost => {
        const ghostX = ghost.x * TILE_SIZE + TILE_SIZE / 2;
        const ghostY = ghost.y * TILE_SIZE + TILE_SIZE / 2;

        ctx.fillStyle = ghost.vulnerable ? '#00BFFF' : ghost.color;
        ctx.beginPath();
        ctx.arc(ghostX, ghostY, TILE_SIZE / 2, Math.PI, 0);
        ctx.moveTo(ghostX - TILE_SIZE / 2, ghostY);
        for (let i = 0; i <= TILE_SIZE; i += TILE_SIZE / 4) {
            const yOffset = Math.sin(ghost.anim + i / 5) * 5;
            ctx.lineTo(ghostX - TILE_SIZE / 2 + i, ghostY + TILE_SIZE / 2 + yOffset);
        }
        ctx.lineTo(ghostX + TILE_SIZE / 2, ghostY);
        ctx.fill();

        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(ghostX - TILE_SIZE / 6, ghostY - TILE_SIZE / 6, TILE_SIZE / 6, 0, Math.PI * 2);
        ctx.arc(ghostX + TILE_SIZE / 6, ghostY - TILE_SIZE / 6, TILE_SIZE / 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(ghostX - TILE_SIZE / 6, ghostY - TILE_SIZE / 6, TILE_SIZE / 12, 0, Math.PI * 2);
        ctx.arc(ghostX + TILE_SIZE / 6, ghostY - TILE_SIZE / 6, TILE_SIZE / 12, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawUI() {
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${player.score}`, 10, 20);

    if (gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '60px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 50);
        ctx.font = '30px Arial';
        ctx.fillText(`Your Score: ${player.score}`, canvas.width / 2, canvas.height / 2 + 20);
        ctx.font = '20px Arial';
        ctx.fillText('Press Enter, Space or Tap to Restart', canvas.width / 2, canvas.height / 2 + 80);
    } else if (gameWon) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '60px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('You Won!', canvas.width / 2, canvas.height / 2 - 50);
        ctx.font = '30px Arial';
        ctx.fillText(`Your Score: ${player.score}`, canvas.width / 2, canvas.height / 2 + 20);
        ctx.font = '20px Arial';
        ctx.fillText('Press Enter, Space or Tap to Restart', canvas.width / 2, canvas.height / 2 + 80);
    }
}

function draw() {
    drawMap();
    drawPlayer();
    drawGhosts();
    drawUI();
}

// Основний цикл гри
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Перевірка, чи завантажилися зображення перед запуском гри
Promise.all([
    new Promise(resolve => headImage.onload = resolve),
    new Promise(resolve => butImage.onload = resolve),
    new Promise(resolve => headbImage.onload = resolve),
    new Promise(resolve => butbImage.onload = resolve)
]).then(() => {
    resetGame();
    gameLoop();
}).catch(err => console.error('Failed to load images:', err));
