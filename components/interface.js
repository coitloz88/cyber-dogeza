// 선형 보간 함수 (컬러 섞기)
export function lerpColor(c1, c2, ratio) {
  const r = Math.round(c1[0] + (c2[0] - c1[0]) * ratio);
  const g = Math.round(c1[1] + (c2[1] - c1[1]) * ratio);
  const b = Math.round(c1[2] + (c2[2] - c1[2]) * ratio);
  const a =
    c1[3] !== undefined && c2[3] !== undefined
      ? (c1[3] + (c2[3] - c1[3]) * ratio).toFixed(2)
      : 1;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

export const apologies = [
  "정말로 죄송합니다",
  "두 번 다시 안 하겠습니다",
  "AI 봉인 완료",
  "레포 청소하겠습니다",
  "PR 닫겠습니다 전부",
  "용서해주십시오",
  "제 잘못입니다",
  "사실 재밌었어",
  "申し訳ございません",
];

export const celebrations = [
  "감사합니다",
  "용서받았다",
  "이거지예",
  "ㄹㅇㅋㅋ",
  "ありがとうございます",
  "평화로다",
  "108배 ✓",
  "善哉善哉",
  "해탈",
];

// ===== 빰빠바밤 (Web Audio API로 합성) =====
export function playChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    // C major 4분음 상행 아르페지오 (C5, E5, G5, C6)
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = "sine";
      const t = ctx.currentTime + i * 0.18;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.22, t + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 2);
      osc.start(t);
      osc.stop(t + 2);
    });
    // 베이스 공 (low gong)
    const gong = ctx.createOscillator();
    const gongGain = ctx.createGain();
    gong.connect(gongGain);
    gongGain.connect(ctx.destination);
    gong.frequency.value = 130.81; // C3
    gong.type = "triangle";
    gongGain.gain.setValueAtTime(0, ctx.currentTime);
    gongGain.gain.linearRampToValueAtTime(0.28, ctx.currentTime + 0.02);
    gongGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 4);
    gong.start();
    gong.stop(ctx.currentTime + 4);
  } catch (e) {
    /* 오디오 차단 시 무음 */
  }
}

// ===== 꽃잎 떨어지기 =====
export function spawnPetal() {
  const emojis = ["🌸", "🪷", "✨", "🌼", "💮"];
  const p = document.createElement("div");
  p.className = "petal";
  p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
  p.style.left = Math.random() * 100 + "vw";
  p.style.top = "-40px";
  p.style.fontSize = 1 + Math.random() * 1.8 + "rem";
  document.body.appendChild(p);

  const drift = (Math.random() - 0.5) * 200;
  const dur = 6000 + Math.random() * 4000;
  const spin = (Math.random() - 0.5) * 720;

  p.animate(
    [
      { transform: "translate(0, 0) rotate(0deg)", opacity: 1 },
      {
        transform: `translate(${drift}px, 110vh) rotate(${spin}deg)`,
        opacity: 0.7,
      },
    ],
    { duration: dur, easing: "linear" },
  ).onfinish = () => p.remove();
}
