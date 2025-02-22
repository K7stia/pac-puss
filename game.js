const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
document.body.appendChild(canvas);
canvas.width = 600;
canvas.height = 600;

document.body.style.textAlign = 'center';
const TILE_SIZE = 30;
const PLAYER_SPEED = 2;
const GHOST_SPEED = 1.5;

const map = [
    '####################',
    '#......#...........#',
    '#.#.##.#.#.#######.#',
    '#.#.#....##......#.#',
    '#.#.##.#.#.#.#####.#',
    '#.#....#.#..#....#.#', // L
    '#.####.#.#...#.###.#', // I N   P
    '#........#.#.#.#...#', // N   U
    '#.####.#.#.#.#.###.#', //     S S
    '#....#.#.#.#.#.#...#', //
    '#.##.#.#.#.###.#...#', //
    '#..#.#.#.....#.....#',
    '#.##.#.#####.#.###.#',
    '#........#.....#...#',
    '####################'
].map(row => row.split(''));

let player = { 
    x: 1, 
    y: 1, 
    dx: 0, 
    dy: 0, 
    score: 0, 
    mouth: 0,
    direction: 0,
    nextDx: 0,
    nextDy: 0
};

let ghosts = [
    { x: 18, y: 1, dx: -GHOST_SPEED, dy: 0, color: 'red', anim: 0, targetX: 1, targetY: 1 },
    { x: 18, y: 13, dx: -GHOST_SPEED, dy: 0, color: 'pink', anim: 0, targetX: 1, targetY: 1 }
];

let gameOver = false;

document.addEventListener('keydown', (e) => {
    if (gameOver) {
        if (e.key === 'Enter') {
            // Перезапуск гри після натискання Enter
            gameOver = false;
            player.x = 1;
            player.y = 1;
            player.dx = 0;
            player.dy = 0;
            player.nextDx = 0;
            player.nextDy = 0;
            player.score = 0;
            ghosts = [
                { x: 18, y: 1, dx: -GHOST_SPEED, dy: 0, color: 'red', anim: 0, targetX: 1, targetY: 1 },
                { x: 18, y: 13, dx: -GHOST_SPEED, dy: 0, color: 'pink', anim: 0, targetX: 1, targetY: 1 }
            ];
            map.forEach((row, y) => {
                row.forEach((cell, x) => {
                    if (cell === ' ') map[y][x] = '.'; // Відновлення точок
                });
            });
        }
        return;
    }
    switch(e.key) {
        case 'ArrowUp': player.nextDx = 0; player.nextDy = -PLAYER_SPEED; player.direction = 3; break;
        case 'ArrowDown': player.nextDx = 0; player.nextDy = PLAYER_SPEED; player.direction = 1; break;
        case 'ArrowLeft': player.nextDx = -PLAYER_SPEED; player.nextDy = 0; player.direction = 2; break;
        case 'ArrowRight': player.nextDx = PLAYER_SPEED; player.nextDy = 0; player.direction = 0; break;
    }
});

function canMove(x, y, size = 0.9) {
    const tileX = Math.floor(x);
    const tileY = Math.floor(y);
    return map[tileY] && 
           map[tileY][tileX] !== '#' &&
           map[Math.floor(y + size)][Math.floor(x + size)] !== '#' &&
           map[Math.floor(y + size)][tileX] !== '#' &&
           map[tileY][Math.floor(x + size)] !== '#';
}

function isCloseToAligned(pos) {
    return Math.abs(pos - Math.round(pos)) < 0.2;
}

