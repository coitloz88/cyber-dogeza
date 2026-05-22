import { playChime, spawnPetal, apologies, celebrations } from "./interface.js";

// 글로벌 상태 (Phase 간 유지)
export const globalState = {
  score: 0,
  totalBows: 0,
};

// 점수 업데이트 UI 함수
export function updateScoreUI(oldScore, newScore) {
  const scoreEl = document.getElementById("scoreValue");
  if (!scoreEl) return;

  const oldStr = String(oldScore).padStart(7, "0");
  const newStr = String(newScore).padStart(7, "0");

  let changedIdx = 0;
  for (let i = 0; i < 7; i++) {
    if (oldStr[i] !== newStr[i]) {
      changedIdx = i;
      break;
    }
  }

  scoreEl.innerHTML = "";
  for (let i = 0; i < 7; i++) {
    const span = document.createElement("span");
    span.textContent = newStr[i];
    if (i >= changedIdx && oldScore !== newScore) {
      span.classList.add("flash-shake");
    }
    scoreEl.appendChild(span);
  }
}

export class PhaseController {
  constructor(config) {
    this.phaseName = config.phaseName || "Phase";
    this.maxCount = config.maxCount || 108;
    this.isLiberated = false;
    this.count = 0;
    this.startTime = Date.now();
    this.lastClickTime = 0;

    // UI Elements
    this.countEl = document.getElementById("count");
    this.timerEl = document.getElementById("timer");
    this.dogeza = document.getElementById("dogeza");
    this.scene = document.getElementById("scene");
    this.impactLines = document.querySelector(".impact-lines");
    this.btn = document.getElementById("bowBtn");
    this.btnGroup = document.getElementById("btnGroup");
    this.locationEl = document.getElementById("location");

    // Hooks
    this.onBow = config.onBow || (() => {});
    this.onLiberate = config.onLiberate || (() => {});
    this.onTick = config.onTick || (() => {});
    this.onCleanup = config.onCleanup || (() => {});

    this.intervals = [];
  }

  start() {
    this.isLiberated = false;
    this.count = 0;
    this.startTime = Date.now();
    this.countEl.textContent = "0";

    // Timer interval
    this.intervals.push(
      setInterval(() => {
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        const m = Math.floor(elapsed / 60);
        const s = elapsed % 60;
        if (this.timerEl) {
          this.timerEl.textContent = `${m}:${s.toString().padStart(2, "0")}`;
        }
      }, 1000),
    );

    // Custom tick interval (e.g. for temperature/depth drop)
    this.intervals.push(
      setInterval(() => {
        if (!this.isLiberated) {
          this.onTick();
        }
      }, 250),
    );

    // Bind Button
    this._handleBow = this.handleBow.bind(this);
    if (this.btn) {
      this.btn.addEventListener("click", this._handleBow);
      this.btn.textContent = "한 번 더 사죄";
    }
  }

  handleBow() {
    this.count++;
    if (this.countEl) this.countEl.textContent = this.count;
    globalState.totalBows++;

    const now = Date.now();
    let timeDiff = now - this.lastClickTime;
    if (timeDiff === 0) timeDiff = 1;

    // 점수 계산
    if (!this.isLiberated) {
      let baseScore = Math.floor(Math.random() * 500) + 500; // 500 ~ 999
      let comboBonus = 0;
      if (timeDiff < 1000) {
        comboBonus = Math.max(0, 2000 - timeDiff * 2); // 빠르게 누를수록 큰 가산점
      }
      this.addScore(baseScore + comboBonus);
    }

    this.lastClickTime = now;

    // 공통 이펙트
    if (!this.isLiberated) {
      this.dogeza.classList.remove("bow");
      void this.dogeza.offsetWidth;
      this.dogeza.classList.add("bow");

      this.scene.classList.remove("shake");
      void this.scene.offsetWidth;
      this.scene.classList.add("shake");

      if (this.impactLines) {
        this.impactLines.classList.add("flash");
        setTimeout(() => this.impactLines.classList.remove("flash"), 200);
      }
    }

    this.showFloatingMessage();

    // Hook
    this.onBow(timeDiff);

    if (this.count === this.maxCount && !this.isLiberated) {
      setTimeout(() => this.triggerLiberation(), 500);
    }
  }

  addScore(points) {
    const oldScore = globalState.score;
    globalState.score += Math.floor(points);
    if (globalState.score > 9999999) {
      globalState.score = 9999999;
    }
    updateScoreUI(oldScore, globalState.score);
  }

  triggerLiberation() {
    if (this.isLiberated) return;
    this.isLiberated = true;

    // 108배 보너스
    this.addScore(100000);

    const flash = document.createElement("div");
    flash.className = "liberation-flash";
    document.body.appendChild(flash);
    requestAnimationFrame(() => flash.classList.add("go"));
    setTimeout(() => flash.remove(), 1900);

    document.body.classList.add("liberated");
    const emojiEl = document.getElementById("dogezaEmoji");
    if (emojiEl) emojiEl.textContent = "🙏";

    playChime();

    const petalInterval = setInterval(spawnPetal, 180);
    setTimeout(() => clearInterval(petalInterval), 10000);
    for (let i = 0; i < 30; i++) {
      setTimeout(spawnPetal, i * 40);
    }

    if (this.btn) this.btn.textContent = "계속 감사하기";

    // Hook
    this.onLiberate();
  }

  showFloatingMessage() {
    const pool = this.isLiberated ? celebrations : apologies;
    const msg = document.createElement("div");
    msg.textContent = pool[Math.floor(Math.random() * pool.length)];
    msg.style.cssText = `
      position: fixed;
      left: ${30 + Math.random() * 40}%;
      top: ${30 + Math.random() * 30}%;
      font-family: 'Shippori Mincho', serif;
      font-weight: 800;
      font-size: ${1.5 + Math.random() * 1}rem;
      color: #fff2c4;
      text-shadow: ${
        this.isLiberated
          ? "0 0 12px #ffd966, 0 0 24px #ffb347"
          : "0 0 12px #00fff0, 0 0 24px #0088cc" // default style, can be overridden by phase
      };
      z-index: 30;
      pointer-events: none;
      letter-spacing: 0.05em;
    `;
    // Allow phase to customize message style slightly if needed, but default is good enough usually.
    // For Phase 1 it was orange/red, we'll let hooks handle it if necessary, or just use a generic cool color.

    document.body.appendChild(msg);
    msg.animate(
      [
        { transform: "translateY(0) scale(0.8)", opacity: 0 },
        { transform: "translateY(-40px) scale(1.1)", opacity: 1, offset: 0.3 },
        { transform: "translateY(-120px) scale(1)", opacity: 0 },
      ],
      { duration: 1800, easing: "ease-out" },
    ).onfinish = () => msg.remove();
  }

  cleanup() {
    this.intervals.forEach(clearInterval);
    this.intervals = [];
    if (this.btn) {
      this.btn.removeEventListener("click", this._handleBow);
    }
    this.onCleanup();
    document.body.classList.remove("liberated");

    // reset visual states
    if (this.dogeza) {
      const emojiEl = document.getElementById("dogezaEmoji");
      if (emojiEl) emojiEl.textContent = "🙇";
      this.dogeza.className = "dogeza";
    }
  }
}
