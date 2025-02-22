const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
document.body.appendChild(canvas);
canvas.width = 600;
canvas.height = 600;

const tileSize = 30;
const rows = map.length;
const cols = map[0].length;

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

function drawMap() {
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (map[y] && map[y][x] !== undefined) {
        ctx.fillStyle = map[y][x] === 1 ? "blue" : "black";
        ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
      }
    }
  }
}

document.addEventListener("keydown", (event) => {
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
    pacman.nextMove = event.key;
  }
});

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawMap();
  requestAnimationFrame(gameLoop);
}

gameLoop();
