# The Flip Side

> **당신이 절대 클릭하지 않을 콘텐츠를 매일 하나씩.**

알고리즘은 당신이 좋아하는 것만 보여줍니다.  
The Flip Side는 반대로 작동합니다.  
당신의 취향 지형을 분석하고, 그 가장 먼 반대편에 있는 콘텐츠를 찾아 건넵니다.

---

## 핵심 개념

### 역취향 (Anti-Taste)
사용자가 선택한 관심 키워드로 8개의 취향 축을 계산합니다.

```
디지털 ↔ 오프라인   /   사교형 ↔ 독립형
도시형 ↔ 자연형     /   분석형 ↔ 창의형
```

점수가 가장 낮은 축 — 즉 가장 낯선 영역 — 을 겨냥한 역취향 쿼리를 생성해 YouTube에서 실시간으로 콘텐츠를 검색합니다.

### 취향 진화
카드에 **Boom Up / Boom Down** 반응을 남기면 해당 축의 점수가 ±12 조정되고, 다음 추천이 그에 맞게 달라집니다.

---

## 기술 스택

| 영역 | 기술 |
|---|---|
| 프레임워크 | Next.js 16 (App Router) |
| UI | styled-components v6, Framer Motion |
| 상태 관리 | Zustand + persist 미들웨어 |
| 차트 | Recharts (레이더 차트) |
| 외부 API | YouTube Data API v3 |
| 언어 | TypeScript |

---

## 주요 기능

- **노드 기반 온보딩** — 20개 카테고리를 3열 그리드로 배치, 클릭 시 서브 키워드가 부채꼴/세로로 확장
- **취향 유형 분석** — 키워드 기반 28가지 두 축 조합 유형 레이블 생성 (예: "데이터로 세상을 읽는 디지털 사상가")
- **레이더 차트** — 8개 취향 축을 시각화한 취향 지형도
- **슬라이더 플립** — 슬라이더를 당겨 카드를 뒤집으면 역취향 콘텐츠 공개
- **동적 추천** — YouTube API 기반 실시간 검색, API 미설정 시 큐레이션 카드풀 폴백
- **아카이브** — 지금까지 만난 카드와 Boom Up/Down 반응 기록 보관

---

## 시작하기

### 1. 설치

```bash
git clone https://github.com/BomEllen/the-flip-side.git
cd the-flip-side
npm install
```

### 2. 환경 변수 설정

`.env.local` 파일에 YouTube Data API v3 키를 입력하세요.

```env
YOUTUBE_API_KEY=여기에_API_키를_입력하세요
```

> API 키 없이도 앱은 정상 작동합니다. 큐레이션된 카드풀로 자동 폴백됩니다.

**YouTube API 키 발급 방법**
1. [Google Cloud Console](https://console.cloud.google.com) 접속
2. 새 프로젝트 생성 → API 및 서비스 → 라이브러리
3. "YouTube Data API v3" 검색 후 활성화
4. 사용자 인증 정보 → API 키 생성

### 3. 개발 서버 실행

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) 접속 후 온보딩을 진행하세요.

---

## 프로젝트 구조

```
src/
├── app/
│   ├── (main)/
│   │   ├── page.tsx              # 홈 — 오늘의 역취향 카드
│   │   └── archive/page.tsx      # 아카이브
│   ├── api/
│   │   └── recommend/route.ts    # POST /api/recommend
│   └── onboarding/page.tsx       # 온보딩 (2단계)
├── components/
│   ├── FlipCard/                 # 앞뒤 플립 카드
│   ├── InterestNodes/            # 노드 기반 키워드 선택 UI
│   ├── TasteMap/                 # 레이더 차트
│   ├── ArchiveGrid/              # 아카이브 카드 그리드
│   └── BottomNav/                # 하단 네비게이션
└── lib/
    ├── store.ts                  # Zustand 전역 상태 + 추천 알고리즘
    └── searchEngine.ts           # 역취향 쿼리 생성 + YouTube 검색
```


