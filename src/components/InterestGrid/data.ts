// 관심사 카테고리 데이터 — 20개 대분류, 각 4~5개 세부 키워드
export type Category = {
  id: string;
  label: string;
  emoji: string;
  subKeywords: string[];
};

export const CATEGORIES: Category[] = [
  {
    id: "tech",
    label: "테크",
    emoji: "💻",
    subKeywords: ["AI / 머신러닝", "오픈소스", "스타트업", "개발 도구", "사이버보안"],
  },
  {
    id: "music",
    label: "음악",
    emoji: "🎵",
    subKeywords: ["인디 / 얼터너티브", "재즈", "클래식", "일렉트로닉", "로파이"],
  },
  {
    id: "design",
    label: "디자인",
    emoji: "🎨",
    subKeywords: ["UX / UI", "타이포그래피", "브랜딩", "모션 그래픽", "인테리어"],
  },
  {
    id: "fitness",
    label: "피트니스",
    emoji: "🏋️",
    subKeywords: ["근력 훈련", "러닝", "요가", "HIIT", "스포츠 영양"],
  },
  {
    id: "reading",
    label: "독서",
    emoji: "📚",
    subKeywords: ["SF / 판타지", "철학", "역사", "에세이", "심리학"],
  },
  {
    id: "gaming",
    label: "게임",
    emoji: "🎮",
    subKeywords: ["RPG", "인디 게임", "e스포츠", "보드게임", "스트리밍"],
  },
  {
    id: "travel",
    label: "여행",
    emoji: "✈️",
    subKeywords: ["백패킹", "도시 탐방", "로컬 맛집", "자연 트레킹", "장기 여행"],
  },
  {
    id: "cooking",
    label: "요리",
    emoji: "🍳",
    subKeywords: ["베이킹", "발효 음식", "비건 요리", "이국 요리", "커피 추출"],
  },
  {
    id: "photography",
    label: "사진",
    emoji: "📷",
    subKeywords: ["필름 사진", "스트리트", "풍경", "포트레이트", "다크룸"],
  },
  {
    id: "kpop",
    label: "K-팝",
    emoji: "🎶",
    subKeywords: ["아이돌", "4세대", "보이그룹", "걸그룹", "덕질 문화"],
  },
  {
    id: "hiking",
    label: "하이킹",
    emoji: "🏔️",
    subKeywords: ["국내 산행", "해외 트레일", "캠핑", "비박", "등산 장비"],
  },
  {
    id: "minimalism",
    label: "미니멀리즘",
    emoji: "◻️",
    subKeywords: ["디지털 디톡스", "제로 웨이스트", "캡슐 워드로브", "공간 정리", "슬로우 라이프"],
  },
  {
    id: "anime",
    label: "애니 / 만화",
    emoji: "🌸",
    subKeywords: ["쇼넨", "세카이계", "음악 애니", "웹툰", "코믹스"],
  },
  {
    id: "fashion",
    label: "패션",
    emoji: "👗",
    subKeywords: ["스트릿 패션", "빈티지", "하이패션", "지속가능 패션", "스타일링"],
  },
  {
    id: "nature",
    label: "자연 / 환경",
    emoji: "🌿",
    subKeywords: ["식물 가꾸기", "버드워칭", "생태 여행", "기후 행동", "도시 농업"],
  },
  {
    id: "philosophy",
    label: "철학 / 사상",
    emoji: "🧠",
    subKeywords: ["스토아 철학", "동양 사상", "실존주의", "윤리학", "명상"],
  },
  {
    id: "film",
    label: "영화 / 영상",
    emoji: "🎬",
    subKeywords: ["아트하우스", "다큐멘터리", "단편 영화", "영화 비평", "시네마토그래피"],
  },
  {
    id: "crypto",
    label: "크립토 / 금융",
    emoji: "📈",
    subKeywords: ["블록체인", "DeFi", "개인 금융", "투자 철학", "이코노믹스"],
  },
  {
    id: "nightvibes",
    label: "심야 감성",
    emoji: "🌙",
    subKeywords: ["로파이 힙합", "야경 탐방", "심야 카페", "1인 술자리", "새벽 드라이브"],
  },
  {
    id: "art",
    label: "아트 / 전시",
    emoji: "🖼️",
    subKeywords: ["현대 미술", "일러스트레이션", "조각 / 설치", "갤러리 투어", "NFT 아트"],
  },
];
