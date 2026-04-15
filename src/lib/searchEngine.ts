import { TasteCoordinate, InterestKeyword, FlipCardData } from "./store";

// ─── 축 → 역취향 검색 쿼리 맵 ────────────────────────────────────────────────
// 각 취향 축이 낮은 사용자에게 보여줄 반대편 콘텐츠 키워드

const AXIS_ANTI_QUERIES: Record<string, string[]> = {
  디지털:  ["analog living off grid", "digital detox nature lifestyle", "handwriting journaling"],
  오프라인: ["virtual reality daily life", "digital nomad remote work", "metaverse community"],
  사교형:  ["solitude philosophy introvert", "silent retreat alone", "solo travel hermit life"],
  독립형:  ["community festival group dance", "team sports collaboration", "social club gathering"],
  도시형:  ["homestead farm rural life", "wilderness survival nature", "countryside slow life"],
  자연형:  ["smart city urban tech lifestyle", "indoor gaming esports", "skyscraper city living"],
  분석형:  ["intuitive art freeform expression", "dance improvisation emotion", "abstract creativity"],
  창의형:  ["data analysis systematic thinking", "spreadsheet productivity logic", "stoic minimalism"],
};

// ─── 카테고리 ID → 역취향 검색 쿼리 맵 ──────────────────────────────────────
// 사용자가 선택한 카테고리의 반대편 콘텐츠

const CATEGORY_ANTI_QUERIES: Record<string, string[]> = {
  tech:        ["off grid no technology", "analog crafts woodworking", "gardening nature"],
  gaming:      ["outdoor adventure sport extreme", "meditation zen silence", "physical theater"],
  kpop:        ["death metal concert", "classical orchestra symphony", "folk world music ritual"],
  hiking:      ["esports gaming marathon", "urban indoor lifestyle", "luxury hotel stay"],
  minimalism:  ["maximalist interior design baroque", "hoarding collection antique", "maximalist fashion"],
  reading:     ["reality tv binge", "tiktok viral dance trend", "extreme sport action"],
  nightvibes:  ["5am morning routine sunrise", "early bird productivity", "morning meditation"],
  coffee:      ["tea ceremony meditation ritual", "water fasting detox", "silence wellness"],
  anime:       ["documentary realism cinema", "street photography urban", "live jazz improv"],
  fitness:     ["sedentary philosophy thinking", "slow travel wandering", "sleep study rest science"],
  travel:      ["stay home cozy domestic", "single room tiny living", "local neighborhood deep dive"],
  cooking:     ["fasting intermittent diet", "raw unprocessed minimalist eating", "foraging wild food"],
  photography: ["blind experience sensory", "sound art audio installation", "tactile sculpture"],
  design:      ["brutalist raw unfinished aesthetic", "found object art dumpster", "anti-design chaos"],
  music:       ["silence ASMR white noise", "noise ambient experimental", "30 days no music challenge"],
  fashion:     ["uniform capsule wardrobe same outfit", "anti-fashion philosophy", "naked minimalist"],
  nature:      ["concrete jungle urban exploration", "indoor plant-free lifestyle", "all digital art"],
  philosophy:  ["tiktok entertainment viral", "reality show celebrity gossip", "mindless entertainment"],
  film:        ["sports live event stadium", "music festival rave", "improv comedy no script"],
  art:         ["data visualization infographic", "engineering precision", "code generative art"],
  crypto:      ["off-grid barter economy", "local community no money", "anti-capitalism simple life"],
};

// ─── 응답 타입 ────────────────────────────────────────────────────────────────

export type SearchResult = {
  title: string;
  description: string;
  videoId: string;
  channelTitle: string;
  thumbnail: string;
};

// ─── 역취향 검색 쿼리 생성 ────────────────────────────────────────────────────
// evolvedTasteCoordinates에서 가장 낮은 축 2개 + 선택 키워드 기반 반대 쿼리

export function buildAntiTasteQuery(
  tasteCoordinates: TasteCoordinate[],
  selectedKeywords: InterestKeyword[],
): string {
  // 1. 가장 낮은 축 2개 추출 (역취향 효과 극대화 대상)
  const sorted = [...tasteCoordinates].sort((a, b) => a.value - b.value);
  const lowestAxes = sorted.slice(0, 2).map((c) => c.axis);

  // 2. 각 축의 역취향 쿼리 풀에서 랜덤 선택
  const axisQueries = lowestAxes.flatMap((axis) => {
    const pool = AXIS_ANTI_QUERIES[axis] ?? [];
    return pool[Math.floor(Math.random() * pool.length)] ?? "";
  });

  // 3. 선택 키워드 카테고리 기반 역취향 쿼리 추가
  const catIds = selectedKeywords
    .map((k) => (k.id.includes("_") ? k.id.split("_")[0] : k.id))
    .filter((v, i, a) => a.indexOf(v) === i); // 중복 제거

  const catPool = catIds.flatMap((id) => CATEGORY_ANTI_QUERIES[id] ?? []);
  const catQuery = catPool.length > 0
    ? catPool[Math.floor(Math.random() * catPool.length)]
    : "";

  // 4. 조합 — 축 쿼리 + 카테고리 쿼리
  const parts = [...axisQueries, catQuery].filter(Boolean);
  return parts.slice(0, 2).join(" ") || "unexpected culture experience";
}

