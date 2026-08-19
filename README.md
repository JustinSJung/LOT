# 🎱 LOTTO AI LAB

**Statistical Lottery Intelligence** — 대한민국 로또 6/45 역대 데이터를 통계적으로
분석하는 재미·연구 목적 웹 서비스입니다.

🔗 **Live**: https://justinsjung.github.io/LOT/

> ⚠️ 이 서비스는 실제 당첨 확률을 예측하거나 높이지 않습니다. 모든 6/45 조합은
> 당첨 확률이 동일합니다. 자세한 내용은 [Disclaimer](#disclaimer) 참고.

---

## Project Overview

로또 6/45의 전체 회차(1회~현재, 1,237회차 기준) 데이터를 기반으로

- 통계적 순위에 따라 번호 조합을 생성하고
- 내가 고른 번호가 역대 몇 번 일치했는지 검색하고
- 번호별 출현 빈도·갭·홀짝/저고 분포 등을 시각화하고
- "AI 모델"이 실제로 랜덤보다 더 잘 맞히는지 역사적으로 백테스트해서 보여주는

서비스입니다. 핵심 원칙은 **"재미·통계 탐색 경험을 통한 자연스러운 재방문"**이며,
실제 로또 구매·참여 빈도를 높이는 방향(스트릭, 참여 횟수 뱃지, 긴박감 조성 카피
등)은 의도적으로 배제했습니다.

## Features

> 아래는 **실제로 구현되어 동작하는 기능만** 적었습니다. 원본 기획에 있었지만
> 아직 없는 기능은 [Roadmap](#roadmap)에 따로 정리했습니다.

### 홈 (`/`)
최신 회차 안내, 5개 하위 기능으로의 진입점.

### 번호 생성기 (`/generator`)
- **5가지 경로**(통계학자 / 핫넘버 추적자 / 콜드넘버 사냥꾼 / 밸런스형 / 와일드카드)로
  동시에 조합 생성, 각 경로마다 Statistical Score(0-100) 표시
- 절제된 톤의 번호 reveal 애니메이션(페이드+슬라이드, bounce/flash 없음,
  `prefers-reduced-motion` 대응) — 세션 내 최고 점수 추적/리롤 유인 요소 없음
- **Combination Character**(Luck Profile): Balance/Pattern/Trend/Rarity/Diversity
  5축 점수 + 8종 캐릭터. 운세가 아닌 "조합의 통계적 특성" 프레이밍
- **What If?**: 번호 한 개를 바꿔보면 점수가 실시간 재계산
- **Saved Sets**: 로그인 없이 브라우저에 번호 저장 → 해당 회차 결과가 실제로
  나오면 재방문 시 "결과가 도착했어요" 배너로 자동 비교 (재방문 루프의 핵심)

### 번호 분석기 (`/analyze`)
6개 번호 입력 → 역대 전체 회차 검색 → 최고 일치 개수/최고 등수, 일치 개수
분포(0~6개) 차트, 번호별 역대/최근 출현 빈도·갭, 3개 이상 일치한 회차 목록.

### 회차 이력 (`/history`)
전체 회차를 회차번호/연도/범위/홀수개수/번호합계로 필터링, 페이지네이션,
회차 클릭 시 홀짝·저고·합계·연속번호 상세 펼침.

### 통계 (`/statistics`)
전체 출현 빈도, 최근 출현 빈도(10/30/50/100회 전환), 핫/콜드넘버, 번호별 갭,
홀짝/저고 분포, 번호 합계 히스토그램, 연속 번호 패턴, 번호 쌍(Pair)/조합(Triple)
빈도 TOP 12. "과거 출현 빈도와 다음 회차 당첨 확률은 무관합니다" 고지 포함.

### 백테스트 (`/backtest`)
- **공식 결과**(seed=42, n=1137, 워밍업 100회 제외)를 고정 배지로 표시
- AI 평균 매치 / 랜덤 평균 매치 / z-score를 **동일한 시각적 비중**으로 나란히
  표시 — 숫자만 보고 "AI가 더 잘 맞는다"고 오해할 수 없는 구조
- 이론적 기댓값(6×6/45=0.8) 기준선이 그어진 막대 차트
- 3개 이상 매치 비율 비교도 같은 방식으로 표시
- **Explore**: 모델·표본 크기를 바꿔 직접 재실행(같은 시드로 조건만 비교),
  "여러 조합을 둘러본 뒤 특정 결과 하나만 떼어서 해석하지 마세요" 경고 포함

### 방법론 (`/methodology`)
"이 사이트의 점수는 당첨 확률이 아니라 통계적 순위 점수"라는 핵심 원칙, 이
사이트가 쓰는 용어(Statistical Score/Historical Pattern/Model Preference 등)
설명, 금지 표현/대체 표현 목록, 페이지별 고지 요약을 한 곳에 모은 페이지.

### Achievement (백그라운드 시스템)
로또 참여 횟수가 아니라 **분석 기능 사용**을 기준으로 하는 9종 업적을
localStorage에 추적합니다(Pattern Detective, Data Explorer, Number Analyst,
Backtest Explorer, Number Personality, What-If Thinker, Set Collector 등 —
7종은 실제 UI 인터랙션에 연결되어 있고, 나머지 2종은 [Roadmap](#roadmap) 참고).
**현재 업적/뱃지를 확인할 수 있는 화면은 없고, 카운터만 내부적으로 쌓입니다.**

### 공통
- 다크 테마 고정, 반응형(모바일 필터 그리드 축소, 45열 차트는 자체 스크롤)
- 전체 한국어 UI, SEO 메타데이터(OpenGraph/Twitter Card/키워드/canonical),
  `robots.txt`/`sitemap.xml`
- 매주 자동 데이터 갱신 + GitHub Pages 자동 배포 (GitHub Actions)

## Architecture

```
src/
  app/                    Next.js App Router 페이지 (generator, analyze, history, statistics, backtest, methodology)
  components/             공용 UI (NumberBall, SiteHeader, SiteFooter)
  lib/
    lottery/              통계 엔진 — 프레임워크 비의존 순수 함수
      types.ts            Draw, LottoNumber, ScoreBreakdown 등 공통 타입
      round.ts            회차 계산 (다음 추첨 회차/시각)
      frequency.ts        출현 빈도, 최근 빈도, 핫/콜드
      gap.ts               번호별 갭(미출현 회차 수)
      distribution.ts     홀짝/저고/합계/연속번호 + 분포 집계
      patterns.ts         번호 쌍/조합 빈도
      rank.ts              매치 개수, 등수 판정
      monteCarlo.ts        랜덤 조합 생성
      rng.ts                시드 고정 가능한 PRNG (mulberry32)
      scoring.ts            6개 축 점수 계산 + 앙상블 스코어
      generator.ts          5가지 모델 기반 조합 생성
      luckProfile.ts        Combination Character 5축 + 캐릭터 판정
      analyzer.ts            번호 세트 역대 검색
      history.ts              회차 필터/상세
      backtest.ts              AI vs 랜덤 백테스트 + 유의성 통계
      validation.ts            번호 유효성 검사
    achievements/          업적 정의 + localStorage 트래커
    savedSets/             저장한 번호 세트 + 결과 매칭
    seo.ts, basePath.ts, sound.ts, generatorPaths.ts
scripts/
  fetch-draws.ts          미러에서 draws.json 갱신 (GitHub Actions 전용)
  generate-stats.ts       numbers/statistics/backtest.json 재생성
  verify-phase*.ts        단계별 데이터 기반 스모크 테스트
data/, public/data/       캐싱된 JSON (draws/numbers/statistics/backtest)
.github/workflows/        데이터 자동 갱신 + Pages 자동 배포
```

**설계 원칙**: `lib/lottery`는 React나 Next.js를 전혀 몰라도 되는 순수 TypeScript
함수 모음입니다. UI(`app/`)는 이 함수들을 호출해 한국어로 화면에 표시만 합니다.
덕분에 통계 로직은 vitest로, 스크립트는 실제 데이터로 독립적으로 검증됩니다.

정적 사이트(Next.js `output: 'export'`)이므로 서버가 없습니다. `data/draws.json`은
빌드 시 `public/data/`로 미러링되고, 각 페이지는 클라이언트에서 이 JSON을 fetch해
브라우저에서 직접 통계를 계산합니다.

## Statistical Methodology

번호 생성기의 Statistical Score는 6개 축의 가중 평균입니다 (`src/lib/lottery/config.ts`):

| 축 | 가중치 | 의미 |
|---|---|---|
| Frequency | 20% | 역대 출현 빈도 |
| Recent Trend | 15% | 최근 30회 출현 빈도 |
| Gap | 10% | 마지막 출현 이후 경과 회차 |
| Balance | 15% | 홀짝/저고 균형 |
| Pattern | 20% | 역대 번호 쌍 동시 출현 빈도 |
| Simulation | 20% | 같은 후보 풀 내 상대적 순위(백분위) |

이 가중치는 **고정된 진리가 아니라 임의의 시작값**입니다. 어떤 조합도 6/45에서
당첨 확률이 동일하므로, 이 점수는 **미래 당첨 확률과 무관한 상대적 통계 순위**일
뿐입니다 — Model Score, Historical Pattern, Model Preference로만 표현하고
"당첨 확률"이라는 표현은 어디에도 쓰지 않습니다.

Combination Character(Luck Profile)는 Balance/Pattern/Trend 3개는 위 스코어를
재사용하고, Rarity(=100−Frequency 스코어)와 Diversity(번호 구간 분산 + 연속번호
페널티)는 별도 계산합니다. 5축 점수 조합으로 8종 캐릭터 중 하나를 결정합니다
(전부·전무 → High Roller/Quiet Player, 두 축 동률 → Wild Card, 그 외 최댓값 축).

## Backtesting Methodology

`src/lib/lottery/backtest.ts`가 각 회차마다 **그 회차 이전 데이터만** 사용해
AI 조합 1개와 랜덤 조합 1개를 생성하고 실제 결과와 비교합니다. `data/backtest.json`에
저장된 "공식" 결과는 다음 조건으로 고정되어 있습니다:

- **시드 42** (`BACKTEST_SEED`), 재현 가능 — `npm run verify-reproducibility`로
  같은 입력이면 항상 완전히 동일한 출력이 나오는지 검증
- **워밍업 100회 제외**, 총 **1,137회차** 평가 (전체 1,237회차 중)
- 모델: ensemble (통계학자 경로)

### 현재 결과 (2026-08-19 기준, 회차 1,237까지)

| 지표 | AI | 랜덤 | 이론적 기댓값 | z-score |
|---|---|---|---|---|
| 평균 매치 수 | 0.7933 | 0.7731 | 0.8 (=6×6/45) | **0.6273** |
| 3개 이상 매치 비율 | 1.85% | 1.85% | — | **0** |

두 z-score 모두 `|z| < 2` — **통계적으로 유의한 차이가 없습니다**. AI 조합과
랜덤 조합 둘 다 이론적 기댓값 0.8 근처에서 움직이고, 3+매치 비율은 사실상
동일합니다. 이는 우연이 아니라 **정확히 예상된 결과**입니다 — 로또는 매회
독립 추첨이므로 과거 패턴 기반 모델이 랜덤을 이길 이론적 근거가 없습니다.
이 결과 자체가 "가짜로 부풀리지 않았다"는 증거로 남겨둔 것입니다.

표본 크기가 통계적으로 크지 않고, z-score는 정식 유의성 검정을 대신하지
않는 최소한의 참고 지표입니다. `/backtest` 페이지의 "Explore" 섹션에서 직접
모델·표본 크기를 바꿔 재현할 수 있습니다.

## Data Source

`data/draws.json`은 **동행복권(dhlottery.co.kr) 공식 API가 아니라 커뮤니티가
유지하는 GitHub Pages 미러**(https://smok95.github.io/lotto)에서 가져옵니다.

**왜 공식 API를 직접 쓰지 않는가**: 동행복권 서버는 이 프로젝트가 접근 가능한
환경(개발 환경 IP 포함)에서 세션/IP 단위로 접속을 차단한 이력이 있습니다
(`scripts/fetch-draws.ts`에 진단 로그로 남아 있음) — User-Agent/Referer를
바꿔도 동일하게 차단되어 헤더 문제가 아니라 IP/세션 차원의 차단으로 확인됐습니다.
원래의 공식 API 직접 호출 구현은 `scripts/fetch-draws.ts` 하단에 주석으로
보존해뒀고, 나중에 접속이 풀리면 그대로 되살릴 수 있습니다.

**한계**: 비공식 미러이므로 표기 오류나 공식 발표 대비 지연 가능성이 있습니다.
특정 회차의 정확도가 중요하다면 동행복권 공식 사이트에서 직접 재확인하세요.

## Local Development

```bash
npm install
npm run dev              # http://localhost:3000
npm run build             # 정적 export (out/), basePath: /LOT 적용
npm test                  # vitest 유닛 테스트
npm run lint               # eslint

npm run fetch-draws         # data/draws.json 갱신 (미러 접근 필요)
npm run generate-stats       # numbers/statistics/backtest.json 재생성 (seed=42 고정)
npm run verify-reproducibility  # 백테스트 재현성 검증
```

## Deployment

정적 사이트(Next.js `output: 'export'`)를 GitHub Pages 프로젝트 사이트로
배포합니다.

- `next.config.ts`: `basePath`/`assetPrefix: '/LOT'`, `trailingSlash: true`,
  `images.unoptimized: true`
- 클라이언트에서 `public/` JSON을 fetch할 때는 `src/lib/basePath.ts`의
  `publicAsset()`으로 `/LOT` 프리픽스를 직접 붙입니다 (Next가 `fetch()`
  호출까지 자동으로 basePath를 붙여주지는 않기 때문)
- 빌드 산출물(`out/`)에 `.nojekyll`을 추가해 GitHub Pages가 Jekyll로
  `_next/` 폴더를 무시하지 않게 함
- Repository → Settings → Pages → Source = **GitHub Actions**로 설정됨
  (`gh api repos/.../pages -f build_type=workflow`로 활성화)

## GitHub Actions

### `.github/workflows/update-lotto-data.yml`
매주 토요일 21:30 KST(UTC 12:30, 추첨 약 30분 후) + 수동 실행.

1. `fetch-draws` 실행 — **실패해도 워크플로우는 성공으로 끝나고 기존 데이터를
   그대로 유지**(graceful fallback). 실패 원인은 워크플로우 로그에 경고로 남음
2. 성공 시에만: `generate-stats`(통계/백테스트 재생성, seed=42 고정) →
   `npm test` → `npm run build`(실제 프로덕션 빌드 검증) → 변경사항 있을 때만 커밋
3. 실제로 GitHub Actions 러너에서 실행해 미러 접근 성공, 자동 커밋까지 확인함

### `.github/workflows/deploy-pages.yml`
`push`(main) / `workflow_run`(Update Lotto Data 완료 후, 성공한 경우만) /
수동 실행 세 가지로 트리거됩니다. 빌드 → `.nojekyll` 생성 → Pages 아티팩트
업로드 → 배포. 실제 배포 후 JS/CSS/폰트/데이터 JSON까지 basePath 안 깨지고
전부 로드되는 것을 확인했습니다.

## Limitations

- **Number Battle**, **Share Card** 미구현 (아래 Roadmap 참고)
- 업적(Achievement) 카운터는 쌓이지만 **확인할 수 있는 화면이 없음**
- OG 이미지(소셜 공유용 카드 이미지) 없음 — 텍스트 메타데이터만 존재
- 백테스트 표본(1,137회차)이 통계적으로 크지 않고, z-score는 정식 유의성
  검정이 아닌 참고 지표
- 데이터 출처가 비공식 미러라 표기 오류/지연 가능성 있음 ([Data Source](#data-source) 참고)
- 계정/로그인 없음 — 저장한 번호는 브라우저 localStorage에만 존재(기기 변경 시
  소실)

## Disclaimer

이 서비스는 **100% 재미·연구 목적 콘텐츠**입니다.

- 실제 당첨 확률을 예측하거나 높이지 않습니다. 공정한 6/45 추첨에서 모든
  조합의 이론적 당첨 확률은 동일합니다.
- "당첨확률 3배", "1등 가능성이 높은 번호", "AI가 당첨번호를 예측" 같은
  표현은 어디에도 쓰지 않으며, 대신 Statistical Score / Historical Pattern /
  Model Preference / Historical Frequency / Backtest Result로만 표현합니다.
- 로또 구매를 권유하거나 유도하지 않으며, 실제 참여 빈도를 높이는 방향의
  기능(스트릭, 참여 뱃지, 긴박감 카피)은 설계상 배제했습니다.

## Roadmap

원본 기획에는 있었지만 아직 구현되지 않은 것들입니다.

- [ ] **Number Battle** — 번호 두 개를 역대 빈도/최근 빈도/갭 기준으로 비교
  (achievement 카운터 `numberBattles`만 정의되어 있고 실제 기능 없음)
- [ ] **Share Card** — 번호+점수+"Historical statistical ranking only." 문구를
  Web Share API로 공유 (achievement 카운터 `resultsShared`만 정의되어 있음)
- [ ] 업적/뱃지 확인 화면 (현재는 localStorage에 카운터만 쌓임)
- [ ] OG 이미지 자동 생성
- [ ] 친구와 번호 대결 (공유 URL 기반)
- [ ] 사용자 계정, 커뮤니티 번호 등록/리더보드 (Supabase 등)
- [ ] Google Analytics, 광고/제휴
- [ ] Threads/블로그 자동 콘텐츠 생성
- [ ] 다른 국가 로또 지원

---

Built with Next.js 16 · TypeScript · Tailwind CSS · vitest — 프레임워크·빌드
도구 없이 순수 함수로 짜인 통계 엔진 위에 얹은 정적 사이트입니다.
