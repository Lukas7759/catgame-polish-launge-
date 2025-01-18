class ResourceLoader {
  constructor() {
    this.resources = {
      cat: '/cat.png',
      bubble: '/normal bal.png',
      bubbleOver: '/over bal.png',
      exitBtn: '/exit2.png',
      resetBtn: '/reset2.png',
      replayBtn: '/replay2.png'
    };
    this.loaded = {};
    this.errors = [];
    this.progress = 0;
  }

  async loadAll() {
    const total = Object.keys(this.resources).length;
    let loaded = 0;

    const loadPromises = Object.entries(this.resources).map(([key, path]) => {
      return new Promise((resolve) => {
        const img = new Image();
        
        img.onload = () => {
          this.loaded[key] = img;
          loaded++;
          this.progress = (loaded / total) * 100;
          this.updateLoadingUI();
          resolve();
        };

        img.onerror = () => {
          this.errors.push(`Failed to load: ${path}`);
          loaded++;
          this.progress = (loaded / total) * 100;
          this.updateLoadingUI();
          resolve();
        };

        img.src = path;
      });
    });

    await Promise.all(loadPromises);

    if (this.errors.length === 0) {
      const playBtn = document.getElementById('playBtn');
      playBtn.classList.remove('hidden');
      playBtn.addEventListener('click', () => {
        document.getElementById('loading-screen').classList.add('hidden');
        initGame();
      });
      return true;
    }
    return false;
  }

  updateLoadingUI() {
    const progress = document.getElementById('progress');
    const status = document.getElementById('loading-status');
    const error = document.getElementById('error-message');

    progress.style.width = `${this.progress}%`;
    status.textContent = `${Math.round(this.progress)}%`;

    if (this.errors.length > 0) {
      error.textContent = this.errors.join('\n');
    }
  }
}

const loader = new ResourceLoader();
loader.loadAll();