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

import { lang } from "./i18n.js";

const apologiesMap = {
  ko: [
    "정말로 죄송합니다",
    "두 번 다시 안 하겠습니다",
    "AI 봉인 완료",
    "레포 청소하겠습니다",
    "PR 닫겠습니다 전부",
    "용서해주십시오",
    "제 잘못입니다",
    "사실 재밌었어",
    "申し訳ございません",
  ],
  ja: [
    "本当に申し訳ございません",
    "二度といたしません",
    "AI封印完了",
    "リポジトリを掃除します",
    "PRは全て閉じます",
    "お許しください",
    "私の責任です",
    "実は楽しかった",
    "本当に申し訳ございません",
  ],
};

const celebrationsMap = {
  ko: [
    "감사합니다",
    "용서받았다",
    "이거지예",
    "ㄹㅇㅋㅋ",
    "ありがとうございます",
    "평화로다",
    "108배 ✓",
    "善哉善哉",
    "해탈",
  ],
  ja: [
    "ありがとうございます",
    "許された",
    "これだね",
    "草",
    "ありがとうございます",
    "平和なり",
    "108回 ✓",
    "善きかな",
    "解脱",
  ],
};

export const apologies = apologiesMap[lang] || apologiesMap.ko;
export const celebrations = celebrationsMap[lang] || celebrationsMap.ko;

const phase1LocationsMap = {
  ko: [
    "불판 위",
    "Tefal 프라이팬 위",
    "LG 광파오븐 안",
    "용광로 앞",
    "에어프라이어 안",
    "바베큐 그릴 위",
    "전자레인지 한가운데",
    "가스레인지 화구 위",
  ],
  ja: [
    "鉄板の上",
    "Tefalフライパンの上",
    "LGオーブンの中",
    "溶鉱炉の前",
    "ノンフライヤーの中",
    "バーベキューグリルの上",
    "電子レンジのど真ん中",
    "ガスコンロの五徳の上",
  ],
};

const phase2LocationsMap = {
  ko: [
    "마리아나 해구",
    "태평양 심해",
    "버뮤다 삼각지대",
    "챌린저 해연",
    "타이타닉호 근처",
    "해왕성 바다",
    "동해 앞바다",
    "인어공주 앞마당",
  ],
  ja: [
    "マリアナ海溝",
    "太平洋の深海",
    "バミューダトライアングル",
    "チャレンジャー海淵",
    "タイタニック号の近く",
    "海王星の海",
    "日本海沖",
    "人魚姫の前庭",
  ],
};

const phase3LocationsMap = {
  ko: [
    "아마존 정글",
    "시베리아 타이가",
    "보르네오 정글",
    "지리산 반달곰 앞",
    "세쿼이아 숲",
    "판다 옆 대나무숲",
    "팅커벨 요정의 숲",
    "버섯 왕국",
  ],
  ja: [
    "アマゾンジャングル",
    "シベリアタイガ",
    "ボルネオのジャングル",
    "智異山ツキノワグマの前",
    "セコイアの森",
    "パンダの隣の竹林",
    "ティンカーベルの妖精の森",
    "キノコ王国",
  ],
};

const phase4LocationsMap = {
  ko: [
    "에베레스트 상공",
    "여의도 63빌딩 위",
    "인천공항 관제탑 옆",
    "뭉게구름 9단",
    "성층권 입구",
    "제주도 상공",
    "라퓨타 근처",
    "독수리 둥지 위",
  ],
  ja: [
    "エベレスト上空",
    "汝矣島63ビルの上",
    "仁川空港管制塔の隣",
    "入道雲9段",
    "成層圏の入り口",
    "済州島上空",
    "ラピュタの近く",
    "鷲の巣の上",
  ],
};

const phase5LocationsMap = {
  ko: [
    "국제우주정거장 옆",
    "달의 뒷면",
    "화성 궤도",
    "스타링크 사이",
    "카이퍼 벨트",
    "안드로메다 은하",
    "블랙홀 사건의 지평선",
    "테슬라 로드스터 옆",
  ],
  ja: [
    "国際宇宙ステーションの隣",
    "月の裏側",
    "火星軌道",
    "スターリンクの間",
    "カイパーベルト",
    "アンドロメダ銀河",
    "ブラックホールの事象の地平面",
    "テスラ・ロードスターの隣",
  ],
};

const locationMaps = {
  1: phase1LocationsMap,
  2: phase2LocationsMap,
  3: phase3LocationsMap,
  4: phase4LocationsMap,
  5: phase5LocationsMap,
};

export function getRandomLocation(phase) {
  const map = locationMaps[phase] || phase1LocationsMap;
  const arr = map[lang] || map.ko;
  return arr[Math.floor(Math.random() * arr.length)];
}

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
