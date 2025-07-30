const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const box = 20;
const canvasSize = 400;
let snake = [{x: 9 * box, y: 10 * box}];
let direction = null;
let nextDirection = null;
let food = randomFood();
let score = 0;
let highscore = Number(localStorage.getItem('snakeHighscore')) || 0;
let leaderboard = JSON.parse(localStorage.getItem('snakeLeaderboard')) || [];

let gameInterval = null;
let gameOver = false;

// Enable arrow key controls
document.addEventListener('keydown', changeDirection);

function randomFood() {
    let x = Math.floor(Math.random() * (canvasSize / box)) * box;
    let y = Math.floor(Math.random() * (canvasSize / box)) * box;
    // Avoid spawning food on the snake
    while (snake.some(segment => segment.x === x && segment.y === y)) {
        x = Math.floor(Math.random() * (canvasSize / box)) * box;
        y = Math.floor(Math.random() * (canvasSize / box)) * box;
    }

    return { x, y };


    return { x, y };
}

let startBtn, restartBtn;


function changeDirection(e) {
    if (gameOver) return;
    if (e.key === 'ArrowLeft' && direction !== 'RIGHT' && direction !== 'LEFT') nextDirection = 'LEFT';
    else if (e.key === 'ArrowUp' && direction !== 'DOWN' && direction !== 'UP') nextDirection = 'UP';
    else if (e.key === 'ArrowRight' && direction !== 'LEFT' && direction !== 'RIGHT') nextDirection = 'RIGHT';
    else if (e.key === 'ArrowDown' && direction !== 'UP' && direction !== 'DOWN') nextDirection = 'DOWN';
}

function drawSnake() {
    for (let i = 0; i < snake.length; i++) {
        if (i === 0) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(snake[i].x + box/2, snake[i].y + box/2, box/2, 0, 2 * Math.PI);
            ctx.fillStyle = '#00ff99';
            ctx.shadowColor = '#00ff99';
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.shadowBlur = 0;
            // Gözler
            let eyeOffsetX = 0, eyeOffsetY = 0;
            let dir = direction || 'UP';
            if (dir === 'LEFT') { eyeOffsetX = -box/5; eyeOffsetY = -box/6; }
            else if (dir === 'RIGHT') { eyeOffsetX = box/5; eyeOffsetY = -box/6; }
            else if (dir === 'UP') { eyeOffsetX = -box/6; eyeOffsetY = -box/5; }
            else if (dir === 'DOWN') { eyeOffsetX = -box/6; eyeOffsetY = box/5; }
            // Sol göz
            ctx.beginPath();
            ctx.arc(snake[i].x + box/2 - 4 + eyeOffsetX, snake[i].y + box/2 - 4 + eyeOffsetY, 2, 0, 2 * Math.PI);
            ctx.fillStyle = '#222';
            ctx.fill();
            // Sağ göz
            ctx.beginPath();
            ctx.arc(snake[i].x + box/2 + 4 + eyeOffsetX, snake[i].y + box/2 - 4 + eyeOffsetY, 2, 0, 2 * Math.PI);
            ctx.fill();
            ctx.restore();
        } else {
            ctx.fillStyle = '#fff';
            ctx.shadowColor = '#fff';
            ctx.shadowBlur = 0;
            ctx.fillRect(snake[i].x, snake[i].y, box, box);
        }
    }
}

function drawFood() {
    ctx.fillStyle = '#ff0066';
    ctx.shadowColor = '#ff0066';
    ctx.shadowBlur = 10;
    ctx.fillRect(food.x, food.y, box, box);
    ctx.shadowBlur = 0;
}

function drawScore() {
    document.getElementById('score').textContent = score;
    document.getElementById('highscore').textContent = highscore;
}

function drawLeaderboard() {
    leaderboard.sort((a, b) => b.score - a.score);
    const list = document.getElementById('leaderboardList');
    list.innerHTML = '';
    leaderboard.slice(0, 5).forEach((entry, i) => {
        const li = document.createElement('li');
        li.textContent = `${i + 1}. ${entry.name}: ${entry.score} puan`;
        list.appendChild(li);
    });
}

