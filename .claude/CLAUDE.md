# CLAUDE.md

AI 에이전트의 무분별한 PR 생성에 대한 사죄 게임. 사용자가 "절" 버튼을 108번 누르면 해탈하는 인터랙티브 웹앱.

## 아키텍처

빌드 도구 없음. 순수 HTML + CSS + ES6 Module.

```
index.html              # 단일 페이지, ES module 진입점
style/main.css          # 전체 스타일 (반응형, CSS 변수 활용)
components/
  core.js               # PhaseController 클래스, globalState, 점수 UI
  interface.js          # lerpColor, playChime, 메시지 풀(apologies/celebrations)
  phase1.js             # Phase 1 초기화/정리 (불판, 온도 시뮬레이션)
  phase2.js             # Phase 2 초기화/정리 (수중, 수심 시뮬레이션)
assets/ripple.svg       # GitHub Actions가 자동 생성하는 contributor 그래프
```

## 게임 흐름

**Phase 1 (불판)** → 108번 절 → liberation → **Phase 2 (수중)** → 108번 절 → liberation → Phase 1 반복

- 절할 때마다 온도/수심 증가, 250ms 틱마다 자연 감소
- 1초 이내 연속 클릭 시 콤보 보너스 (`max(0, 2000 - timeDiff * 2)`)
- 전역 상태(`globalState.score`, `globalState.totalBows`)는 Phase 간 유지

## PhaseController

각 Phase는 `PhaseController`를 생성하고 훅을 등록한다:

```js
const controller = new PhaseController({
  phaseName, maxCount,
  onBow(timeDiff) {},    // 절할 때마다
  onTick() {},           // 250ms마다
  onLiberate() {},       // 108번 완료 시
  onCleanup() {},        // cleanup() 호출 시
});
controller.start();
```

Phase 전환 시 반드시 `controller.cleanup()`을 먼저 호출해야 한다. interval, 이벤트 리스너, DOM 파티클을 모두 정리한다.

## DOM 구조 주의사항

`#dogeza` 안에 `#dogezaEmoji`(span)와 `#divingMask`(div)가 함께 있다.  
`dogeza.textContent`로 이모지를 바꾸면 `#divingMask`가 삭제되므로, 반드시 `#dogezaEmoji`의 `textContent`만 변경한다.

## 반응형

- **데스크톱 (>720px)**: 좌측 영수증 패널, 우측 죄목 패널 표시
- **모바일 (≤720px)**: 상단에 횟수/타이머 스트립만, 패널 숨김
- `env(safe-area-inset-*)` 대응 (노치, 홈바 등)

## CSS 변수

| 변수 | 설정 위치 | 용도 |
|------|-----------|------|
| `--fire-intensity` | phase1.js | 불꽃 강도 (0.0~1.0) |
| `--grill-c1/c2/c3` | phase1.js | 불판 색상 |
| `--dogeza-glow1/2/3` | phase1.js | 도게자 글로우 |

## 명령어

```bash
bash verify.sh   # Prettier 포매팅 검증
```

로컬 실행은 반드시 HTTP 서버로 (ES Module CORS 제약):

```bash
python -m http.server 8080
```
