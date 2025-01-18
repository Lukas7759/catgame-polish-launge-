let game;

class Game {
  constructor() {
    this.loadSavedScores();
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    
    // Grid configuration
    this.gridSize = 10;
    this.bubbleRadius = 30;
    
    this.initGame();
    this.setupEventListeners();
    this.resizeCanvas();
    
    // Start game loop
    this.gameLoop();
  }

  initGame() {
    // Initialize scores and state
    // this.playerScore = 0;
    // this.catScore = 0;
    this.gameOver = false;
    
    // Create grid
    this.grid = Array(this.gridSize).fill().map(() => 
      Array(this.gridSize).fill('normal')
    );
    
    // Place random over balls (5-10)
    const overBalls = 5 + Math.floor(Math.random() * 6);
    for (let i = 0; i < overBalls; i++) {
      let x, y;
      do {
        x = Math.floor(Math.random() * this.gridSize);
        y = Math.floor(Math.random() * this.gridSize);
      } while (this.grid[y][x] === 'over');
      this.grid[y][x] = 'over';
    }
    
    // Place cat in center
    this.cat = {
      x: Math.floor(this.gridSize / 2),
      y: Math.floor(this.gridSize / 2)
    };
    
    // Start time
    this.startTime = Date.now();
  }

  loadSavedScores() {
    this.playerScore = parseInt(localStorage.getItem('playerScore') || '0');
    this.catScore = parseInt(localStorage.getItem('catScore') || '0');
    this.updateScoreDisplay();
  }

  saveScores() {
    localStorage.setItem('playerScore', this.playerScore.toString());
    localStorage.setItem('catScore', this.catScore.toString());
  }

  setupEventListeners() {
    window.addEventListener('resize', () => this.resizeCanvas());
    this.canvas.addEventListener('click', (e) => this.handleClick(e));
    
    document.getElementById('resetBtn').addEventListener('click', () => this.reset());
    document.getElementById('replayBtn').addEventListener('click', () => this.reset());
    document.getElementById('exitBtn').addEventListener('click', () => window.close());
    document.getElementById('playAgainBtn').addEventListener('click', () => this.reset());
  }

  resizeCanvas() {
    const container = document.getElementById('game-container');
    const size = Math.min(container.clientWidth, container.clientHeight);
    this.canvas.width = size;
    this.canvas.height = size;
    this.cellSize = size / this.gridSize;
    this.bubbleRadius = (this.cellSize / 2) - 2;
  }

  handleClick(e) {
    if (this.gameOver) return;

    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    
    const x = Math.floor(((e.clientX - rect.left) * scaleX) / this.cellSize);
    const y = Math.floor(((e.clientY - rect.top) * scaleY) / this.cellSize);

    if (x >= 0 && x < this.gridSize && y >= 0 && y < this.gridSize) {
      if (this.grid[y][x] === 'normal' && !(x === this.cat.x && y === this.cat.y)) {
        this.grid[y][x] = 'over';
        this.moveCat();
      }
    }
  }

  moveCat() {
    const moves = [
      {x: -1, y: -1}, {x: -1, y: 0}, {x: -1, y: 1},
      {x: 0, y: -1},                 {x: 0, y: 1},
      {x: 1, y: -1},  {x: 1, y: 0},  {x: 1, y: 1}
    ];

    const possibleMoves = moves
      .map(move => ({
        x: this.cat.x + move.x,
        y: this.cat.y + move.y
      }))
      .filter(pos => 
        pos.x >= 0 && pos.x < this.gridSize &&
        pos.y >= 0 && pos.y < this.gridSize &&
        this.grid[pos.y][pos.x] !== 'over'
      );

    if (possibleMoves.length === 0) {
      this.endGame('player');
      return;
    }

    const move = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
    this.cat.x = move.x;
    this.cat.y = move.y;

    if (this.isAtEdge(this.cat.x, this.cat.y)) {
      this.endGame('cat');
    }
  }

  isAtEdge(x, y) {
    return x === 0 || x === this.gridSize - 1 || y === 0 || y === this.gridSize - 1;
  }

  endGame(winner) {
    this.gameOver = true;
    const winScreen = document.getElementById('win-screen');
    const message = document.getElementById('win-message');
    
    if (winner === 'player') {
      this.playerScore++;
      message.textContent = 'Złapałeś kota!';
    } else {
      this.catScore++;
      message.textContent = 'Kot uciekł!';
    }
    
    this.saveScores();
    this.updateScoreDisplay();
    winScreen.classList.remove('hidden');
  }

  updateScoreDisplay() {
    document.getElementById('score').textContent = `${this.playerScore} - ${this.catScore}`;
    if (document.getElementById('final-score')) {
      document.getElementById('final-score').textContent = `${this.playerScore} - ${this.catScore}`;
    }
  }

  reset() {
    document.getElementById('win-screen').classList.add('hidden');
    this.initGame();
    this.updateScoreDisplay();
  }

  updateStats() {
    const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    
    document.getElementById('score').textContent = `${this.playerScore} - ${this.catScore}`;
    document.getElementById('timer').textContent = 
      `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw bubbles
    for (let y = 0; y < this.gridSize; y++) {
      for (let x = 0; x < this.gridSize; x++) {
        const centerX = x * this.cellSize + this.cellSize / 2;
        const centerY = y * this.cellSize + this.cellSize / 2;
        
        const bubble = this.grid[y][x] === 'normal' ? 
          loader.loaded.bubble : loader.loaded.bubbleOver;
        
        this.ctx.drawImage(bubble,
          centerX - this.bubbleRadius,
          centerY - this.bubbleRadius,
          this.bubbleRadius * 2,
          this.bubbleRadius * 2
        );
      }
    }

    // Draw cat
    const catX = this.cat.x * this.cellSize + this.cellSize / 2;
    const catY = this.cat.y * this.cellSize + this.cellSize / 2;
    this.ctx.drawImage(loader.loaded.cat,
      catX - this.bubbleRadius,
      catY - this.bubbleRadius,
      this.bubbleRadius * 2,
      this.bubbleRadius * 2
    );
  }

  gameLoop() {
    this.updateStats();
    this.draw();
    requestAnimationFrame(() => this.gameLoop());
  }
}

function initGame() {
  game = new Game();
}