function update() {
    if (gameOver) return;

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
    
    player.mouth = (player.mouth + 0.5) % 20;
    
    const tileX = Math.floor(player.x);
    const tileY = Math.floor(player.y);
    if (map[tileY][tileX] === '.') {
        map[tileY][tileX] = ' ';
        player.score += 10;
    }
    
    ghosts.forEach(ghost => {
        ghost.anim = (ghost.anim + 0.3) % 10;
        ghost.targetX = ghost.color === 'pink' ? 
            player.x + player.dx * 2 / TILE_SIZE : player.x;
        ghost.targetY = ghost.color === 'pink' ? 
            player.y + player.dy * 2 / TILE_SIZE : player.y;
        
        const directions = [
            { dx: GHOST_SPEED, dy: 0 },
            { dx: -GHOST_SPEED, dy: 0 },
            { dx: 0, dy: GHOST_SPEED },
            { dx: 0, dy: -GHOST_SPEED }
        ];
        
        let validDirs = directions.filter(dir => 
            canMove(ghost.x + dir.dx / TILE_SIZE, ghost.y + dir.dy / TILE_SIZE)
        );
        
        if (validDirs.length > 0 && isCloseToAligned(ghost.x) && isCloseToAligned(ghost.y)) {
            let bestDir = validDirs[0];
            let minDist = Infinity;
            
            validDirs.forEach(dir => {
                const nextX = ghost.x + dir.dx / TILE_SIZE;
                const nextY = ghost.y + dir.dy / TILE_SIZE;
                const dist = Math.hypot(nextX - ghost.targetX, nextY - ghost.targetY);
                if (dist < minDist) {
                    minDist = dist;
                    bestDir = dir;
                }
            });
            
            if (Math.random() < 0.2 && validDirs.length > 1) {
                bestDir = validDirs[Math.floor(Math.random() * validDirs.length)];
            }
            
            ghost.dx = bestDir.dx;
            ghost.dy = bestDir.dy;
        }
        
        const nextX = ghost.x + ghost.dx / TILE_SIZE;
        const nextY = ghost.y + ghost.dy / TILE_SIZE;
        if (canMove(nextX, nextY)) {
            ghost.x = nextX;
            ghost.y = nextY;
        } else {
            ghost.dx = 0;
            ghost.dy = 0;
        }
        
        if (Math.hypot(ghost.x - player.x, ghost.y - player.y) < 0.8) {
            gameOver = true;
        }
    });
}

function draw() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    if (gameOver) {
        // Екран завершення гри
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = 'white';
        ctx.font = '60px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 50);
        
        ctx.font = '40px Arial';
        ctx.fillText(`Score: ${player.score}`, canvas.width / 2, canvas.height / 2 + 20);
        
        ctx.font = '20px Arial';
        ctx.fillText('Press Enter to Restart', canvas.width / 2, canvas.height / 2 + 80);
        return;
    }
    
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
            }
        });
    });
    
    ctx.fillStyle = 'yellow';
    ctx.beginPath();
    const playerX = player.x * TILE_SIZE + TILE_SIZE / 2;
    const playerY = player.y * TILE_SIZE + TILE_SIZE / 2;
    let startAngle, endAngle;
    
    switch(player.direction) {
        case 0: startAngle = player.mouth * 0.1; endAngle = -player.mouth * 0.1; break;
        case 1: startAngle = Math.PI/2 + player.mouth * 0.1; endAngle = Math.PI/2 - player.mouth * 0.1; break;
        case 2: startAngle = Math.PI + player.mouth * 0.1; endAngle = Math.PI - player.mouth * 0.1; break;
        case 3: startAngle = -Math.PI/2 + player.mouth * 0.1; endAngle = -Math.PI/2 - player.mouth * 0.1; break;
    }
    
    ctx.arc(playerX, playerY, TILE_SIZE / 2, startAngle, endAngle);
    ctx.lineTo(playerX, playerY);
    ctx.fill();
    
    ghosts.forEach(ghost => {
        const ghostX = ghost.x * TILE_SIZE + TILE_SIZE / 2;
        const ghostY = ghost.y * TILE_SIZE + TILE_SIZE / 2;
        
        ctx.fillStyle = ghost.color;
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
    
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${player.score}`, 10, 20);
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