function collision(head, arr) {
    for (let i = 0; i < arr.length; i++) {
        if (head.x === arr[i].x && head.y === arr[i].y) return true;
    }
    return false;
}

function draw() {
    ctx.clearRect(0, 0, canvasSize, canvasSize);
    drawSnake();
    drawFood();
    drawScore();
    drawLeaderboard();

    // Eğer direction yoksa (oyun başı), yılan ilerlemesin
    if (!direction && !nextDirection) return;
    if (nextDirection) direction = nextDirection;

    let head = {x: snake[0].x, y: snake[0].y};
    if (direction === 'LEFT') head.x -= box;
    if (direction === 'UP') head.y -= box;
    if (direction === 'RIGHT') head.x += box;
    if (direction === 'DOWN') head.y += box;

    // Duvara çarpma
    if (head.x < 0 || head.x >= canvasSize || head.y < 0 || head.y >= canvasSize) {
        endGame();
        return;
    }

    snake.unshift(head);

    // Yemeği yedi mi?
    if (head.x === food.x && head.y === food.y) {
        score++;
        if (score > highscore) {
            highscore = score;
            localStorage.setItem('snakeHighscore', highscore);
        }
        food = randomFood();
    } else {
        snake.pop();
    }

    // Kuyruğu pop ettikten sonra kendine çarpma kontrolü
    if (collision(head, snake.slice(1))) {
        endGame();
        return;
    }
}

function gameLoop() {
    if (!gameOver) draw();
}

function endGame() {
    clearInterval(gameInterval);
    gameOver = true;
    // Kullanıcıdan isim iste
    setTimeout(() => {
        let name = prompt('Oyun bitti! İsmini gir:');
        if (!name) name = 'İsimsiz';
        leaderboard.push({ name, score });
        leaderboard = leaderboard.sort((a, b) => b.score - a.score).slice(0, 10);
        localStorage.setItem('snakeLeaderboard', JSON.stringify(leaderboard));
        drawLeaderboard();
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, canvasSize/2 - 40, canvasSize, 80);
        ctx.font = '32px Segoe UI';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText('Oyun Bitti!', canvasSize/2, canvasSize/2);
        ctx.font = '20px Segoe UI';
        ctx.fillText('Puanın: ' + score, canvasSize/2, canvasSize/2 + 30);
    }, 100);
}

function restartGame() {
    if (!restartBtn) restartBtn = document.getElementById('restartBtn');
    if (!startBtn) startBtn = document.getElementById('startBtn');
    snake = [{x: 9 * box, y: 10 * box}];
    direction = null;
    nextDirection = null;
    food = randomFood();
    score = 0;
    gameOver = false;
    drawScore();
    drawLeaderboard();
    ctx.clearRect(0, 0, canvasSize, canvasSize);
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, 100);
    restartBtn.style.display = 'none';
    startBtn.style.display = 'inline-block';
}
function restartGame() {
    startGame();
}

function startGame() {
    if (!restartBtn) restartBtn = document.getElementById('restartBtn');
    if (!startBtn) startBtn = document.getElementById('startBtn');
    snake = [{x: 9 * box, y: 10 * box}];
    direction = 'RIGHT';
    nextDirection = null;
    food = randomFood();
    score = 0;
    gameOver = false;
    drawScore();
    drawLeaderboard();
    ctx.clearRect(0, 0, canvasSize, canvasSize);
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, 100);
    startBtn.style.display = 'none';
    restartBtn.style.display = 'inline-block';
}

// İlk başlatma
window.onload = function() {
    startBtn = document.getElementById('startBtn');
    restartBtn = document.getElementById('restartBtn');
    startBtn.onclick = startGame;
    restartBtn.onclick = restartGame;
    draw();
    startBtn.style.display = 'inline-block';
    restartBtn.style.display = 'none';
}

