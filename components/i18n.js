export const lang = navigator.language.startsWith("ja") ? "ja" : "ko";

export const translations = {
  ko: {
    title: "사이버 불판 도게자 — 긴급 사죄 방송",
    title_p2: "사이버 수중 도게자 — 긴급 사죄 방송",
    badge: "⚠ EMERGENCY BROADCAST · 緊急謝罪 ⚠",
    h1_p1: '사이버<span class="stamp" id="titleStamp">불판</span>도게자',
    h1_p2:
      '사이버<span class="stamp" id="titleStamp" style="color:#00fff0; text-shadow:0 0 12px #00fff0;">수중</span>도게자',
    subtitle: '[ 진심사죄 모드 가동중<span class="blink">_</span> ]',
    label_evidence: "사건 경위 / EVIDENCE",
    evidence_1: "AI 에이전트로 PR 양산<br />",
    evidence_names:
      '<span class="name">Jules</span> · <span class="name">Codex</span> · <span class="name">Claude</span><br />',
    evidence_2: "레포지토리 오염<br />",
    evidence_strike: '<span class="strike">변명의 여지 없음</span>',
    label_receipt: "// SAJOE.RECEIPT",
    receipt_victim: "피해자",
    receipt_victim_v: "선생님",
    receipt_attacker: "가해자",
    receipt_attacker_v: "나",
    receipt_temp: "온도",
    receipt_depth: "수심",
    receipt_location: "장소",
    receipt_status: "상태",
    receipt_status_v: "정좌중",
    receipt_count: "절한 횟수",
    receipt_count_v: '<span id="count">1</span> 회',
    receipt_time: "체류시간",
    btn_bow: "한 번 더 사죄",
    btn_thanks: "계속 감사하기",
    btn_to_water: "물 속으로 이동",
    btn_to_fire: "불 속으로 이동",
    lib_big: "解 脱",
    lib_sub: "108배 완료 · 사죄가 받아들여졌습니다",
    lib_en: "LIBERATION ACHIEVED",
  },
  ja: {
    title: "サイバー鉄板土下座 — 緊急謝罪放送",
    title_p2: "サイバー水中土下座 — 緊急謝罪放送",
    badge: "⚠ EMERGENCY BROADCAST · 緊急謝罪 ⚠",
    h1_p1: 'サイバー<span class="stamp" id="titleStamp">鉄板</span>土下座',
    h1_p2:
      'サイバー<span class="stamp" id="titleStamp" style="color:#00fff0; text-shadow:0 0 12px #00fff0;">水中</span>土下座',
    subtitle: '[ 本気謝罪モード稼働中<span class="blink">_</span> ]',
    label_evidence: "事件の経緯 / EVIDENCE",
    evidence_1: "AIエージェントでPR量産<br />",
    evidence_names:
      '<span class="name">Jules</span> · <span class="name">Codex</span> · <span class="name">Claude</span><br />',
    evidence_2: "リポジトリ汚染<br />",
    evidence_strike: '<span class="strike">弁解の余地なし</span>',
    label_receipt: "// SAJOE.RECEIPT",
    receipt_victim: "被害者",
    receipt_victim_v: "先生",
    receipt_attacker: "加害者",
    receipt_attacker_v: "私",
    receipt_temp: "温度",
    receipt_depth: "水深",
    receipt_location: "場所",
    receipt_status: "状態",
    receipt_status_v: "正座中",
    receipt_count: "土下座回数",
    receipt_count_v: '<span id="count">1</span> 回',
    receipt_time: "滞在時間",
    btn_bow: "もう一度謝罪",
    btn_thanks: "感謝し続ける",
    btn_to_water: "水の中へ移動",
    btn_to_fire: "火の中へ移動",
    lib_big: "解 脱",
    lib_sub: "108回完了 · 謝罪が受け入れられました",
    lib_en: "LIBERATION ACHIEVED",
  },
};

export function applyI18n() {
  document.documentElement.lang = lang;
  document.title = translations[lang].title;

  const elements = document.querySelectorAll("[data-i18n]");
  elements.forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (translations[lang][key]) {
      el.innerHTML = translations[lang][key];
    }
  });
}
