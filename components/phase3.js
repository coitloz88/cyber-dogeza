import { lerpColor, getRandomLocation } from "./interface.js";
import { PhaseController } from "./core.js";
import { initPhase4 } from "./phase4.js";
import { lang, translations } from "./i18n.js";

let creatureInterval;
let leafInterval;

export function initPhase3() {
  document.body.className = "phase3";

  // UI Setup for Phase 3
  document.title = translations[lang].title_p3;
  document.getElementById("mainTitle").innerHTML = translations[lang].h1_p3;
  document.getElementById("location").textContent = getRandomLocation(3);
  document.getElementById("sweatEffect").textContent = "🍃";
  document.getElementById("tempLabel").textContent =
    translations[lang].receipt_forest;
  document.getElementById("statusLabel").textContent =
    translations[lang].receipt_status_v;

  const tempEl = document.getElementById("temperature");
  tempEl.textContent = "100m";
  tempEl.style.color = "#7ade4a";
  tempEl.style.textShadow = "0 0 6px #2a8a2a";

  const divingMask = document.getElementById("divingMask");
  divingMask.textContent = "🍄";
  divingMask.style.display = "block";
  divingMask.classList.remove("fly-away");

  // Add Depth Overlay
  const overlay = document.createElement("div");
  overlay.className = "depth-overlay";
  document.getElementById("scene").appendChild(overlay);

  let currentDepth = 100;
  const shallowTopRgb = [34, 80, 38];
  const shallowBottomRgb = [12, 40, 20];
  const deepTopRgb = [4, 12, 6];
  const deepBottomRgb = [0, 0, 0];

  function updateForestUI() {
    tempEl.textContent = `${Math.round(currentDepth)}m`;

    // 숲이 깊어질수록 어두워짐. 100~2500 구간에서 서서히 칠흑으로.
    let ratio = (currentDepth - 100) / 2400;
    if (ratio < 0) ratio = 0;
    if (ratio > 1) ratio = 1;

    const topColor = lerpColor(shallowTopRgb, deepTopRgb, ratio);
    const bottomColor = lerpColor(shallowBottomRgb, deepBottomRgb, ratio);
    document.body.style.background = `linear-gradient(180deg, ${topColor} 0%, ${bottomColor} 100%)`;

    if (controller.isLiberated) {
      overlay.style.background =
        "radial-gradient(ellipse at center, transparent 30%, rgba(140, 255, 120, 0.35) 100%)";
      overlay.style.opacity = "1";
    } else {
      overlay.style.background = "black";
      overlay.style.opacity = (ratio * 0.85).toString();
    }

    // 텍스트 경고
    if (currentDepth >= 3000) {
      tempEl.style.color = "#ff0000";
      tempEl.style.textShadow = "0 0 10px #ff0000";
    } else if (currentDepth >= 2000) {
      tempEl.style.color = "#ffb347";
      tempEl.style.textShadow = "0 0 8px #ff6a1a";
    } else {
      tempEl.style.color = "#7ade4a";
      tempEl.style.textShadow = "0 0 6px #2a8a2a";
    }
  }

  function spawnLeafBurst(x, y) {
    const l = document.createElement("div");
    l.className = "leaf-burst";
    l.textContent = "🍃";
    l.style.left = x + "px";
    l.style.top = y + "px";
    l.style.fontSize = 1 + Math.random() * 0.8 + "rem";
    document.body.appendChild(l);

    setTimeout(() => {
      if (l.parentNode) l.remove();
    }, 2000);
  }

  function spawnCreature() {
    const dayCreatures = ["🦋", "🐦", "🐿️", "🐇"];
    const nightBeasts = ["🦉", "🐺", "🐍", "🕷️"];
    const c = document.createElement("div");
    c.className = "creature";

    // 심림 맹수 확률 (깊이에 비례)
    let ratio = Math.min(1, (currentDepth - 100) / 2400);
    if (Math.random() < ratio) {
      c.textContent =
        nightBeasts[Math.floor(Math.random() * nightBeasts.length)];
      c.style.filter = "drop-shadow(0 0 10px rgba(255, 60, 0, 0.6))";
    } else {
      c.textContent =
        dayCreatures[Math.floor(Math.random() * dayCreatures.length)];
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

  function spawnLeaf() {
    const l = document.createElement("div");
    l.className = "leaf";
    l.textContent = ["🍂", "🍁", "🍃"][Math.floor(Math.random() * 3)];
    l.style.left = Math.random() * 100 + "vw";
    l.style.fontSize = 0.6 + Math.random() * 0.9 + "rem";
    document.body.appendChild(l);

    const drift = (Math.random() - 0.5) * 120;
    const dur = 8000 + Math.random() * 6000;
    l.animate(
      [
        { transform: "translate(0, 0) rotate(0deg)", opacity: 0.9 },
        {
          transform: `translate(${drift}px, 105vh) rotate(${(Math.random() - 0.5) * 360}deg)`,
          opacity: 0.3,
        },
      ],
      { duration: dur, easing: "linear" },
    ).onfinish = () => l.remove();
  }
  leafInterval = setInterval(spawnLeaf, 600);

  const controller = new PhaseController({
    phaseName: "Phase3",
    maxCount: 108,
    onTick: () => {
      let drop = Math.round((currentDepth - 100) / 45);
      currentDepth -= drop;
      if (currentDepth < 100) currentDepth = 100;
      updateForestUI();
    },
    onBow: (timeDiff) => {
      if (!controller.isLiberated) {
        let bonus = 0;
        if (timeDiff < 1000) {
          bonus = Math.max(0, 100 - timeDiff / 10);
        }
        currentDepth += 50 + bonus;
        if (currentDepth > 100000) currentDepth = 100000;
        updateForestUI();
      }

      // 절할 때마다 주인공 주변에서 나뭇잎 흩날림
      const dogezaRect = document
        .getElementById("dogeza")
        .getBoundingClientRect();
      for (let i = 0; i < 3; i++) {
        spawnLeafBurst(
          dogezaRect.left + Math.random() * dogezaRect.width,
          dogezaRect.top + Math.random() * 50,
        );
      }
    },
    onLiberate: () => {
      currentDepth = 0;
      tempEl.textContent = "0m";
      tempEl.style.color = "#4ade80";
      tempEl.style.textShadow = "0 0 10px #4ade80";
      updateForestUI();

      // 버섯 날아가기
      divingMask.classList.add("fly-away");

      // '하늘로 이동' 버튼 추가
      const btnGroup = document.getElementById("btnGroup");
      const nextBtn = document.createElement("button");
      nextBtn.className = "bow-btn";
      nextBtn.id = "nextPhaseBtn";
      nextBtn.textContent = translations[lang].btn_to_sky;
      nextBtn.style.background = "linear-gradient(180deg, #1a3a5c, #0a1a2c)";
      nextBtn.style.borderColor = "#87cefa";
      nextBtn.style.display = "none";

      nextBtn.addEventListener("click", () => {
        controller.cleanup();
        initPhase4();
      });
      btnGroup.appendChild(nextBtn);

      setTimeout(() => {
        nextBtn.style.display = "inline-block";
      }, 3000);
    },
    onCleanup: () => {
      clearInterval(creatureInterval);
      clearInterval(leafInterval);
      document.removeEventListener("click", clickEffect);
      overlay.remove();

      const nextBtn = document.getElementById("nextPhaseBtn");
      if (nextBtn) nextBtn.remove();

      // 생물/나뭇잎 정리
      document
        .querySelectorAll(".creature, .leaf, .leaf-burst")
        .forEach((el) => el.remove());
    },
  });

  // 클릭하면 나뭇잎
  function clickEffect(e) {
    if (e.target.tagName === "BUTTON") return;
    if (controller.isLiberated) return;
    for (let i = 0; i < 3; i++) {
      spawnLeafBurst(
        e.clientX + (Math.random() - 0.5) * 40,
        e.clientY + (Math.random() - 0.5) * 40,
      );
    }
  }
  document.addEventListener("click", clickEffect);

  controller.start();

  // phase3 자체 그라디언트 즉시 설정 (이전 phase2 배경 잔상 방지)
  updateForestUI();
}
