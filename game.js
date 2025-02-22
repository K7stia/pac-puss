const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
document.body.appendChild(canvas);
canvas.width = 600;
canvas.height = 600;

document.body.style.textAlign = 'center';
const TILE_SIZE = 30;
const PLAYER_SPEED = 2;
const GHOST_SPEED = 1.5;

// Карта з виправленими розмірами для відповідності canvas
const map = [
    '####################',
    '#........#.........#',
    '#.####.#.#.#######.#',
    '#.#....#.#.#.....#.#',
    '#.#.##.#.#.#.#####.#',
    '#.#..#.#.#.#.....#.#',
    '#.####.#.#.#######.#',
    '#......#...........#',
    '#.####.#.#########.#',
    '#....#.#.........#.#',
    '#.##.#.#.#######.#.#',
    '#..#.#.#.....#...#.#',
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
    direction: 0 // 0: right, 1: down, 2: left, 3: up
};

let ghosts = [
    { x: 18, y: 1, dx: -GHOST_SPEED, dy: 0, color: 'red' },
    { x: 18, y: 13, dx: -GHOST_SPEED, dy: 0, color: 'pink' }
];

document.addEventListener('keydown', (e) => {
    switch(e.key) {
        case 'ArrowUp': 
            player.dx = 0; 
            player.dy = -PLAYER_SPEED; 
            player.direction = 3;
            break;
        case 'ArrowDown': 
            player.dx = 0; 
            player.dy = PLAYER_SPEED; 
            player.direction = 1;
            break;
        case 'ArrowLeft': 
            player.dx = -PLAYER_SPEED; 
            player.dy = 0; 
            player.direction = 2;
            break;
        case 'ArrowRight': 
            player.dx = PLAYER_SPEED; 
            player.dy = 0; 
            player.direction = 0;
            break;
    }
});

function canMove(x, y) {
    const tileX = Math.floor(x);
    const tileY = Math.floor(y);
    // Перевіряємо всі кути об'єкта
    return map[tileY] && 
           map[tileY][tileX] !== '#' &&
           map[Math.floor(y + 0.9)][Math.floor(x + 0.9)] !== '#' &&
           map[Math.floor(y + 0.9)][tileX] !== '#' &&
           map[tileY][Math.floor(x + 0.9)] !== '#';
}

function update() {
    // Оновлення гравця
    let newX = player.x + player.dx / TILE_SIZE;
    let newY = player.y + player.dy / TILE_SIZE;
    
    if (canMove(newX, newY)) {
        player.x = newX;
        player.y = newY;
    }
    
    // Анімація рота
    player.mouth = (player.mouth + 0.5) % 20;
    
    // Збирання точок
    const tileX = Math.floor(player.x);
    const tileY = Math.floor(player.y);
    if (map[tileY][tileX] === '.') {
        map[tileY][tileX] = ' ';
        player.score += 10;
    }
    
    // Оновлення привидів з розумнішим рухом
    ghosts.forEach(ghost => {
        const directions = [
            { dx: GHOST_SPEED, dy: 0 },
            { dx: -GHOST_SPEED, dy: 0 },
            { dx: 0, dy: GHOST_SPEED },
            { dx: 0, dy: -GHOST_SPEED }
        ];
        
        let bestDir = null;
        let minDist = Infinity;
        
        directions.forEach(dir => {
            const nextX = ghost.x + dir.dx / TILE_SIZE;
            const nextY = ghost.y + dir.dy / TILE_SIZE;
            if (canMove(nextX, nextY)) {
                const dist = Math.hypot(nextX - player.x, nextY - player.y);
                if (dist < minDist) {
                    minDist = dist;
                    bestDir = dir;
                }
            }
        });
        
        // 30% шанс випадкового руху
        if (Math.random() < 0.3) {
            const validDirs = directions.filter(dir => 
                canMove(ghost.x + dir.dx / TILE_SIZE, ghost.y + dir.dy / TILE_SIZE)
            );
            if (validDirs.length > 0) {
                bestDir = validDirs[Math.floor(Math.random() * validDirs.length)];
            }
        }
        
        if (bestDir) {
            ghost.dx = bestDir.dx;
            ghost.dy = bestDir.dy;
            ghost.x += ghost.dx / TILE_SIZE;
            ghost.y += ghost.dy / TILE_SIZE;
        }
        
        // Перевірка зіткнення
        if (Math.hypot(ghost.x - player.x, ghost.y - player.y) < 0.8) {
            alert(`Game Over! Score: ${player.score}`);
            player.x = 1;
            player.y = 1;
            player.dx = 0;
            player.dy = 0;
            player.score = 0;
            ghosts = [
                { x: 18, y: 1, dx: -GHOST_SPEED, dy: 0, color: 'red' },
                { x: 18, y: 13, dx: -GHOST_SPEED, dy: 0, color: 'pink' }
            ];
        }
    });
}

function draw() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Малювання карти
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
    
    // Малювання гравця з напрямком рота
    ctx.fillStyle = 'yellow';
    ctx.beginPath();
    const playerX = player.x * TILE_SIZE + TILE_SIZE / 2;
    const playerY = player.y * TILE_SIZE + TILE_SIZE / 2;
    let startAngle, endAngle;
    
    switch(player.direction) {
        case 0: // right
            startAngle = player.mouth * 0.1;
            endAngle = -player.mouth * 0.1;
            break;
        case 1: // down
            startAngle = Math.PI/2 + player.mouth * 0.1;
            endAngle = Math.PI/2 - player.mouth * 0.1;
            break;
        case 2: // left
            startAngle = Math.PI + player.mouth * 0.1;
            endAngle = Math.PI - player.mouth * 0.1;
            break;
        case 3: // up
            startAngle = -Math.PI/2 + player.mouth * 0.1;
            endAngle = -Math.PI/2 - player.mouth * 0.1;
            break;
    }
    
    ctx.arc(playerX, playerY, TILE_SIZE / 2, startAngle, endAngle);
    ctx.lineTo(playerX, playerY);
    ctx.fill();
    
    // Малювання привидів
    ghosts.forEach(ghost => {
        ctx.fillStyle = ghost.color;
        ctx.beginPath();
        ctx.arc(ghost.x * TILE_SIZE + TILE_SIZE / 2, 
                ghost.y * TILE_SIZE + TILE_SIZE / 2, 
                TILE_SIZE / 2, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // Відображення рахунку
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${player.score}`, 10, 20);
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
