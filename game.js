const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
document.body.appendChild(canvas);
canvas.width = 600;
canvas.height = 600;

document.body.style.textAlign = 'center';
const TILE_SIZE = 30;
const MAP_SIZE = 20;
const PLAYER_SPEED = 2;
const GHOST_SPEED = 1.5;

const map = [
    '####################',
    '#........#.........#',
    '#.####.#.#.#######.#',
    '#.#....#.#.#.......#',
    '#.#.##.#.#.#.#####.#',
    '#.#....#.#.#.......#',
    '#.####.#.#.#######.#',
    '#........#.........#',
    '####################'
].map(row => row.split(''));

let player = { x: 1, y: 1, dx: 0, dy: 0, score: 0 };
let ghosts = [{ x: 10, y: 10, dx: 1, dy: 0 }];

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') { player.dx = 0; player.dy = -PLAYER_SPEED; }
    if (e.key === 'ArrowDown') { player.dx = 0; player.dy = PLAYER_SPEED; }
    if (e.key === 'ArrowLeft') { player.dx = -PLAYER_SPEED; player.dy = 0; }
    if (e.key === 'ArrowRight') { player.dx = PLAYER_SPEED; player.dy = 0; }
});

function update() {
    let newX = player.x + player.dx / TILE_SIZE;
    let newY = player.y + player.dy / TILE_SIZE;
    if (map[Math.floor(newY)][Math.floor(newX)] !== '#') {
        player.x = newX;
        player.y = newY;
    }

    ghosts.forEach(ghost => {
        let nextX = ghost.x + ghost.dx / TILE_SIZE;
        let nextY = ghost.y + ghost.dy / TILE_SIZE;
        if (map[Math.floor(nextY)][Math.floor(nextX)] === '#') {
            ghost.dx = -ghost.dx;
            ghost.dy = -ghost.dy;
        } else {
            ghost.x = nextX;
            ghost.y = nextY;
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
            }
        });
    });
    
    ctx.fillStyle = 'yellow';
    ctx.beginPath();
    ctx.arc(player.x * TILE_SIZE + TILE_SIZE / 2, player.y * TILE_SIZE + TILE_SIZE / 2, TILE_SIZE / 2, 0.2 * Math.PI, 1.8 * Math.PI);
    ctx.lineTo(player.x * TILE_SIZE + TILE_SIZE / 2, player.y * TILE_SIZE + TILE_SIZE / 2);
    ctx.fill();
    
    ghosts.forEach(ghost => {
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(ghost.x * TILE_SIZE + TILE_SIZE / 2, ghost.y * TILE_SIZE + TILE_SIZE / 2, TILE_SIZE / 2, 0, Math.PI * 2);
        ctx.fill();
    });
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}
gameLoop();
