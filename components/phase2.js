import { lerpColor, getRandomLocation } from "./interface.js";
import { PhaseController } from "./core.js";
import { initPhase1 } from "./phase1.js";
import { lang, translations } from "./i18n.js";

let fishInterval;
let snowInterval;

export function initPhase2() {
  document.body.className = "phase2";

  // UI Setup for Phase 2
  document.title = translations[lang].title_p2;
  document.getElementById("mainTitle").innerHTML = translations[lang].h1_p2;
  document.getElementById("location").textContent = getRandomLocation(2);
  document.getElementById("sweatEffect").textContent = "🫧";
  document.getElementById("tempLabel").textContent =
    translations[lang].receipt_depth;

  const tempEl = document.getElementById("temperature");
  tempEl.textContent = "1000m";
  tempEl.style.color = "#00fff0";
  tempEl.style.textShadow = "0 0 6px #0088cc";

  const divingMask = document.getElementById("divingMask");
  divingMask.style.display = "block";
  divingMask.classList.remove("fly-away");

  // Add Depth Overlay
  const overlay = document.createElement("div");
  overlay.className = "depth-overlay";
  document.getElementById("scene").appendChild(overlay);

  let currentDepth = 1000;
  const shallowTopRgb = [10, 90, 180];
  const shallowBottomRgb = [0, 40, 110];
  const deepTopRgb = [2, 12, 35];
  const deepBottomRgb = [0, 0, 0];

  function updateDepthUI() {
    tempEl.textContent = `${Math.round(currentDepth)}m`;

    // 심해에 따른 어두워짐. 1000~2500 구간에서는 서서히 어두워지고 3500에서는 완전 검은색에 가깝게.
    let ratio = (currentDepth - 1000) / 2500;
    if (ratio < 0) ratio = 0;
    if (ratio > 1) ratio = 1;

    const topColor = lerpColor(shallowTopRgb, deepTopRgb, ratio);
    const bottomColor = lerpColor(shallowBottomRgb, deepBottomRgb, ratio);
    document.body.style.background = `linear-gradient(180deg, ${topColor} 0%, ${bottomColor} 100%)`;

    if (controller.isLiberated) {
      overlay.style.background =
        "radial-gradient(ellipse at center, transparent 30%, rgba(0, 255, 200, 0.4) 100%)";
      overlay.style.opacity = "1";
    } else {
      overlay.style.background = "black";
      // 1000m에서는 opacity 0 (남색 배경이 보임), 3500m에서는 opacity 0.9 (거의 검은색)
      overlay.style.opacity = (ratio * 0.9).toString();
    }

    // 텍스트 경고
    if (currentDepth >= 3000) {
      tempEl.style.color = "#ff0000";
      tempEl.style.textShadow = "0 0 10px #ff0000";
    } else if (currentDepth >= 2000) {
      tempEl.style.color = "#ffb347";
      tempEl.style.textShadow = "0 0 8px #ff6a1a";
    } else {
      tempEl.style.color = "#00fff0";
      tempEl.style.textShadow = "0 0 6px #0088cc";
    }
  }

  function spawnBubble(x, y) {
    const b = document.createElement("div");
    b.className = "bubble";
    b.textContent = "🫧";
    b.style.left = x + "px";
    b.style.top = y + "px";
    b.style.fontSize = 0.8 + Math.random() * 1.2 + "rem";
    document.body.appendChild(b);

    setTimeout(() => {
      if (b.parentNode) b.remove();
    }, 2000);
  }

  function crackIce() {
    const grill = document.querySelector(".grill");
    if (!grill) return;
    const crack = document.createElement("div");
    crack.className = "ice-crack";
    crack.style.left = 20 + Math.random() * 60 + "%";
    grill.appendChild(crack);
    setTimeout(() => crack.remove(), 700);
  }

  function spawnFish() {
    const fishes = ["🐟", "🐠", "🐡", "🦈", "🦑", "🐙"];
    const fish = document.createElement("div");
    fish.className = "fish";

    // 심해어 확률 (깊이에 비례)
    let isDeepSea = false;
    let ratio = (currentDepth - 1000) / 2500;
    if (Math.random() < ratio) {
      isDeepSea = true;
    }

    if (isDeepSea) {
      fish.textContent = ["🦑", "🐙", "🦈", "🪼"][
        Math.floor(Math.random() * 4)
      ];
      fish.style.filter = "drop-shadow(0 0 10px rgba(255,0,0,0.5))";
    } else {
      fish.textContent = fishes[Math.floor(Math.random() * 3)];
    }

    fish.style.top = 10 + Math.random() * 70 + "vh";

    const isLeft = Math.random() > 0.5;
    const dur = 10000 + Math.random() * 10000;

    if (isLeft) {
      fish.style.animation = `swimLeft ${dur}ms linear forwards`;
    } else {
      fish.style.animation = `swimRight ${dur}ms linear forwards`;
    }

    document.body.appendChild(fish);

    setTimeout(() => {
      if (fish.parentNode) fish.remove();
    }, dur);
  }
  fishInterval = setInterval(spawnFish, 3000);

  function spawnSnow() {
    const s = document.createElement("div");
    s.className = "snowflake";
    s.textContent = ["❄️", "❅", "❆"][Math.floor(Math.random() * 3)];
    s.style.left = Math.random() * 100 + "vw";
    s.style.fontSize = 0.5 + Math.random() * 0.9 + "rem";
    document.body.appendChild(s);

    const drift = (Math.random() - 0.5) * 120;
    const dur = 8000 + Math.random() * 6000;
    s.animate(
      [
        { transform: "translate(0, 0) rotate(0deg)", opacity: 0.9 },
        {
          transform: `translate(${drift}px, 105vh) rotate(${(Math.random() - 0.5) * 360}deg)`,
          opacity: 0.2,
        },
      ],
      { duration: dur, easing: "linear" },
    ).onfinish = () => s.remove();
  }
  snowInterval = setInterval(spawnSnow, 600);

  const controller = new PhaseController({
    phaseName: "Phase2",
    maxCount: 108,
    onTick: () => {
      let drop = Math.round((currentDepth - 1000) / 45);
      currentDepth -= drop;
      if (currentDepth < 1000) currentDepth = 1000;
      updateDepthUI();
    },
    onBow: (timeDiff) => {
      if (!controller.isLiberated) {
        let bonus = 0;
        if (timeDiff < 1000) {
          bonus = Math.max(0, 100 - timeDiff / 10);
        }
        currentDepth += 50 + bonus;
        if (currentDepth > 3500) currentDepth = 3500;
        updateDepthUI();
      }

      // 물 흔들림
      const scene = document.getElementById("scene");
      scene.classList.remove("water");
      void scene.offsetWidth;
      scene.classList.add("water");

      // 절할 때마다 주인공 주변에서 기포 발생
      const dogezaRect = document
        .getElementById("dogeza")
        .getBoundingClientRect();
      for (let i = 0; i < 3; i++) {
        spawnBubble(
          dogezaRect.left + Math.random() * dogezaRect.width,
          dogezaRect.top + Math.random() * 50,
        );
      }

      crackIce();
    },
    onLiberate: () => {
      currentDepth = 0;
      tempEl.textContent = "0m";
      tempEl.style.color = "#4ade80";
      tempEl.style.textShadow = "0 0 10px #4ade80";
      updateDepthUI();

      // 마스크 날아가기
      divingMask.classList.add("fly-away");

      // '불 속으로 이동' 버튼 추가
      const btnGroup = document.getElementById("btnGroup");
      const nextBtn = document.createElement("button");
      nextBtn.className = "bow-btn";
      nextBtn.id = "nextPhaseBtn";
      nextBtn.textContent = translations[lang].btn_to_fire;
      nextBtn.style.background = "linear-gradient(180deg, #3a0e08, #1a0a08)";
      nextBtn.style.borderColor = "#c8102e";
      nextBtn.style.display = "none";

      nextBtn.addEventListener("click", () => {
        controller.cleanup();
        initPhase1();
      });
      btnGroup.appendChild(nextBtn);

      setTimeout(() => {
        nextBtn.style.display = "inline-block";
      }, 3000);
    },
    onCleanup: () => {
      clearInterval(fishInterval);
      clearInterval(snowInterval);
      document.removeEventListener("click", clickEffect);
      overlay.remove();

      const nextBtn = document.getElementById("nextPhaseBtn");
      if (nextBtn) nextBtn.remove();

      // 물고기 정리
      document
        .querySelectorAll(".fish, .bubble, .snowflake")
        .forEach((el) => el.remove());
      document.querySelectorAll(".ice-crack").forEach((el) => el.remove());
    },
  });

  // 클릭하면 기포
  function clickEffect(e) {
    if (e.target.tagName === "BUTTON") return;
    if (controller.isLiberated) return;
    for (let i = 0; i < 3; i++) {
      spawnBubble(
        e.clientX + (Math.random() - 0.5) * 40,
        e.clientY + (Math.random() - 0.5) * 40,
      );
    }
  }
  document.addEventListener("click", clickEffect);

  controller.start();
}
