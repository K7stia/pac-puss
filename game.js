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
    direction: 0
};

let ghosts = [
    { x: 18, y: 1, dx: -GHOST_SPEED, dy: 0, color: 'red', anim: 0 },
    { x: 18, y: 13, dx: -GHOST_SPEED, dy: 0, color: 'pink', anim: 0 }
];

document.addEventListener('keydown', (e) => {
    switch(e.key) {
        case 'ArrowUp': player.dx = 0; player.dy = -PLAYER_SPEED; player.direction = 3; break;
        case 'ArrowDown': player.dx = 0; player.dy = PLAYER_SPEED; player.direction = 1; break;
        case 'ArrowLeft': player.dx = -PLAYER_SPEED; player.dy = 0; player.direction = 2; break;
        case 'ArrowRight': player.dx = PLAYER_SPEED; player.dy = 0; player.direction = 0; break;
    }
});

function canMove(x, y, size = 0.8) {
    const tileX = Math.floor(x);
    const tileY = Math.floor(y);
    return map[tileY] && 
           map[tileY][tileX] !== '#' &&
           map[Math.floor(y + size)][Math.floor(x + size)] !== '#' &&
           map[Math.floor(y + size)][tileX] !== '#' &&
           map[tileY][Math.floor(x + size)] !== '#';
}

function alignToGrid(pos) {
    // Вирівнювання до найближчої сітки
    return Math.round(pos * 10) / 10;
}

function update() {
    // Оновлення гравця з вирівнюванням
    let newX = player.x + player.dx / TILE_SIZE;
    let newY = player.y + player.dy / TILE_SIZE;
    
    if (player.dx !== 0) newY = alignToGrid(player.y);
    if (player.dy !== 0) newX = alignToGrid(player.x);
    
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
    
    // Оновлення привидів
    ghosts.forEach(ghost => {
        ghost.anim = (ghost.anim + 0.3) % 10;
        
        const directions = [
            { dx: GHOST_SPEED, dy: 0 },
            { dx: -GHOST_SPEED, dy: 0 },
            { dx: 0, dy: GHOST_SPEED },
            { dx: 0, dy: -GHOST_SPEED }
        ];
        
        let validDirs = directions.filter(dir => 
            canMove(ghost.x + dir.dx / TILE_SIZE, ghost.y + dir.dy / TILE_SIZE)
        );
        
        if (validDirs.length === 0) {
            ghost.dx = -ghost.dx;
            ghost.dy = -ghost.dy;
        } else {
            let bestDir = null;
            let minDist = Infinity;
            
            validDirs.forEach(dir => {
                const nextX = ghost.x + dir.dx / TILE_SIZE;
                const nextY = ghost.y + dir.dy / TILE_SIZE;
                const dist = Math.hypot(nextX - player.x, nextY - player.y);
                if (dist < minDist) {
                    minDist = dist;
                    bestDir = dir;
                }
            });
            
            if (Math.random() < 0.3 && validDirs.length > 1) {
                bestDir = validDirs[Math.floor(Math.random() * validDirs.length)];
            }
            
            if (bestDir) {
                ghost.dx = bestDir.dx;
                ghost.dy = bestDir.dy;
            }
            
            const nextX = ghost.x + ghost.dx / TILE_SIZE;
            const nextY = ghost.y + ghost.dy / TILE_SIZE;
            if (canMove(nextX, nextY)) {
                ghost.x = nextX;
                ghost.y = nextY;
            }
        }
        
        if (Math.hypot(ghost.x - player.x, ghost.y - player.y) < 0.8) {
            alert(`Game Over! Score: ${player.score}`);
            player.x = 1;
            player.y = 1;
            player.dx = 0;
            player.dy = 0;
            player.score = 0;
            ghosts = [
                { x: 18, y: 1, dx: -GHOST_SPEED, dy: 0, color: 'red', anim: 0 },
                { x: 18, y: 13, dx: -GHOST_SPEED, dy: 0, color: 'pink', anim: 0 }
            ];
        }
    });
}

function draw() {
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
    
    // Малювання привидів з анімацією
    ghosts.forEach(ghost => {
        const ghostX = ghost.x * TILE_SIZE + TILE_SIZE / 2;
        const ghostY = ghost.y * TILE_SIZE + TILE_SIZE / 2;
        
        ctx.fillStyle = ghost.color;
        ctx.beginPath();
        
        // Верхня частина (півколо)
        ctx.arc(ghostX, ghostY, TILE_SIZE / 2, Math.PI, 0);
        
        // Нижня частина з хвилеподібною анімацією
        ctx.moveTo(ghostX - TILE_SIZE / 2, ghostY);
        for (let i = 0; i <= TILE_SIZE; i += TILE_SIZE / 4) {
            const yOffset = Math.sin(ghost.anim + i / 5) * 5;
            ctx.lineTo(ghostX - TILE_SIZE / 2 + i, ghostY + TILE_SIZE / 2 + yOffset);
        }
        ctx.lineTo(ghostX + TILE_SIZE / 2, ghostY);
        ctx.fill();
        
        // Очі
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
    ctx.fillText(`Score: ${player.score}`, 10, 20);
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
