import { lerpColor, getRandomLocation } from "./interface.js";
import { PhaseController } from "./core.js";
import { initPhase1 } from "./phase1.js";
import { lang, translations } from "./i18n.js";

let creatureInterval;
let starInterval;

export function initPhase5() {
  document.body.className = "phase5";

  // UI Setup for Phase 5
  document.title = translations[lang].title_p5;
  document.getElementById("mainTitle").innerHTML = translations[lang].h1_p5;
  document.getElementById("location").textContent = getRandomLocation(5);
  document.getElementById("sweatEffect").textContent = "✨";
  document.getElementById("tempLabel").textContent =
    translations[lang].receipt_space;
  document.getElementById("statusLabel").textContent =
    translations[lang].status_floating;

  const tempEl = document.getElementById("temperature");
  tempEl.textContent = "100km";
  tempEl.style.color = "#b070ff";
  tempEl.style.textShadow = "0 0 6px #7030c0";

  const divingMask = document.getElementById("divingMask");
  divingMask.textContent = "🫙";
  divingMask.style.display = "block";
  divingMask.classList.remove("fly-away");

  // Add Depth Overlay
  const overlay = document.createElement("div");
  overlay.className = "depth-overlay";
  document.getElementById("scene").appendChild(overlay);

  // 해탈 연출용 머스크 따봉 사진 프리로드
  const muskImg = new Image();
  muskImg.src = "./assets/musk-thumbs-up.png";

  let currentKm = 100;
  const nearTopRgb = [10, 10, 40];
  const nearBottomRgb = [30, 20, 60];
  const farTopRgb = [8, 2, 2];
  const farBottomRgb = [60, 15, 5];

  function updateSpaceUI() {
    tempEl.textContent = `${Math.round(currentKm)}km`;

    // 멀어질수록 심우주 + 화성 접근의 붉은 기운.
    let ratio = (currentKm - 100) / 2400;
    if (ratio < 0) ratio = 0;
    if (ratio > 1) ratio = 1;

    const topColor = lerpColor(nearTopRgb, farTopRgb, ratio);
    const bottomColor = lerpColor(nearBottomRgb, farBottomRgb, ratio);
    document.body.style.background = `linear-gradient(180deg, ${topColor} 0%, ${bottomColor} 100%)`;

    if (controller.isLiberated) {
      // 화성 도착 연출
      overlay.style.background =
        "radial-gradient(ellipse at center bottom, rgba(255, 110, 40, 0.55) 0%, rgba(120, 30, 5, 0.35) 60%, transparent 100%)";
      overlay.style.opacity = "1";
    } else {
      overlay.style.background = "black";
      overlay.style.opacity = (ratio * 0.4).toString();
    }

    // 텍스트 경고
    if (currentKm >= 3000) {
      tempEl.style.color = "#ff6a1a";
      tempEl.style.textShadow = "0 0 10px #ff6a1a";
    } else if (currentKm >= 2000) {
      tempEl.style.color = "#ffb347";
      tempEl.style.textShadow = "0 0 8px #ff6a1a";
    } else {
      tempEl.style.color = "#b070ff";
      tempEl.style.textShadow = "0 0 6px #7030c0";
    }
  }

  function spawnStarBurst(x, y) {
    const s = document.createElement("div");
    s.className = "star-burst";
    s.textContent = "✨";
    s.style.left = x + "px";
    s.style.top = y + "px";
    s.style.fontSize = 1 + Math.random() * 0.8 + "rem";
    document.body.appendChild(s);

    setTimeout(() => {
      if (s.parentNode) s.remove();
    }, 2000);
  }

  // "화성 갈끄니까" 전용 플로팅 메시지
  function spawnMuskMessage(big = false) {
    const msg = document.createElement("div");
    msg.textContent = big
      ? translations[lang].musk_p5_arrival
      : translations[lang].musk_p5;
    msg.style.cssText = `
      position: fixed;
      left: ${big ? 50 : 25 + Math.random() * 50}%;
      top: ${big ? 42 : 25 + Math.random() * 35}%;
      transform: translateX(-50%);
      font-family: "Shippori Mincho", serif;
      font-weight: 800;
      font-size: ${big ? "3.2rem" : "2rem"};
      color: #ffd0a0;
      text-shadow: 0 0 14px #ff6a1a, 0 0 30px #c8102e;
      z-index: 40;
      pointer-events: none;
      letter-spacing: 0.08em;
      white-space: nowrap;
    `;
    document.body.appendChild(msg);
    msg.animate(
      [
        { transform: "translateX(-50%) translateY(0) scale(0.7)", opacity: 0 },
        {
          transform: "translateX(-50%) translateY(-30px) scale(1.15)",
          opacity: 1,
          offset: 0.3,
        },
        {
          transform: "translateX(-50%) translateY(-110px) scale(1)",
          opacity: 0,
        },
      ],
      { duration: big ? 3200 : 2000, easing: "ease-out" },
    ).onfinish = () => msg.remove();
  }

  function spawnCreature() {
    const nearBodies = ["🪐", "🌕", "🛰️", "☄️"];
    const farBodies = ["🛸", "👾", "🚀", "🔴"];
    const c = document.createElement("div");
    c.className = "creature";

    // 원거리 물체 확률 (거리에 비례)
    let ratio = Math.min(1, (currentKm - 100) / 2400);
    if (Math.random() < ratio) {
      c.textContent = farBodies[Math.floor(Math.random() * farBodies.length)];
      c.style.filter = "drop-shadow(0 0 10px rgba(255, 80, 30, 0.6))";
    } else {
      c.textContent = nearBodies[Math.floor(Math.random() * nearBodies.length)];
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

  function spawnStar() {
    const s = document.createElement("div");
    s.className = "star";
    s.textContent = ["✨", "⭐", "🌟"][Math.floor(Math.random() * 3)];
    s.style.left = Math.random() * 100 + "vw";
    s.style.top = Math.random() * 100 + "vh";
    s.style.fontSize = 0.5 + Math.random() * 0.9 + "rem";
    document.body.appendChild(s);

    // 우주 유영감: 느린 무중력 드리프트.
    const drift = (Math.random() - 0.5) * 120;
    const dur = 12000 + Math.random() * 8000;
    s.animate(
      [
        { transform: "translate(0, 0) rotate(0deg)", opacity: 0 },
        {
          transform: `translate(${drift * 0.5}px, ${(Math.random() - 0.5) * 40}vh) rotate(${(Math.random() - 0.5) * 90}deg)`,
          opacity: 0.9,
          offset: 0.5,
        },
        {
          transform: `translate(${drift}px, ${(Math.random() - 0.5) * 40}vh) rotate(${(Math.random() - 0.5) * 180}deg)`,
          opacity: 0,
        },
      ],
      { duration: dur, easing: "ease-in-out" },
    ).onfinish = () => s.remove();
  }
  starInterval = setInterval(spawnStar, 600);

  const controller = new PhaseController({
    phaseName: "Phase5",
    maxCount: 108,
    onTick: () => {
      let drop = Math.round((currentKm - 100) / 45);
      currentKm -= drop;
      if (currentKm < 100) currentKm = 100;
      updateSpaceUI();
    },
    onBow: (timeDiff) => {
      if (!controller.isLiberated) {
        let bonus = 0;
        if (timeDiff < 1000) {
          bonus = Math.max(0, 100 - timeDiff / 10);
        }
        currentKm += 50 + bonus;
        if (currentKm > 100000) currentKm = 100000;
        updateSpaceUI();

        // 6번째 절마다 "화성 갈끄니까" 표출
        if (controller.count % 6 === 0) {
          spawnMuskMessage(false);
        }
      }

      // 절할 때마다 주인공 주변에서 별빛 발생
      const dogezaRect = document
        .getElementById("dogeza")
        .getBoundingClientRect();
      for (let i = 0; i < 3; i++) {
        spawnStarBurst(
          dogezaRect.left + Math.random() * dogezaRect.width,
          dogezaRect.top + Math.random() * 50,
        );
      }
    },
    onLiberate: () => {
      // 화성 도착 overlay 연출 (붉은 화성 글로우)
      currentKm = 0;
      updateSpaceUI();

      // 해탈 결과: 화성 도착 거리/장소 (색은 해탈 녹색 유지)
      // core가 해탈 후 onTick을 멈추므로 아래 값은 덮어써지지 않음
      tempEl.textContent = translations[lang].dist_mars;
      tempEl.style.color = "#4ade80";
      tempEl.style.textShadow = "0 0 10px #4ade80";
      document.getElementById("location").textContent =
        translations[lang].loc_mars;

      // 머스크 따봉 사진 배경 표출
      const musk = document.createElement("img");
      musk.className = "musk-overlay";
      musk.src = "./assets/musk-thumbs-up.png";
      musk.alt = "";
      document.body.appendChild(musk);
      setTimeout(() => musk.remove(), 5200);

      // 화성 도착 🚀 대형 표출
      spawnMuskMessage(true);

      // 유리병 헬멧 날아가기
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
      clearInterval(creatureInterval);
      clearInterval(starInterval);
      document.removeEventListener("click", clickEffect);
      overlay.remove();

      const nextBtn = document.getElementById("nextPhaseBtn");
      if (nextBtn) nextBtn.remove();

      // 생물/별 정리 (남은 musk 메시지는 자체 소멸)
      document
        .querySelectorAll(".creature, .star, .star-burst")
        .forEach((el) => el.remove());

      // 5초 내 페이즈 이동 대비: 머스크 배경 사진 제거
      document.querySelectorAll(".musk-overlay").forEach((el) => el.remove());
    },
  });

  // 클릭하면 별빛
  function clickEffect(e) {
    if (e.target.tagName === "BUTTON") return;
    if (controller.isLiberated) return;
    for (let i = 0; i < 3; i++) {
      spawnStarBurst(
        e.clientX + (Math.random() - 0.5) * 40,
        e.clientY + (Math.random() - 0.5) * 40,
      );
    }
  }
  document.addEventListener("click", clickEffect);

  controller.start();

  // phase5 자체 그라디언트 즉시 설정 (이전 phase4 배경 잔상 방지)
  updateSpaceUI();
}
