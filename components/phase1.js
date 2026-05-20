import {
  lerpColor,
  apologies,
  celebrations,
  playChime,
  spawnPetal,
} from "./interface.js";

export function initPhase1() {
  // ===== 불꽃 생성 =====
  const flames = document.getElementById("flames");
  const flameCount = 28;
  for (let i = 0; i < flameCount; i++) {
    const f = document.createElement("div");
    f.className = "flame";
    const left = (i / (flameCount - 1)) * 100;
    f.style.left = `calc(${left}% - 40px)`;
    f.style.animationDelay = Math.random() * 1.2 + "s";
    f.style.animationDuration = 0.8 + Math.random() * 0.8 + "s";
    const scale = 0.6 + Math.random() * 0.9;
    f.style.transform = `scale(${scale})`;
    f.style.bottom = Math.random() * 30 - 5 + "px";
    flames.appendChild(f);
  }

  // ===== 불씨 =====
  function spawnEmber() {
    const e = document.createElement("div");
    e.className = "ember";
    const startX = Math.random() * window.innerWidth;
    const startY = window.innerHeight * (0.78 + Math.random() * 0.1);
    e.style.left = startX + "px";
    e.style.top = startY + "px";
    e.style.opacity = (0.6 + Math.random() * 0.4).toString();
    flames.appendChild(e);

    const drift = (Math.random() - 0.5) * 200;
    const rise = 250 + Math.random() * 350;
    const dur = 2500 + Math.random() * 2000;

    e.animate(
      [
        { transform: "translate(0, 0) scale(1)", opacity: 1 },
        {
          transform: `translate(${drift}px, -${rise}px) scale(0.2)`,
          opacity: 0,
        },
      ],
      { duration: dur, easing: "ease-out" },
    ).onfinish = () => e.remove();
  }
  setInterval(spawnEmber, 120);

  // ===== 카운터 + 타이머 =====
  const countEl = document.getElementById("count");
  const timerEl = document.getElementById("timer");
  const dogeza = document.getElementById("dogeza");
  const scene = document.getElementById("scene");
  const impactLines = document.querySelector(".impact-lines");
  const btn = document.getElementById("bowBtn");
  const tempEl = document.getElementById("temperature");
  const grillEl = document.querySelector(".grill");

  let count = 1;
  const start = Date.now();

  let currentTemp = 1200;
  let lastClickTime = 0;

  // 온도 UI 업데이트 함수
  function updateTemperatureUI() {
    currentTemp = Math.round(currentTemp);
    tempEl.textContent = `${currentTemp}°C`;

    // 1. 텍스트 색상 변경
    if (currentTemp >= 3000) {
      tempEl.style.color = "#8b0000"; // 짙은 빨간색
      tempEl.style.textShadow = "0 0 10px #ff0000";
    } else if (currentTemp >= 2000) {
      tempEl.style.color = "#ff0000"; // 빨간색
      tempEl.style.textShadow = "0 0 8px #ff4500";
    } else {
      tempEl.style.color = "var(--flame)"; // 기본 (주황/노랑)
      tempEl.style.textShadow = "0 0 6px var(--ember)";
    }

    // 2. 불판 색상 선형 보간 (갈색 -> 짙은 주황 -> 주황 -> 노랑 -> 흰색)
    const stops = [
      {
        t: 1200,
        c1: [42, 18, 8],
        c2: [90, 36, 16],
        c3: [26, 8, 4],
        g1: [255, 180, 100, 0.3],
        g2: [255, 90, 0, 0.6],
      },
      {
        t: 1775,
        c1: [110, 40, 10],
        c2: [211, 84, 0],
        c3: [80, 20, 5],
        g1: [255, 180, 100, 0.5],
        g2: [255, 100, 0, 0.8],
      },
      {
        t: 2350,
        c1: [180, 80, 0],
        c2: [255, 140, 0],
        c3: [120, 50, 0],
        g1: [255, 200, 120, 0.7],
        g2: [255, 130, 0, 1.0],
      },
      {
        t: 2925,
        c1: [220, 180, 0],
        c2: [255, 215, 0],
        c3: [180, 140, 0],
        g1: [255, 230, 150, 0.9],
        g2: [255, 180, 50, 1.2],
      },
      {
        t: 3500,
        c1: [255, 240, 200],
        c2: [255, 255, 255],
        c3: [255, 220, 180],
        g1: [255, 255, 255, 1.0],
        g2: [255, 255, 200, 1.5],
      },
    ];

    let tRatio = 0;
    let sStart = stops[0],
      sEnd = stops[1];

    for (let i = 0; i < stops.length - 1; i++) {
      if (currentTemp >= stops[i].t && currentTemp <= stops[i + 1].t) {
        sStart = stops[i];
        sEnd = stops[i + 1];
        tRatio = (currentTemp - sStart.t) / (sEnd.t - sStart.t);
        break;
      }
    }
    if (currentTemp >= 3500) {
      sStart = stops[stops.length - 1];
      sEnd = stops[stops.length - 1];
      tRatio = 1;
    }

    const c1 = lerpColor(sStart.c1, sEnd.c1, tRatio);
    const c2 = lerpColor(sStart.c2, sEnd.c2, tRatio);
    const c3 = lerpColor(sStart.c3, sEnd.c3, tRatio);
    const glow1 = lerpColor(sStart.g1, sEnd.g1, tRatio);
    const glow2 = lerpColor(sStart.g2, sEnd.g2, tRatio);

    grillEl.style.setProperty("--grill-c1", c1);
    grillEl.style.setProperty("--grill-c2", c2);
    grillEl.style.setProperty("--grill-c3", c3);
    grillEl.style.setProperty("--grill-glow1", glow1);
    grillEl.style.setProperty("--grill-glow2", glow2);

    // 3. 불꽃 및 이펙트 강도 조절 (0.0 ~ 1.0)
    const fireIntensity = (currentTemp - 1200) / 2300;
    document.documentElement.style.setProperty(
      "--fire-intensity",
      fireIntensity.toString(),
    );

    const dGlow1 = lerpColor(
      [255, 130, 30, 0.9],
      [255, 255, 200, 1.0],
      fireIntensity,
    );
    const dGlow2 = lerpColor(
      [255, 60, 0, 0.7],
      [255, 200, 100, 0.9],
      fireIntensity,
    );
    const dGlow3 = lerpColor(
      [255, 180, 30, 0.5],
      [255, 255, 255, 0.8],
      fireIntensity,
    );

    dogeza.style.setProperty("--dogeza-glow1", dGlow1);
    dogeza.style.setProperty("--dogeza-glow2", dGlow2);
    dogeza.style.setProperty("--dogeza-glow3", dGlow3);
  }

  // 온도 하락 로직 (0.25초마다)
  setInterval(() => {
    if (liberated) {
      currentTemp = 36.5;
      return;
    }

    let drop = Math.round((currentTemp - 1200) / 45);
    currentTemp -= drop;
    if (currentTemp < 1200) currentTemp = 1200;

    updateTemperatureUI();
  }, 250);

  setInterval(() => {
    const elapsed = Math.floor((Date.now() - start) / 1000);
    const m = Math.floor(elapsed / 60);
    const s = elapsed % 60;
    timerEl.textContent = `${m}:${s.toString().padStart(2, "0")}`;
  }, 1000);

  // ===== 해탈 (108배 완료) =====
  let liberated = false;
  function triggerLiberation() {
    if (liberated) return;
    liberated = true;

    // 흰 섬광
    const flash = document.createElement("div");
    flash.className = "liberation-flash";
    document.body.appendChild(flash);
    requestAnimationFrame(() => flash.classList.add("go"));
    setTimeout(() => flash.remove(), 1900);

    // 해탈 상태 적용
    document.body.classList.add("liberated");

    // 인물을 🙏 (합장)으로 변신
    dogeza.textContent = "🙏";

    // 온도 36.5도로 고정
    currentTemp = 36.5;
    const tempEl = document.getElementById("temperature");
    tempEl.textContent = "36.5°C";
    tempEl.style.color = "#4ade80";
    tempEl.style.textShadow = "0 0 10px #4ade80";

    // 빰빠바밤
    playChime();

    // 꽃잎 폭풍
    const petalInterval = setInterval(spawnPetal, 180);
    setTimeout(() => clearInterval(petalInterval), 10000);
    for (let i = 0; i < 30; i++) {
      setTimeout(spawnPetal, i * 40);
    }

    // 버튼 텍스트도 바꿈
    btn.textContent = "계속 감사하기";
  }

  btn.addEventListener("click", () => {
    count++;
    countEl.textContent = count;

    if (!liberated) {
      // 온도 상승 로직
      const now = Date.now();
      let timeDiff = now - lastClickTime;
      if (timeDiff === 0) timeDiff = 1;

      let bonus = 0;
      if (timeDiff < 1000) {
        bonus = Math.max(0, 100 - timeDiff / 10);
      }

      currentTemp += 50 + bonus;
      if (currentTemp > 3500) currentTemp = 3500;

      lastClickTime = now;
      updateTemperatureUI();

      // 이모지 절 모션
      dogeza.classList.remove("bow");
      void dogeza.offsetWidth;
      dogeza.classList.add("bow");

      // 씬만 흔들림
      scene.classList.remove("shake");
      void scene.offsetWidth;
      scene.classList.add("shake");

      // 임팩트 라인
      impactLines.classList.add("flash");
      setTimeout(() => impactLines.classList.remove("flash"), 200);
    }

    // 떠오르는 메시지
    const pool = liberated ? celebrations : apologies;
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
        liberated
          ? "0 0 12px #ffd966, 0 0 24px #ffb347"
          : "0 0 12px #ff6a1a, 0 0 24px #c8102e"
      };
      z-index: 30;
      pointer-events: none;
      letter-spacing: 0.05em;
    `;
    document.body.appendChild(msg);
    msg.animate(
      [
        { transform: "translateY(0) scale(0.8)", opacity: 0 },
        { transform: "translateY(-40px) scale(1.1)", opacity: 1, offset: 0.3 },
        { transform: "translateY(-120px) scale(1)", opacity: 0 },
      ],
      { duration: 1800, easing: "ease-out" },
    ).onfinish = () => msg.remove();

    // 파티클
    if (liberated) {
      for (let i = 0; i < 5; i++) setTimeout(spawnPetal, i * 80);
    } else {
      for (let i = 0; i < 20; i++) setTimeout(spawnEmber, i * 20);
    }

    // 108배 도달
    if (count === 108) {
      setTimeout(triggerLiberation, 500);
    }
  });

  // 클릭하면 불씨 튀김
  document.addEventListener("click", (e) => {
    if (e.target.tagName === "BUTTON") return;
    for (let i = 0; i < 6; i++) {
      const em = document.createElement("div");
      em.className = "ember";
      em.style.left = e.clientX + "px";
      em.style.top = e.clientY + "px";
      document.body.appendChild(em);
      const drift = (Math.random() - 0.5) * 100;
      em.animate(
        [
          { transform: "translate(0,0) scale(1.5)", opacity: 1 },
          {
            transform: `translate(${drift}px, -${80 + Math.random() * 80}px) scale(0.2)`,
            opacity: 0,
          },
        ],
        { duration: 1000 + Math.random() * 500, easing: "ease-out" },
      ).onfinish = () => em.remove();
    }
  });
}
