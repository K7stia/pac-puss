const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
document.body.appendChild(canvas);
canvas.width = 500;
canvas.height = 500;

const tileSize = 25;
const rows = canvas.height / tileSize;
const cols = canvas.width / tileSize;

let pacman = { x: 1, y: 1, dirX: 0, dirY: 0, mouthOpen: 0 };
let score = 0;

const ghosts = [
  { x: 10, y: 1, dirX: 1, dirY: 0, color: "red" },
  { x: 15, y: 3, dirX: -1, dirY: 0, color: "pink" }
];

const map = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowUp") {
    pacman.dirX = 0;
    pacman.dirY = -1;
  } else if (event.key === "ArrowDown") {
    pacman.dirX = 0;
    pacman.dirY = 1;
  } else if (event.key === "ArrowLeft") {
    pacman.dirX = -1;
    pacman.dirY = 0;
  } else if (event.key === "ArrowRight") {
    pacman.dirX = 1;
    pacman.dirY = 0;
  }
});

function drawMap() {
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (map[y] && map[y][x] === 1) {
        ctx.fillStyle = "blue";
        ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
      } else {
        ctx.fillStyle = "black";
        ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
      }
    }
  }
}

function drawPacman() {
  ctx.fillStyle = "yellow";
  ctx.beginPath();
  ctx.arc(
    pacman.x * tileSize + tileSize / 2,
    pacman.y * tileSize + tileSize / 2,
    tileSize / 3,
    0.2 * Math.PI,
    1.8 * Math.PI
  );
  ctx.lineTo(pacman.x * tileSize + tileSize / 2, pacman.y * tileSize + tileSize / 2);
  ctx.fill();
}

function drawGhosts() {
  ghosts.forEach(ghost => {
    ctx.fillStyle = ghost.color;
    ctx.beginPath();
    ctx.arc(
      ghost.x * tileSize + tileSize / 2,
      ghost.y * tileSize + tileSize / 2,
      tileSize / 3,
      0,
      Math.PI * 2
    );
    ctx.fill();
  });
}

function drawScore() {
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText("Score: " + score, 10, 20);
}

function update() {
  let newX = pacman.x + pacman.dirX;
  let newY = pacman.y + pacman.dirY;
  if (map[newY] && map[newY][newX] !== 1) {
    pacman.x = newX;
    pacman.y = newY;
  }
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawMap();
  drawPacman();
  drawGhosts();
  drawScore();
  update();
  requestAnimationFrame(gameLoop);
}

gameLoop();
