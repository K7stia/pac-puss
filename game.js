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

function update() {
  console.log("Pac-Man position:", pacman.x, pacman.y);
  let newX = pacman.x + pacman.dirX;
  let newY = pacman.y + pacman.dirY;
  if (map[newY] && map[newY][newX] !== 1) {
    pacman.x = newX;
    pacman.y = newY;
    if (map[newY][newX] === 0) {
      map[newY][newX] = 2;
      score++;
    }
  }
  pacman.mouthOpen = (pacman.mouthOpen + 1) % 2;
  
  ghosts.forEach(ghost => {
    let newGX = ghost.x + ghost.dirX;
    let newGY = ghost.y + ghost.dirY;
    if (map[newGY] && map[newGY][newGX] !== 1) {
      ghost.x = newGX;
      ghost.y = newGY;
    } else {
      ghost.dirX *= -1;
      ghost.dirY *= -1;
    }
  });
  console.log("Ghost positions:", ghosts);
}

function gameLoop() {
  console.log("Game is running");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawMap();
  drawPacman();
  drawGhosts();
  drawScore();
  update();
  requestAnimationFrame(gameLoop);
}

gameLoop();
