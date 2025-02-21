const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
document.body.appendChild(canvas);
canvas.width = 600;
canvas.height = 600;

const tileSize = 30;
const rows = 20;
const cols = 20;

let pacman = { x: 1, y: 1, dirX: 0, dirY: 0, mouthOpen: 0, nextMove: null };
let score = 0;

const ghosts = [
  { x: 10, y: 1, dirX: 1, dirY: 0, color: "red", moveDelay: 0 },
  { x: 15, y: 3, dirX: -1, dirY: 0, color: "pink", moveDelay: 0 }
];

const map = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,1,1,2,1,2,1,1,2,1,2,1,1,1,1,2,1],
  [1,2,1,0,0,1,2,1,2,2,2,2,1,2,1,0,0,1,2,1],
  [1,2,1,0,0,1,2,1,1,1,1,1,1,2,1,0,0,1,2,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,1,1,1,1,1,2,1,1,1,1,1,1,2,1,1,1,1,1,1],
  [1,2,1,2,2,2,2,2,3,1,1,3,2,2,2,2,2,1,2,1],
  [1,2,1,1,1,1,2,1,2,1,1,2,1,2,1,1,1,1,2,1],
  [1,2,2,2,2,2,2,1,2,2,2,2,1,2,2,2,2,2,2,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

document.addEventListener("keydown", (event) => {
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
    pacman.nextMove = event.key;
  }
});

function movePacman() {
  if (pacman.nextMove) {
    let newX = pacman.x;
    let newY = pacman.y;
    if (pacman.nextMove === "ArrowUp") { newY--; }
    else if (pacman.nextMove === "ArrowDown") { newY++; }
    else if (pacman.nextMove === "ArrowLeft") { newX--; }
    else if (pacman.nextMove === "ArrowRight") { newX++; }
    
    if (map[newY] && map[newY][newX] !== 1) {
      pacman.x = newX;
      pacman.y = newY;
    }
    pacman.nextMove = null;
  }
}

function moveGhosts() {
  ghosts.forEach(ghost => {
    ghost.moveDelay++;
    if (ghost.moveDelay % 20 !== 0) return;
    
    let possibleMoves = [
      { dx: 1, dy: 0 },
      { dx: -1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: 0, dy: -1 }
    ].filter(move => {
      let nx = ghost.x + move.dx;
      let ny = ghost.y + move.dy;
      return map[ny] && map[ny][nx] !== 1;
    });
    
    if (possibleMoves.length > 0) {
      let move = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
      ghost.x += move.dx;
      ghost.y += move.dy;
    }
  });
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawMap();
  movePacman();
  moveGhosts();
  requestAnimationFrame(gameLoop);
}

gameLoop();