// ─── YouTube Data API v3 검색 ─────────────────────────────────────────────────

export async function searchYouTube(query: string): Promise<SearchResult | null> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return null;

  const params = new URLSearchParams({
    part:       "snippet",
    q:          query,
    type:       "video",
    maxResults: "10",
    // 성인 인증 불필요 영상만
    safeSearch: "moderate",
    relevanceLanguage: "ko",
    key:        apiKey,
  });

  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?${params}`,
      { next: { revalidate: 3600 } } // 1시간 캐시
    );
    if (!res.ok) return null;

    const data = await res.json();
    const items: any[] = data.items ?? [];
    if (items.length === 0) return null;

    // 결과 중 랜덤 선택 — 매 요청마다 다른 영상
    const item = items[Math.floor(Math.random() * Math.min(5, items.length))];
    return {
      title:        item.snippet.title,
      description:  item.snippet.description,
      videoId:      item.id.videoId,
      channelTitle: item.snippet.channelTitle,
      thumbnail:    item.snippet.thumbnails?.medium?.url ?? "",
    };
  } catch {
    return null;
  }
}

// ─── 검색 결과 → FlipCardData 변환 ───────────────────────────────────────────
// 역취향 카드 구조에 맞게 동적 생성

export function resultToCard(
  result: SearchResult,
  tasteCoordinates: TasteCoordinate[],
  selectedKeywords: InterestKeyword[],
  query: string,
): Omit<FlipCardData, "id" | "date" | "reaction"> {
  // 가장 높은 축 → 프론트 카드 (나의 취향 대표)
  const sorted = [...tasteCoordinates].sort((a, b) => b.value - a.value);
  const topAxis = sorted[0]?.axis ?? "디지털";

  // 프론트 카드: 사용자의 강한 취향 대표 카테고리
  const FRONT_AXIS_LABEL: Record<string, { title: string; desc: string; category: string }> = {
    디지털:  { title: "오늘의 디지털 라이프", category: "테크", desc: "당신의 디지털 세계에서 출발합니다." },
    오프라인: { title: "아날로그 감성 탐구", category: "오프라인", desc: "화면 밖의 세계를 탐험합니다." },
    사교형:  { title: "이번 주 소셜 픽", category: "K-팝", desc: "연결과 공유로 가득한 콘텐츠." },
    독립형:  { title: "혼자만의 시간", category: "미니멀리즘", desc: "고요한 독립 취향의 세계." },
    도시형:  { title: "도시 감성 큐레이션", category: "심야 감성", desc: "도시의 리듬을 담았습니다." },
    자연형:  { title: "자연 속으로", category: "하이킹", desc: "바람과 흙의 감각으로 가득합니다." },
    분석형:  { title: "이번 주 인사이트", category: "독서", desc: "데이터와 논리로 세상을 읽습니다." },
    창의형:  { title: "오늘의 크리에이티브", category: "디자인", desc: "감성과 표현의 경계를 넘어봅니다." },
  };

  const front = FRONT_AXIS_LABEL[topAxis] ?? FRONT_AXIS_LABEL["디지털"];

  // 역취향 이유 3가지 — 쿼리 기반 동적 생성
  const queryWords = query.split(" ").slice(0, 3).join(", ");
  const reasons = [
    `당신은 ${front.category} 세계에 익숙하지만 — 이 콘텐츠는 완전히 다른 규칙으로 움직입니다.`,
    `당신의 알고리즘이 절대 추천하지 않을 영역입니다 — "${result.channelTitle}" 채널의 시각으로 보세요.`,
    `'${queryWords}' — 이 단어들이 당신에게 낯설게 느껴진다면, 그게 바로 역취향의 신호입니다.`,
  ];

  // 그라디언트 — 역취향 카드는 깊고 어두운 톤
  const GRADIENTS = [
    "linear-gradient(135deg, #1a0a2e 0%, #3d1a6e 40%, #6b35a0 100%)",
    "linear-gradient(135deg, #0d2137 0%, #1a4a6e 40%, #2e7ab8 100%)",
    "linear-gradient(135deg, #1a1a0a 0%, #3d3a10 40%, #7a6e20 100%)",
    "linear-gradient(135deg, #2a0a0a 0%, #6e1a1a 40%, #b83535 100%)",
    "linear-gradient(135deg, #0a2a1a 0%, #1a6e3d 40%, #35b87a 100%)",
  ];
  const gradIdx = result.videoId.charCodeAt(0) % GRADIENTS.length;

  return {
    frontContent: {
      title:         front.title,
      category:      front.category,
      description:   front.desc,
      imageGradient: "linear-gradient(135deg, #fff8f0 0%, #ffecd8 50%, #ffdfc0 100%)",
    },
    backContent: {
      title:         result.title,
      category:      "역취향",
      reasons,
      contentLink:   `https://www.youtube.com/watch?v=${result.videoId}`,
      contentType:   "youtube",
      challenge:     `이 영상을 5분만 보세요. 불편함이 느껴진다면 — 그게 성장의 시작입니다.`,
      imageGradient: GRADIENTS[gradIdx],
    },
  };
}
