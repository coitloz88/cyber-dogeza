import { lerpColor, getRandomLocation } from "./interface.js";
import { PhaseController } from "./core.js";
import { initPhase5 } from "./phase5.js";
import { lang, translations } from "./i18n.js";

let creatureInterval;
let featherInterval;

export function initPhase4() {
  document.body.className = "phase4";

  // UI Setup for Phase 4
  document.title = translations[lang].title_p4;
  document.getElementById("mainTitle").innerHTML = translations[lang].h1_p4;
  document.getElementById("location").textContent = getRandomLocation(4);
  document.getElementById("sweatEffect").textContent = "💨";
  document.getElementById("tempLabel").textContent =
    translations[lang].receipt_altitude;

  const tempEl = document.getElementById("temperature");
  tempEl.textContent = "100m";
  tempEl.style.color = "#87cefa";
  tempEl.style.textShadow = "0 0 6px #4a90d8";

  const divingMask = document.getElementById("divingMask");
  divingMask.textContent = "🪂";
  divingMask.style.display = "block";
  divingMask.classList.remove("fly-away");

  // Add Depth Overlay
  const overlay = document.createElement("div");
  overlay.className = "depth-overlay";
  document.getElementById("scene").appendChild(overlay);

  let currentAlt = 100;
  const lowTopRgb = [96, 165, 230];
  const lowBottomRgb = [150, 200, 240];
  const highTopRgb = [16, 24, 80];
  const highBottomRgb = [60, 90, 160];

  function updateSkyUI() {
    tempEl.textContent = `${Math.round(currentAlt)}m`;

    // 고도가 오를수록 하늘 -> 성층권 남색.
    let ratio = (currentAlt - 100) / 2400;
    if (ratio < 0) ratio = 0;
    if (ratio > 1) ratio = 1;

    const topColor = lerpColor(lowTopRgb, highTopRgb, ratio);
    const bottomColor = lerpColor(lowBottomRgb, highBottomRgb, ratio);
    document.body.style.background = `linear-gradient(180deg, ${topColor} 0%, ${bottomColor} 100%)`;

    if (controller.isLiberated) {
      overlay.style.background =
        "radial-gradient(ellipse at center, transparent 30%, rgba(255, 240, 180, 0.4) 100%)";
      overlay.style.opacity = "1";
    } else {
      overlay.style.background = "black";
      // 하늘이므로 다른 페이즈보다 옅게.
      overlay.style.opacity = (ratio * 0.5).toString();
    }

    // 텍스트 경고
    if (currentAlt >= 3000) {
      tempEl.style.color = "#ff0000";
      tempEl.style.textShadow = "0 0 10px #ff0000";
    } else if (currentAlt >= 2000) {
      tempEl.style.color = "#ffb347";
      tempEl.style.textShadow = "0 0 8px #ff6a1a";
    } else {
      tempEl.style.color = "#87cefa";
      tempEl.style.textShadow = "0 0 6px #4a90d8";
    }
  }

  function spawnWindBurst(x, y) {
    const w = document.createElement("div");
    w.className = "wind-burst";
    w.textContent = "💨";
    w.style.left = x + "px";
    w.style.top = y + "px";
    w.style.fontSize = 1 + Math.random() * 0.8 + "rem";
    document.body.appendChild(w);

    setTimeout(() => {
      if (w.parentNode) w.remove();
    }, 2000);
  }

  function spawnCreature() {
    const lowFlyers = ["🕊️", "🦅", "🎈", "🪁"];
    const highFlyers = ["✈️", "🚁", "🛩️", "🦢"];
    const c = document.createElement("div");
    c.className = "creature";

    // 고고도 비행체 확률 (고도에 비례)
    let ratio = (currentAlt - 100) / 2400;
    if (Math.random() < ratio) {
      c.textContent = highFlyers[Math.floor(Math.random() * highFlyers.length)];
      c.style.filter = "drop-shadow(0 0 10px rgba(255, 255, 255, 0.5))";
    } else {
      c.textContent = lowFlyers[Math.floor(Math.random() * lowFlyers.length)];
    }

    c.style.top = 10 + Math.random() * 70 + "vh";

    const isLeft = Math.random() > 0.5;
    const dur = 10000 + Math.random() * 10000;

    if (isLeft) {
      c.style.animation = `swimLeft ${dur}ms linear forwards`;
    } else {
      c.style.animation = `swimRight ${dur}ms linear forwards`;
    }

    document.body.appendChild(c);

    setTimeout(() => {
      if (c.parentNode) c.remove();
    }, dur);
  }
  creatureInterval = setInterval(spawnCreature, 3000);

  function spawnFeather() {
    const f = document.createElement("div");
    f.className = "feather";
    f.textContent = ["🪶", "☁️", "🫧"][Math.floor(Math.random() * 3)];
    f.style.left = Math.random() * 100 + "vw";
    f.style.fontSize = 0.6 + Math.random() * 0.9 + "rem";
    document.body.appendChild(f);

    // 하늘이므로 낙하보다 좌우로 흘러가는 완만한 대각선 하강.
    const drift = (Math.random() - 0.5) * 120;
    const dur = 8000 + Math.random() * 6000;
    f.animate(
      [
        { transform: "translate(0, 0) rotate(0deg)", opacity: 0.9 },
        {
          transform: `translate(${drift * 4}px, 30vh) rotate(${(Math.random() - 0.5) * 180}deg)`,
          opacity: 0.2,
        },
      ],
      { duration: dur, easing: "linear" },
    ).onfinish = () => f.remove();
  }
  featherInterval = setInterval(spawnFeather, 600);

  const controller = new PhaseController({
    phaseName: "Phase4",
    maxCount: 108,
    onTick: () => {
      let drop = Math.round((currentAlt - 100) / 45);
      currentAlt -= drop;
      if (currentAlt < 100) currentAlt = 100;
      updateSkyUI();
    },
    onBow: (timeDiff) => {
      if (!controller.isLiberated) {
        let bonus = 0;
        if (timeDiff < 1000) {
          bonus = Math.max(0, 100 - timeDiff / 10);
        }
        currentAlt += 50 + bonus;
        if (currentAlt > 3500) currentAlt = 3500;
        updateSkyUI();
      }

      // 절할 때마다 주인공 주변에서 바람 발생
      const dogezaRect = document
        .getElementById("dogeza")
        .getBoundingClientRect();
      for (let i = 0; i < 3; i++) {
        spawnWindBurst(
          dogezaRect.left + Math.random() * dogezaRect.width,
          dogezaRect.top + Math.random() * 50,
        );
      }
    },
    onLiberate: () => {
      currentAlt = 0;
      tempEl.textContent = "0m";
      tempEl.style.color = "#4ade80";
      tempEl.style.textShadow = "0 0 10px #4ade80";
      updateSkyUI();

      // 낙하산 날아가기
      divingMask.classList.add("fly-away");

      // '우주로 이동' 버튼 추가
      const btnGroup = document.getElementById("btnGroup");
      const nextBtn = document.createElement("button");
      nextBtn.className = "bow-btn";
      nextBtn.id = "nextPhaseBtn";
      nextBtn.textContent = translations[lang].btn_to_space;
      nextBtn.style.background = "linear-gradient(180deg, #1a0a3a, #0a0a1a)";
      nextBtn.style.borderColor = "#b070ff";
      nextBtn.style.display = "none";

      nextBtn.addEventListener("click", () => {
        controller.cleanup();
        initPhase5();
      });
      btnGroup.appendChild(nextBtn);

      setTimeout(() => {
        nextBtn.style.display = "inline-block";
      }, 3000);
    },
    onCleanup: () => {
      clearInterval(creatureInterval);
      clearInterval(featherInterval);
      document.removeEventListener("click", clickEffect);
      overlay.remove();

      const nextBtn = document.getElementById("nextPhaseBtn");
      if (nextBtn) nextBtn.remove();

      // 생물/깃털/바람 정리
      document
        .querySelectorAll(".creature, .feather, .wind-burst")
        .forEach((el) => el.remove());
    },
  });

  // 클릭하면 바람
  function clickEffect(e) {
    if (e.target.tagName === "BUTTON") return;
    if (controller.isLiberated) return;
    for (let i = 0; i < 3; i++) {
      spawnWindBurst(
        e.clientX + (Math.random() - 0.5) * 40,
        e.clientY + (Math.random() - 0.5) * 40,
      );
    }
  }
  document.addEventListener("click", clickEffect);

  controller.start();

  // phase4 자체 그라디언트 즉시 설정 (이전 phase3 배경 잔상 방지)
  updateSkyUI();
}
