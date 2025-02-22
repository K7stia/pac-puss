const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
document.body.appendChild(canvas);
canvas.width = 600;
canvas.height = 600;

document.body.style.textAlign = 'center';
const TILE_SIZE = 30;
const PLAYER_SPEED = 2;
const GHOST_SPEED = 1.5;
let powerMode = false;
let powerTimer = 0;

const map = [
    '####################',
    '#........#.........#',
    '#.####.#.#.#######.#',
    '#.#....#.#.#.....#.#',
    '#.#.##.#.#.#.#####.#',
    '#.#..#.#.#.#.....#.#',
    '#.####.#.#.#######.#',
    '#......#.....O.....#',
    '#.####.#.#########.#',
    '#....#.#.........#.#',
    '#.##.#.#.#######.#.#',
    '#..#.#.#.....#...#.#',
    '#.##.#.#####.#.###.#',
    '#....O...#.....O...#',
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
    { x: 18, y: 1, dx: -GHOST_SPEED, dy: 0, color: 'red', anim: 0, targetX: 1, targetY: 1, frightened: false },
    { x: 18, y: 13, dx: -GHOST_SPEED, dy: 0, color: 'pink', anim: 0, targetX: 1, targetY: 1, frightened: false }
];

document.addEventListener('keydown', (e) => {
    switch(e.key) {
        case 'ArrowUp': player.nextDx = 0; player.nextDy = -PLAYER_SPEED; player.direction = 3; break;
        case 'ArrowDown': player.nextDx = 0; player.nextDy = PLAYER_SPEED; player.direction = 1; break;
        case 'ArrowLeft': player.nextDx = -PLAYER_SPEED; player.nextDy = 0; player.direction = 2; break;
        case 'ArrowRight': player.nextDx = PLAYER_SPEED; player.nextDy = 0; player.direction = 0; break;
    }
});

function update() {
    let newX = player.x + player.dx / TILE_SIZE;
    let newY = player.y + player.dy / TILE_SIZE;
    if (map[Math.floor(newY)] && map[Math.floor(newY)][Math.floor(newX)] !== '#') {
        player.x = newX;
        player.y = newY;
        player.mouth = (player.mouth + 1) % 20;
        if (map[Math.floor(newY)][Math.floor(newX)] === '.') {
            map[Math.floor(newY)][Math.floor(newX)] = ' ';
            player.score += 10;
        } else if (map[Math.floor(newY)][Math.floor(newX)] === 'O') {
            map[Math.floor(newY)][Math.floor(newX)] = ' ';
            powerMode = true;
            powerTimer = 300;
            ghosts.forEach(g => g.frightened = true);
        }
    }
    
    if (powerMode) {
        powerTimer--;
        if (powerTimer <= 0) {
            powerMode = false;
            ghosts.forEach(g => g.frightened = false);
        }
    }
    
    ghosts.forEach(ghost => {
        if (Math.hypot(ghost.x - player.x, ghost.y - player.y) < 0.8) {
            if (ghost.frightened) {
                player.score += 200;
                ghost.x = 18;
                ghost.y = 1;
            } else {
                alert(`Game Over! Score: ${player.score}`);
                location.reload();
            }
        }
    });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
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
            } else if (cell === 'O') {
                ctx.fillStyle = 'purple';
                ctx.beginPath();
                ctx.arc(x * TILE_SIZE + TILE_SIZE / 2, y * TILE_SIZE + TILE_SIZE / 2, 8, 0, Math.PI * 2);
                ctx.fill();
            }
        });
    });
    ghosts.forEach(ghost => {
        ctx.fillStyle = ghost.frightened ? 'blue' : ghost.color;
        ctx.beginPath();
        ctx.arc(ghost.x * TILE_SIZE + TILE_SIZE / 2, ghost.y * TILE_SIZE + TILE_SIZE / 2, TILE_SIZE / 2, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.fillStyle = 'yellow';
    ctx.beginPath();
    ctx.arc(player.x * TILE_SIZE + TILE_SIZE / 2, player.y * TILE_SIZE + TILE_SIZE / 2, TILE_SIZE / 2, 0.2 * Math.PI, 1.8 * Math.PI);
    ctx.lineTo(player.x * TILE_SIZE + TILE_SIZE / 2, player.y * TILE_SIZE + TILE_SIZE / 2);
    ctx.fill();
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
