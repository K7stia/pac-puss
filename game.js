<!DOCTYPE html>
<html>
<head>
    <title>Pac-Man</title>
    <style>
        canvas { border: 1px solid black; }
        #score { font-size: 24px; margin: 10px; }
    </style>
</head>
<body>
    <div id="score">Score: 0</div>
    <canvas id="gameCanvas" width="400" height="400"></canvas>
    
    <script>
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        const scoreDisplay = document.getElementById('score');
        
        const tileSize = 20;
        const rows = canvas.height / tileSize;
        const cols = canvas.width / tileSize;
        
        let score = 0;
        let mouthAngle = 0;
        let mouthDirection = 0.1;
        
        const eatSound = new Audio('https://www.myinstants.com/media/sounds/pacman_chomp.mp3');
        const bonusSound = new Audio('https://www.myinstants.com/media/sounds/pacman_eatfruit.mp3');
        
        let pacman = {
            x: tileSize * 1,
            y: tileSize * 1,
            speed: 2,
            direction: 0
        };
        
        let ghosts = [
            { x: tileSize * 18, y: tileSize * 1, speed: 1.5, color: 'red' },
            { x: tileSize * 18, y: tileSize * 9, speed: 1.5, color: 'pink' }
        ];
        
        const map = [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,1],
            [1,2,1,1,1,1,2,1,2,1,1,2,1,2,1,1,1,1,2,1],
            [1,2,1,0,0,1,2,1,2,2,2,2,1,2,1,0,0,1,2,1],
            [1,2,1,0,0,1,2,1,1,1,1,1,1,2,1,0,0,1,2,1],
            [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
            [1,2,1,1,1,1,2,1,1,1,1,1,1,2,1,1,1,1,2,1],
            [1,2,1,2,2,2,2,2,3,1,1,3,2,2,2,2,2,1,2,1],
            [1,2,1,1,1,1,2,1,2,1,1,2,1,2,1,1,1,1,2,1],
            [1,2,2,2,2,2,2,1,2,2,2,2,1,2,2,2,2,2,2,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ];
        
        let nextDirection = 0;
        
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowRight': nextDirection = 0; break;
                case 'ArrowDown': nextDirection = 1; break;
                case 'ArrowLeft': nextDirection = 2; break;
                case 'ArrowUp': nextDirection = 3; break;
            }
        });
        
        function canMove(x, y) {
            const tileX = Math.floor(x / tileSize);
            const tileY = Math.floor(y / tileSize);
            return map[tileY] && map[tileY][tileX] !== 1;
        }
        
        // Розумний рух привидів
        function moveGhost(ghost) {
            const directions = [
                { x: ghost.speed, y: 0, dir: 0 },  // right
                { x: 0, y: ghost.speed, dir: 1 },  // down
                { x: -ghost.speed, y: 0, dir: 2 }, // left
                { x: 0, y: -ghost.speed, dir: 3 }  // up
            ];
            
            // Знаходимо відстань до Pac-Man
            let bestDirection = null;
            let minDistance = Infinity;
            
            directions.forEach(dir => {
                const nextX = ghost.x + dir.x;
                const nextY = ghost.y + dir.y;
                
                if (canMove(nextX, nextY) && canMove(nextX + tileSize - 1, nextY + tileSize - 1)) {
                    const distance = Math.sqrt(
                        Math.pow(nextX - pacman.x, 2) + 
                        Math.pow(nextY - pacman.y, 2)
                    );
                    if (distance < minDistance) {
                        minDistance = distance;
                        bestDirection = dir;
                    }
                }
            });
            
            // З шансом 30% обираємо випадковий напрямок замість оптимального
            if (Math.random() < 0.3 && directions.length > 1) {
                const validDirections = directions.filter(dir => {
                    const nextX = ghost.x + dir.x;
                    const nextY = ghost.y + dir.y;
                    return canMove(nextX, nextY) && canMove(nextX + tileSize - 1, nextY + tileSize - 1);
                });
                if (validDirections.length > 0) {
                    bestDirection = validDirections[Math.floor(Math.random() * validDirections.length)];
                }
            }
            
            if (bestDirection) {
                ghost.x += bestDirection.x;
                ghost.y += bestDirection.y;
            }
        }
        
        function checkCollision() {
            ghosts.forEach(ghost => {
                const dx = pacman.x - ghost.x;
                const dy = pacman.y - ghost.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < tileSize) {
                    alert('Game Over! Score: ' + score);
                    pacman.x = tileSize * 1;
                    pacman.y = tileSize * 1;
                    score = 0;
                    ghosts = [
                        { x: tileSize * 18, y: tileSize * 1, speed: 1.5, color: 'red' },
                        { x: tileSize * 18, y: tileSize * 9, speed: 1.5, color: 'pink' }
                    ];
                }
            });
        }
        
        function update() {
            // Оновлення Pac-Man з виправленням стін
            const directions = [
                { x: pacman.speed, y: 0 },  // right
                { x: 0, y: pacman.speed },  // down
                { x: -pacman.speed, y: 0 }, // left
                { x: 0, y: -pacman.speed }  // up
            ];
            
            const nextMove = directions[nextDirection];
            const nextX = pacman.x + nextMove.x;
            const nextY = pacman.y + nextMove.y;
            
            // Перевіряємо чи можливий рух у новому напрямку
            if (canMove(nextX, nextY) && 
                canMove(nextX + tileSize - 1, nextY) &&
                canMove(nextX, nextY + tileSize - 1) &&
                canMove(nextX + tileSize - 1, nextY + tileSize - 1)) {
                pacman.direction = nextDirection;
                pacman.x = nextX;
                pacman.y = nextY;
            }
            
            // Збирання точок і бонусів
            const tileX = Math.floor(pacman.x / tileSize);
            const tileY = Math.floor(pacman.y / tileSize);
            if (map[tileY][tileX] === 2) {
                map[tileY][tileX] = 0;
                score += 10;
                eatSound.play();
            } else if (map[tileY][tileX] === 3) {
                map[tileY][tileX] = 0;
                score += 50;
                bonusSound.play();
            }
            
            mouthAngle += mouthDirection;
            if (mouthAngle >= 0.3 || mouthAngle <= 0) mouthDirection = -mouthDirection;
            
            ghosts.forEach(moveGhost);
            checkCollision();
            
            scoreDisplay.textContent = 'Score: ' + score;
        }
        
        function draw() {
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            for (let y = 0; y < map.length; y++) {
                for (let x = 0; x < map[y].length; x++) {
                    if (map[y][x] === 1) {
                        ctx.fillStyle = 'blue';
                        ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
                    } else if (map[y][x] === 2) {
                        ctx.fillStyle = 'white';
                        ctx.fillRect(x * tileSize + tileSize/2 - 2, y * tileSize + tileSize/2 - 2, 4, 4);
                    } else if (map[y][x] === 3) {
                        ctx.fillStyle = 'orange';
                        ctx.fillRect(x * tileSize + tileSize/2 - 4, y * tileSize + tileSize/2 - 4, 8, 8);
                    }
                }
            }
            
            ctx.fillStyle = 'yellow';
            ctx.beginPath();
            const centerX = pacman.x + tileSize/2;
            const centerY = pacman.y + tileSize/2;
            let startAngle, endAngle;
            
            switch(pacman.direction) {
                case 0: startAngle = mouthAngle; endAngle = -mouthAngle; break;
                case 1: startAngle = Math.PI/2 + mouthAngle; endAngle = Math.PI/2 - mouthAngle; break;
                case 2: startAngle = Math.PI + mouthAngle; endAngle = Math.PI - mouthAngle; break;
                case 3: startAngle = -Math.PI/2 + mouthAngle; endAngle = -Math.PI/2 - mouthAngle; break;
            }
            
            ctx.arc(centerX, centerY, tileSize/2, startAngle, endAngle);
            ctx.lineTo(centerX, centerY);
            ctx.fill();
            
            ghosts.forEach(ghost => {
                ctx.fillStyle = ghost.color;
                ctx.beginPath();
                ctx.arc(ghost.x + tileSize/2, ghost.y + tileSize/2, tileSize/2, 0, Math.PI * 2);
                ctx.fill();
            });
        }
        
        function gameLoop() {
            update();
            draw();
            requestAnimationFrame(gameLoop);
        }
        
        gameLoop();
    </script>
</body>
</html>
