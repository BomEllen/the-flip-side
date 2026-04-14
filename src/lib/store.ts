import { create } from "zustand";
import { persist } from "zustand/middleware";

export type InterestKeyword = {
  id: string;
  label: string;
  emoji: string;
};

export type TasteCoordinate = {
  axis: string;
  value: number; // 0-100
};

export type FlipCardData = {
  id: string;
  date: string;
  frontContent: {
    title: string;
    category: string;
    description: string;
    imageGradient: string;
  };
  backContent: {
    title: string;
    category: string;
    reasons: string[];
    contentLink: string;
    contentType: "youtube" | "article" | "music";
    challenge: string;
    imageGradient: string;
  };
  reaction: "boom-up" | "boom-down" | null;
};

/**
 * Maps a flip-card back-content category to the taste axis it influences.
 * Boom Up → that axis expands (value +DELTA, capped at 95)
 * Boom Down → that axis shrinks (value -DELTA, floored at 15)
 */
export const CATEGORY_TO_AXIS: Record<string, string> = {
  댄스: "사교형",
  디자인: "창의형",
  메탈: "창의형",
  게임: "디지털",
  웰니스: "자연형",
  테크: "디지털",
  하이킹: "자연형",
  "K-팝": "사교형",
  미니멀리즘: "독립형",
  "심야 감성": "독립형",
  음악: "사교형",
  피트니스: "자연형",
  요리: "창의형",
  사진: "창의형",
  아트: "창의형",
};

const REACTION_DELTA = 12; // points moved per reaction

type AppState = {
  // 온보딩
  onboardingComplete: boolean;
  selectedKeywords: InterestKeyword[];
  tasteCoordinates: TasteCoordinate[];      // baseline snapshot, set at onboarding
  evolvedTasteCoordinates: TasteCoordinate[]; // live, updated by Boom Up/Down
  userTypeLabel: string;

  // 카드
  todayCard: FlipCardData | null;
  archiveCards: FlipCardData[];
  isTodayCardFlipped: boolean;

  // 액션
  toggleKeyword: (keyword: InterestKeyword) => void;
  completeOnboarding: () => void;
  flipTodayCard: () => void;
  reactToCard: (id: string, reaction: "boom-up" | "boom-down") => void;
  archiveTodayCard: () => void;
  refreshTodayCard: () => void;
  // 온보딩 페이지 재진입 시 키워드 선택 초기화
  resetKeywords: () => void;
};

const AXES = ["디지털", "오프라인", "사교형", "독립형", "도시형", "자연형", "분석형", "창의형"];

// 카테고리 ID → 강화하는 취향 축
// 서브 키워드 ID는 "{categoryId}_{index}" 형식이므로 앞 부분으로 매핑
const KEYWORD_TO_AXES: Record<string, string[]> = {
  tech:        ["디지털", "분석형"],
  crypto:      ["디지털", "분석형"],
  gaming:      ["디지털"],
  kpop:        ["사교형"],
  hiking:      ["자연형", "오프라인"],
  minimalism:  ["독립형"],
  reading:     ["독립형", "분석형"],
  nightvibes:  ["독립형"],
  coffee:      ["도시형"],
  anime:       ["디지털", "창의형"],
  fitness:     ["자연형"],
  travel:      ["도시형", "오프라인"],
  photography: ["창의형"],
  cooking:     ["창의형"],
  design:      ["창의형"],
  music:       ["사교형", "창의형"],
  fashion:     ["창의형", "사교형"],
  nature:      ["자연형", "오프라인"],
  philosophy:  ["독립형", "분석형"],
  film:        ["창의형", "독립형"],
  art:         ["창의형"],
};

// 상위 2개 축 조합 → 취향 유형 레이블
// 조합 키는 두 축을 알파벳순 정렬해 "A+B" 형태로 만듦
const AXIS_COMBO_LABELS: Record<string, string> = {
  "디지털+분석형":   "데이터로 세상을 읽는 디지털 사상가",
  "디지털+창의형":   "화면 속 세계를 만드는 디지털 크리에이터",
  "디지털+독립형":   "혼자만의 인터넷 우주를 사는 사람",
  "디지털+사교형":   "온라인 문화의 중심에 있는 트렌드 서퍼",
  "디지털+도시형":   "도시의 속도를 즐기는 테크 얼리어답터",
  "디지털+자연형":   "자연을 데이터로 이해하는 이중생활자",
  "디지털+오프라인": "디지털을 알지만 오프를 그리워하는 사람",
  "분석형+창의형":   "논리와 감성 사이를 오가는 지적 탐험가",
  "분석형+독립형":   "혼자 깊이 파고드는 철학적 관찰자",
  "분석형+사교형":   "사람을 분석하며 연결을 만드는 전략가",
  "분석형+도시형":   "도시 구조를 읽는 냉철한 관찰자",
  "분석형+자연형":   "자연의 패턴을 찾는 과학적 산책자",
  "분석형+오프라인": "속도보다 깊이를 택하는 아날로그 지식인",
  "창의형+독립형":   "혼자 만드는 세계에 사는 고독한 아티스트",
  "창의형+사교형":   "바이브를 만들고 퍼뜨리는 문화 발신자",
  "창의형+도시형":   "도시 곳곳에서 영감을 줍는 감성 메이커",
  "창의형+자연형":   "자연에서 아름다움을 길어 올리는 창작자",
  "창의형+오프라인": "손으로 만지고 느끼며 만드는 아날로그 창작자",
  "독립형+사교형":   "혼자이고 싶지만 연결도 원하는 내향 외향인",
  "독립형+도시형":   "도시 속 자신만의 은신처를 가진 사람",
  "독립형+자연형":   "자연 속 고요함을 찾아 떠나는 독립형 여행자",
  "독립형+오프라인": "디지털 소음을 끊고 실재를 택한 슬로우 라이버",
  "사교형+도시형":   "도시의 사람과 문화를 흡수하는 트렌드 허브",
  "사교형+자연형":   "함께 자연을 즐기는 따뜻한 아웃도어 소셜러",
  "사교형+오프라인": "모임과 경험으로 기억을 쌓는 오프라인 연결자",
  "도시형+자연형":   "도심과 자연 사이를 자유롭게 오가는 라이프스타일러",
  "도시형+오프라인": "도시를 두 발로 탐험하는 로컬 디거",
  "자연형+오프라인": "화면을 끄고 바람을 맞으러 나가는 오프그리드 탐험가",
};

// 키워드 기반 취향 좌표 계산 — 선택한 키워드와 연결된 축을 높게 시작
const computeTasteCoordinates = (keywords: InterestKeyword[]): TasteCoordinate[] => {
  // 기본값: 모든 축 35~50 범위에서 시작
  const base: Record<string, number> = Object.fromEntries(
    AXES.map((axis) => [axis, Math.floor(Math.random() * 15) + 35])
  );
  // 선택한 키워드마다 연결 축에 +12~18 부스트
  keywords.forEach((kw) => {
    const axes = KEYWORD_TO_AXES[kw.id] ?? [];
    axes.forEach((axis) => {
      if (base[axis] !== undefined) {
        base[axis] = Math.min(90, base[axis] + Math.floor(Math.random() * 6) + 12);
      }
    });
  });
  return AXES.map((axis) => ({ axis, value: base[axis] }));
};

const getUserTypeLabel = (keywords: InterestKeyword[]): string => {
  // 1. 각 키워드의 카테고리 ID 추출 — "tech_0" → "tech"
  const axisScore: Record<string, number> = Object.fromEntries(
    AXES.map((ax) => [ax, 0])
  );

  keywords.forEach((kw) => {
    const catId = kw.id.includes("_") ? kw.id.split("_")[0] : kw.id;
    const axes  = KEYWORD_TO_AXES[catId] ?? [];
    axes.forEach((ax) => { axisScore[ax] += 1; });
  });

  // 2. 점수 기준 내림차순 정렬 후 상위 2개 축 추출
  const sorted = Object.entries(axisScore)
    .sort((a, b) => b[1] - a[1])
    .filter(([, score]) => score > 0);

  if (sorted.length === 0) return "취향을 탐색 중인 자유로운 영혼";

  const top1 = sorted[0][0];
  const top2 = sorted[1]?.[0];

  if (!top2 || sorted[1][1] === 0) {
    // 압도적으로 한 축만 선택한 경우
    return `${top1} 중심의 순수한 취향인`;
  }

  // 3. 조합 키 생성 — 알파벳순 정렬로 양방향 매핑 통일
  const comboKey = [top1, top2].sort().join("+");
  return AXIS_COMBO_LABELS[comboKey] ?? `${top1}과 ${top2}을 사랑하는 취향인`;
};

// ─── Card pool ────────────────────────────────────────────────────────────────

const CARD_POOL: Omit<FlipCardData, "id" | "date" | "reaction">[] = [
  {
    frontContent: {
      title: "오늘의 테크 다이제스트",
      category: "테크",
      description: "당신이 관심 갖는 AI, 가젯, 개발 도구 최신 소식.",
      imageGradient: "linear-gradient(135deg, #fff0e8 0%, #ffe4cc 50%, #ffd4b0 100%)",
    },
    backContent: {
      // 탱고는 통제 포기와 타인과의 연결 — Brené Brown의 취약성 TED가 그 철학을 담음
      title: "아르헨티나 탱고 기초",
      category: "댄스",
      reasons: [
        "당신은 모든 것을 최적화하지만 — 탱고는 완전한 통제 포기를 요구합니다.",
        "당신은 혼자 깊이 집중하는 걸 좋아하지만 — 탱고는 두 사람 사이에서만 존재합니다.",
        "당신의 플레이리스트는 알고리즘이 만들지만 — 탱고는 순수한 인간의 즉흥에서 태어납니다.",
      ],
      // Brené Brown "The Power of Vulnerability" — 탱고는 몸으로 취약성을 드러내는 춤
      contentLink: "https://www.youtube.com/watch?v=iCvmsMzlF7o",
      contentType: "youtube",
      challenge: "탱고 영상을 10분간 시청하세요. 폰 확인 금지. 오직 감상만.",
      imageGradient: "linear-gradient(135deg, #b54300 0%, #d4380d 40%, #fa6520 100%)",
    },
  },
  {
    frontContent: {
      title: "미니멀 라이프 가이드",
      category: "미니멀리즘",
      description: "디지털과 물리 공간 모두를 비우는 법.",
      imageGradient: "linear-gradient(135deg, #fff9ec 0%, #fff3d6 50%, #ffe8b8 100%)",
    },
    backContent: {
      title: "맥시멀리스트 인테리어 디자인",
      category: "디자인",
      reasons: [
        "당신은 모든 걸 덜어내지만 — 맥시멀리즘은 의미를 겹겹이 쌓습니다.",
        "당신은 소음이 불편하지만 — 이 공간들은 의도적으로 시끄럽습니다.",
        "당신은 뺌으로 큐레이션하지만 — 이건 급진적인 더하기입니다.",
      ],
      // CGP Grey "This Video Will Make You Angry" — 알고리즘이 극단화를 증폭시키는 방식, 맥시멀한 정보 소비의 역설
      contentLink: "https://www.youtube.com/watch?v=rE3j_RHkqJc",
      contentType: "youtube",
      challenge: "오늘, '불필요한' 장식 오브제 하나를 당신의 공간에 추가하세요.",
      imageGradient: "linear-gradient(135deg, #7b2d00 0%, #c0390b 40%, #e67522 100%)",
    },
  },
  {
    frontContent: {
      title: "K-팝 차트 위클리",
      category: "K-팝",
      description: "이번 주 상위 아이돌과 컴백 트랙 모음.",
      imageGradient: "linear-gradient(135deg, #fff0f5 0%, #ffe4ee 50%, #ffd4e8 100%)",
    },
    backContent: {
      // K-팝 초정밀 안무 vs 즉흥 음악 — Bobby McFerrin이 관객과 즉흥으로 만드는 음악
      title: "즉흥 음악 — 알고리즘 없는 비트",
      category: "음악",
      reasons: [
        "K-팝은 수백 번 리허설하지만 — 이 공연은 지금 이 순간에만 존재합니다.",
        "당신의 플레이리스트는 알고리즘이 만들지만 — 여기선 100명의 낯선 관객이 함께 만듭니다.",
        "K-팝은 완벽한 동기화를 추구하지만 — 이 음악은 아무도 미리 계획하지 않았습니다.",
      ],
      // Bobby McFerrin — 오직 몸과 목소리, 관객 즉흥으로 펜타토닉 스케일 시연
      contentLink: "https://www.youtube.com/watch?v=ne6tB2KiZuk",
      contentType: "music",
      challenge: "오늘 이동 중에 이어폰 없이, 주변 소리만으로 즉흥 리듬을 만들어보세요.",
      imageGradient: "linear-gradient(135deg, #8b1a00 0%, #c0390b 40%, #e74c20 100%)",
    },
  },
  {
    frontContent: {
      title: "도심 근교 등산 코스",
      category: "하이킹",
      description: "주말 탈출을 위한 서울 근교 베스트 트레일.",
      imageGradient: "linear-gradient(135deg, #fffbec 0%, #fff5d0 50%, #ffe8b0 100%)",
    },
    backContent: {
      title: "프로 e스포츠 다큐멘터리",
      category: "게임",
      reasons: [
        "당신은 신선한 공기와 움직임을 추구하지만 — e스포츠는 12시간 실내 세션입니다.",
        "당신은 자연 속에서 플러그를 뽑지만 — 이 선수들은 영구적으로 연결되어 있습니다.",
        "당신은 풍경을 보러 여행하지만 — 그들은 모니터를 보러 여행합니다.",
      ],
      // Valve 공식 도타2 e스포츠 다큐 "Free to Play"
      contentLink: "https://www.youtube.com/watch?v=UjZYMI1zB9s",
      contentType: "youtube",
      challenge: "e스포츠 토너먼트 스트리밍을 20분간 시청해보세요.",
      imageGradient: "linear-gradient(135deg, #4a1500 0%, #7b3f00 40%, #d44000 100%)",
    },
  },
  {
    frontContent: {
      title: "심야 도시 바이브",
      category: "심야 감성",
      description: "야행성 인간을 위한 로파이와 네온 감성 큐레이션.",
      imageGradient: "linear-gradient(135deg, #ffe8f0 0%, #ffd4e4 50%, #ffc8dc 100%)",
    },
    backContent: {
      title: "새벽 5시 모닝 루틴의 과학",
      category: "웰니스",
      reasons: [
        "당신은 새벽 2시에 살아있지만 — 이 콘텐츠는 당신이 10시에 잔다고 가정합니다.",
        "당신의 창의력은 자정에 피크지만 — 이건 새벽 5시 저널링을 주장합니다.",
        "당신은 밤의 고요를 즐기지만 — 그들은 세상이 깨기 전 고요를 찾습니다.",
      ],
      // Andrew Huberman — 수면 과학과 이른 기상의 신경과학적 근거
      contentLink: "https://www.youtube.com/watch?v=nm1TxQj9IsQ",
      contentType: "youtube",
      challenge: "내일 아침 6시 알람을 설정하세요. 안 일어나도 됩니다 — 그 느낌만 느껴보세요.",
      imageGradient: "linear-gradient(135deg, #6b1a00 0%, #992d00 40%, #e05a00 100%)",
    },
  },
  {
    frontContent: {
      title: "스페셜티 커피 가이드",
      category: "커피",
      description: "싱글 오리진부터 에어로프레스까지, 오늘의 커피 깊이 탐구.",
      imageGradient: "linear-gradient(135deg, #fff5e8 0%, #ffecd0 50%, #ffddb0 100%)",
    },
    backContent: {
      title: "일본 말차 다도의 세계",
      category: "웰니스",
      reasons: [
        "당신의 커피는 10분 안에 완성되지만 — 다도는 1시간의 침묵을 요구합니다.",
        "당신은 효율을 위해 카페인을 마시지만 — 다도는 아무 목적 없는 행위 자체가 목표입니다.",
        "당신의 카페는 노트북으로 가득하지만 — 다도실에는 스크린이 없습니다.",
      ],
      // Kurzgesagt "What Are You?" — 자아와 존재에 대한 철학, 다도의 무위(無為) 정신과 맞닿음
      contentLink: "https://www.youtube.com/watch?v=JQVmkDUkZT4",
      contentType: "youtube",
      challenge: "오늘 한 가지 음료를 아무것도 하지 않으면서 천천히 마셔보세요.",
      imageGradient: "linear-gradient(135deg, #2d5a1b 0%, #4a8c2a 40%, #72b84a 100%)",
    },
  },
  {
    frontContent: {
      title: "홈트 루틴 & 피트니스",
      category: "피트니스",
      description: "데이터로 최적화한 운동 루틴과 영양 가이드.",
      imageGradient: "linear-gradient(135deg, #fff8e8 0%, #fff0cc 50%, #ffe4a0 100%)",
    },
    backContent: {
      title: "아무것도 안 하기의 철학",
      category: "웰니스",
      reasons: [
        "당신은 매일 PR을 깨려 하지만 — 이 철학은 생산성 자체를 거부합니다.",
        "당신의 앱은 칼로리를 추적하지만 — 이건 모든 추적을 멈추라고 합니다.",
        "당신은 몸을 최적화하지만 — 이건 몸이 아닌 존재 자체로 돌아가는 길입니다.",
      ],
      // Kurzgesagt "Optimistic Nihilism" — 아무것도 중요하지 않다면, 무엇을 해도 괜찮다
      contentLink: "https://www.youtube.com/watch?v=MBRqu0YOH14",
      contentType: "youtube",
      challenge: "오늘 30분, 진짜 아무것도 하지 마세요. 폰도, 음악도, 생각 정리도 없이.",
      imageGradient: "linear-gradient(135deg, #5a3a00 0%, #8b5a00 40%, #c88020 100%)",
    },
  },
  {
    frontContent: {
      title: "이번 주 베스트셀러 픽",
      category: "독서",
      description: "지금 가장 많이 읽히는 논픽션 & 소설 큐레이션.",
      imageGradient: "linear-gradient(135deg, #fff4ec 0%, #ffe8d4 50%, #ffd8b8 100%)",
    },
    backContent: {
      title: "TRPG — 테이블 위의 즉흥 연극",
      category: "게임",
      reasons: [
        "당신은 혼자 읽고 생각하지만 — TRPG는 6명이 함께 이야기를 만듭니다.",
        "당신은 완성된 서사를 소비하지만 — 여기선 당신이 직접 서사를 씁니다.",
        "당신은 작가의 세계로 들어가지만 — TRPG는 당신이 작가가 됩니다.",
      ],
      // Matthew Colville "Your First Adventure | Running the Game" — D&D 입문 공식 가이드
      contentLink: "https://www.youtube.com/watch?v=zTD2RZz6mlo",
      contentType: "youtube",
      challenge: "D&D 입문 영상 하나를 끝까지 보세요. 당신이 어떤 캐릭터일지 상상하면서.",
      imageGradient: "linear-gradient(135deg, #3a1a5a 0%, #6b2d8b 40%, #9b4dbb 100%)",
    },
  },
  {
    frontContent: {
      title: "필름 사진의 부활",
      category: "사진",
      description: "디지털 시대에 아날로그 감성이 돌아오는 이유.",
      imageGradient: "linear-gradient(135deg, #fef5e8 0%, #fdecd0 50%, #fcddb0 100%)",
    },
    backContent: {
      // 시각적 사고 — 사진가는 눈으로 보지만, 어떤 뇌는 완전히 다른 방식으로 세상을 이미지화
      title: "시각적 사고 — 이미지로 생각하는 뇌의 세계",
      category: "아트",
      reasons: [
        "당신은 카메라로 세상을 포착하지만 — 어떤 뇌는 카메라 없이 세상 전체를 사진으로 기억합니다.",
        "당신은 완벽한 프레임을 찾아 셔터를 누르지만 — 이들은 눈을 감아도 완전한 시각 세계에 삽니다.",
        "당신은 이미지를 편집하고 선택하지만 — 이들의 뇌는 본 것을 거의 지우지 않습니다.",
      ],
      // Temple Grandin "The World Needs All Kinds of Minds" — 다른 방식의 시각적 인식
      contentLink: "https://www.youtube.com/watch?v=fn_9f5x0f1Q",
      contentType: "youtube",
      challenge: "오늘 촬영한 사진을 저장하지 말고 — 그 장면을 눈을 감고 기억으로만 재현해보세요.",
      imageGradient: "linear-gradient(135deg, #1a1a2e 0%, #4a3060 40%, #8b5a90 100%)",
    },
  },
  {
    frontContent: {
      title: "홈쿡 레시피 탐험",
      category: "요리",
      description: "오늘 집에서 도전할 이국적 요리 베스트.",
      imageGradient: "linear-gradient(135deg, #fff6e8 0%, #ffecd0 50%, #ffe0b0 100%)",
    },
    backContent: {
      title: "간헐적 단식 — 먹지 않음의 과학",
      category: "웰니스",
      reasons: [
        "당신은 새로운 맛을 탐구하지만 — 이건 아무것도 먹지 않는 것이 핵심입니다.",
        "당신의 부엌은 항상 바쁘지만 — 이 실천은 주방을 하루 종일 닫아둡니다.",
        "당신은 음식으로 문화를 경험하지만 — 단식은 음식 없는 자유를 주장합니다.",
      ],
      // Kurzgesagt "You Are Immune Against Every Disease" — 몸이 이미 완벽한 시스템임을 보여줌, 단식 집착의 반대편
      contentLink: "https://www.youtube.com/watch?v=LmpuerlbJu0",
      contentType: "youtube",
      challenge: "내일 아침 식사를 두 시간 늦춰보세요. 배고픔을 그냥 느껴보는 것만으로 OK.",
      imageGradient: "linear-gradient(135deg, #4a2a00 0%, #8b4a00 40%, #c87020 100%)",
    },
  },
  {
    frontContent: {
      title: "세계 여행 버킷리스트",
      category: "여행",
      description: "올해 반드시 가야 할 숨겨진 목적지 모음.",
      imageGradient: "linear-gradient(135deg, #fff0e8 0%, #ffe4cc 50%, #ffd8b0 100%)",
    },
    backContent: {
      title: "한 동네에서 30년 — 정착의 철학",
      category: "웰니스",
      reasons: [
        "당신은 새로운 곳을 갈망하지만 — 이 사람들은 한 골목을 30년 걷습니다.",
        "당신은 낯선 문화에서 자신을 발견하지만 — 이들은 익숙함 속에서 깊이를 팝니다.",
        "당신의 지도는 핀으로 가득하지만 — 이들의 지도는 핀이 하나입니다.",
      ],
      // Barry Schwartz "The Paradox of Choice" — 선택지가 많을수록 덜 행복하다 = 정착의 역설적 자유
      contentLink: "https://www.youtube.com/watch?v=VO6XEQIsCoM",
      contentType: "youtube",
      challenge: "오늘 걸어서 10분 거리 안에서 한 번도 들어간 적 없는 곳에 들어가 보세요.",
      imageGradient: "linear-gradient(135deg, #1a3a2a 0%, #2d6a4a 40%, #4a9a6a 100%)",
    },
  },
  {
    frontContent: {
      title: "플레이리스트 큐레이션",
      category: "음악",
      description: "알고리즘이 추천하는 이번 주 무드별 음악 모음.",
      imageGradient: "linear-gradient(135deg, #fff4f0 0%, #ffe8e0 50%, #ffdcd0 100%)",
    },
    backContent: {
      title: "묵언 수행 — 3일간의 침묵",
      category: "웰니스",
      reasons: [
        "당신의 귀엔 항상 음악이 흐르지만 — 묵언 수행의 첫 번째 규칙은 소리를 끄는 것입니다.",
        "당신은 무드를 음악으로 조절하지만 — 이건 감정을 날것 그대로 두는 수련입니다.",
        "당신의 플레이리스트는 2만 곡이지만 — 침묵은 단 하나의 트랙입니다.",
      ],
      // Kurzgesagt "Loneliness" — 침묵 속 고독의 과학, 묵언 수행의 심리적 이면
      contentLink: "https://www.youtube.com/watch?v=n3Xv_g3g-mA",
      contentType: "youtube",
      challenge: "오늘 이동 중에 이어폰을 빼보세요. 주변 소리를 그냥 듣는 것만으로도 충분합니다.",
      imageGradient: "linear-gradient(135deg, #1a1a3a 0%, #2a2a5a 40%, #4a4a8a 100%)",
    },
  },
];

// 프론트 카드 카테고리 → 연관 키워드 ID — 사용자 관심사와 프론트 카드 매칭에 사용
const FRONT_CATEGORY_TO_KEYWORDS: Record<string, string[]> = {
  테크:       ["tech", "crypto"],
  "K-팝":     ["kpop"],
  하이킹:     ["hiking", "nature"],
  미니멀리즘: ["minimalism"],
  "심야 감성":["nightvibes"],
  커피:       ["coffee"],
  피트니스:   ["fitness"],
  독서:       ["reading"],
  사진:       ["photography"],
  요리:       ["cooking"],
  여행:       ["travel"],
  음악:       ["music"],
  게임:       ["gaming"],
  디자인:     ["design"],
  패션:       ["fashion"],
};

// 오늘 날짜 문자열 반환 (YYYY-MM-DD)
function todayDateStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// 날짜 기반 시드 — 동점 카드 간 매일 다른 순서 보장
function dayOfYear(): number {
  const now = new Date();
  return Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000
  );
}

/**
 * 개인화 카드 선택 알고리즘
 *
 * 점수 구성:
 *  1. 역취향 점수 (+0~200): 백 카드 타겟 축이 사용자 evolvedCoords에서 낮을수록 높음
 *     — 이미 높은 축을 더 올리는 것이 아니라, 낮은 축을 경험시켜 취향 지형 확장
 *  2. 관심 매칭 점수 (+0~75): 프론트 카드 카테고리가 사용자 키워드와 일치할수록 높음
 *     — 친숙한 관심사에서 출발해야 역취향 충격이 실감남
 *  3. 다양성 점수 (+0~11): 날짜 시드로 동점 시 매일 다른 카드 선택
 *  4. 중복 패널티 (-500): 이미 아카이브에 있는 카드 우선순위 최하위
 */
function getPersonalizedCard(
  evolvedCoords: TasteCoordinate[],
  selectedKeywords: InterestKeyword[],
  archiveCards: FlipCardData[]
): FlipCardData {
  const dateStr = todayDateStr();
  const seed = dayOfYear();
  const userKeywordIds = new Set(selectedKeywords.map((k) => k.id));
  // 이미 본 카드 식별 (프론트 카드 제목 기준)
  const seenTitles = new Set(archiveCards.map((c) => c.frontContent.title));

  const scored = CARD_POOL.map((template, idx) => {
    let score = 0;

    // 1. 중복 패널티
    if (seenTitles.has(template.frontContent.title)) score -= 500;

    // 2. 역취향 점수 — 백 카드의 타겟 축이 사용자에게 낮을수록 우선 추천
    const backAxis = CATEGORY_TO_AXIS[template.backContent.category];
    if (backAxis && evolvedCoords.length > 0) {
      const coord = evolvedCoords.find((c) => c.axis === backAxis);
      // (100 - value) * 2: 축이 낮을수록 역취향 효과 극대화
      if (coord) score += (100 - coord.value) * 2;
    }

    // 3. 관심 매칭 점수 — 프론트 카드가 사용자 키워드와 가까울수록 거부감 없이 노출
    const relatedKws = FRONT_CATEGORY_TO_KEYWORDS[template.frontContent.category] ?? [];
    score += relatedKws.filter((k) => userKeywordIds.has(k)).length * 25;

    // 4. 날짜 시드 다양성 — 동점 시 매일 다른 카드 선택
    score += ((idx + seed) % CARD_POOL.length) * 0.1;

    return { template, score };
  });

  // 최고 점수 카드 선택
  scored.sort((a, b) => b.score - a.score);
  return { ...scored[0].template, id: `today-${dateStr}`, date: dateStr, reaction: null };
}

export const MOCK_ARCHIVE_CARDS: FlipCardData[] = [
  {
    id: "archive-1",
    date: "2026-04-06",
    frontContent: {
      title: "미니멀 라이프 가이드",
      category: "미니멀리즘",
      description: "디지털과 물리 공간 모두를 비우는 법.",
      imageGradient: "linear-gradient(135deg, #fff9ec 0%, #fff3d6 50%, #ffe8b8 100%)",
    },
    backContent: {
      title: "맥시멀리스트 인테리어 디자인",
      category: "디자인",
      reasons: [
        "당신은 모든 걸 덜어내지만 — 맥시멀리즘은 의미를 겹겹이 쌓습니다.",
        "당신은 소음이 불편하지만 — 이 공간들은 의도적으로 시끄럽습니다.",
        "당신은 뺌으로 큐레이션하지만 — 이건 급진적인 더하기입니다.",
      ],
      contentLink: "https://example.com",
      contentType: "article",
      challenge: "오늘, '불필요한' 장식 오브제 하나를 당신의 공간에 추가하세요.",
      imageGradient: "linear-gradient(135deg, #7b2d00 0%, #c0390b 40%, #e67522 100%)",
    },
    reaction: "boom-up",
  },
  {
    id: "archive-2",
    date: "2026-04-05",
    frontContent: {
      title: "K-팝 차트 위클리",
      category: "K-팝",
      description: "이번 주 상위 아이돌과 컴백 트랙 모음.",
      imageGradient: "linear-gradient(135deg, #fff0f5 0%, #ffe4ee 50%, #ffd4e8 100%)",
    },
    backContent: {
      title: "노르웨이 블랙 메탈의 역사",
      category: "메탈",
      reasons: [
        "K-팝은 초정밀 완성도지만 — 블랙 메탈은 날것의 혼돈을 찬양합니다.",
        "당신은 칼군무를 사랑하지만 — 블랙 메탈은 모든 다듬음을 거부합니다.",
        "당신의 팬덤은 따뜻하지만 — 이 씬은 철저히 반사회적이었습니다.",
      ],
      contentLink: "https://example.com",
      contentType: "music",
      challenge: "블랙 메탈 트랙 한 곡을 스킵 없이 완청해보세요.",
      imageGradient: "linear-gradient(135deg, #8b1a00 0%, #c0390b 40%, #e74c20 100%)",
    },
    reaction: "boom-down",
  },
  {
    id: "archive-3",
    date: "2026-04-04",
    frontContent: {
      title: "도심 근교 등산 코스",
      category: "하이킹",
      description: "주말 탈출을 위한 서울 근교 베스트 트레일.",
      imageGradient: "linear-gradient(135deg, #fffbec 0%, #fff5d0 50%, #ffe8b0 100%)",
    },
    backContent: {
      title: "프로 e스포츠 다큐멘터리",
      category: "게임",
      reasons: [
        "당신은 신선한 공기와 움직임을 추구하지만 — e스포츠는 12시간 실내 세션입니다.",
        "당신은 자연 속에서 플러그를 뽑지만 — 이 선수들은 영구적으로 연결되어 있습니다.",
        "당신은 풍경을 보러 여행하지만 — 그들은 모니터를 보러 여행합니다.",
      ],
      contentLink: "https://example.com",
      contentType: "youtube",
      challenge: "e스포츠 토너먼트 스트리밍을 20분간 시청해보세요.",
      imageGradient: "linear-gradient(135deg, #4a1500 0%, #7b3f00 40%, #d44000 100%)",
    },
    reaction: "boom-up",
  },
  {
    id: "archive-4",
    date: "2026-04-03",
    frontContent: {
      title: "심야 도시 바이브",
      category: "심야 감성",
      description: "야행성 인간을 위한 로파이와 네온 감성 큐레이션.",
      imageGradient: "linear-gradient(135deg, #ffe8f0 0%, #ffd4e4 50%, #ffc8dc 100%)",
    },
    backContent: {
      title: "새벽 5시 모닝 루틴의 과학",
      category: "웰니스",
      reasons: [
        "당신은 새벽 2시에 살아있지만 — 이 콘텐츠는 당신이 10시에 잔다고 가정합니다.",
        "당신의 창의력은 자정에 피크지만 — 이건 새벽 5시 저널링을 주장합니다.",
        "당신은 밤의 고요를 즐기지만 — 그들은 세상이 깨기 전 고요를 찾습니다.",
      ],
      contentLink: "https://example.com",
      contentType: "article",
      challenge: "내일 아침 6시 알람을 설정하세요. 안 일어나도 됩니다 — 그 느낌만 느껴보세요.",
      imageGradient: "linear-gradient(135deg, #6b1a00 0%, #992d00 40%, #e05a00 100%)",
    },
    reaction: null,
  },
];

// ─── Store ─────────────────────────────────────────────────────────────────────

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      onboardingComplete: false,
      selectedKeywords: [],
      tasteCoordinates: [],
      evolvedTasteCoordinates: [],
      userTypeLabel: "",
      // 초기화 시점엔 취향 데이터 없음 — 날짜 시드로 임시 카드 배정
      todayCard: getPersonalizedCard([], [], []),
      archiveCards: MOCK_ARCHIVE_CARDS,
      isTodayCardFlipped: false,

      toggleKeyword: (keyword) => {
        const { selectedKeywords } = get();
        const exists = selectedKeywords.find((k) => k.id === keyword.id);
        if (exists) {
          set({ selectedKeywords: selectedKeywords.filter((k) => k.id !== keyword.id) });
        } else if (selectedKeywords.length < 10) {
          set({ selectedKeywords: [...selectedKeywords, keyword] });
        }
      },

      completeOnboarding: () => {
        const { selectedKeywords, archiveCards } = get();
        const coords = computeTasteCoordinates(selectedKeywords);
        // 온보딩 완료 즉시 키워드·취향 좌표 기반 첫 번째 개인화 카드 배정
        const personalizedCard = getPersonalizedCard(coords, selectedKeywords, archiveCards);
        set({
          onboardingComplete: true,
          tasteCoordinates: coords,
          evolvedTasteCoordinates: coords,
          userTypeLabel: getUserTypeLabel(selectedKeywords),
          todayCard: personalizedCard,
          isTodayCardFlipped: false,
        });
      },

      flipTodayCard: () => set({ isTodayCardFlipped: true }),

      reactToCard: (id, reaction) => {
        const { todayCard, archiveCards, evolvedTasteCoordinates } = get();

        // 1. Find the card so we know its category and previous reaction
        const card =
          todayCard?.id === id
            ? todayCard
            : archiveCards.find((c) => c.id === id);

        const previousReaction = card?.reaction ?? null;
        const category = card?.backContent.category;

        // 2. Update card reaction in state
        const updatedTodayCard =
          todayCard?.id === id ? { ...todayCard, reaction } : todayCard;
        const updatedArchive = archiveCards.map((c) =>
          c.id === id ? { ...c, reaction } : c
        );

        // 3. Update evolvedTasteCoordinates for the affected axis
        //    net delta = new effect - old effect (handles toggling between reactions)
        const newEffect = reaction === "boom-up" ? REACTION_DELTA : -REACTION_DELTA;
        const oldEffect =
          previousReaction === "boom-up"
            ? REACTION_DELTA
            : previousReaction === "boom-down"
            ? -REACTION_DELTA
            : 0;
        const netDelta = newEffect - oldEffect;

        let newEvolved = evolvedTasteCoordinates;
        if (category && netDelta !== 0) {
          const targetAxis = CATEGORY_TO_AXIS[category];
          if (targetAxis && evolvedTasteCoordinates.length > 0) {
            newEvolved = evolvedTasteCoordinates.map((c) =>
              c.axis === targetAxis
                ? { ...c, value: Math.max(15, Math.min(95, c.value + netDelta)) }
                : c
            );
          }
        }

        set({
          todayCard: updatedTodayCard,
          archiveCards: updatedArchive,
          evolvedTasteCoordinates: newEvolved,
        });
      },

      archiveTodayCard: () => {
        const { todayCard, archiveCards } = get();
        if (todayCard && !archiveCards.find((c) => c.id === todayCard.id)) {
          set({ archiveCards: [todayCard, ...archiveCards] });
        }
      },

      resetKeywords: () => set({ selectedKeywords: [] }),

      refreshTodayCard: () => {
        const { todayCard, archiveCards, evolvedTasteCoordinates, selectedKeywords } = get();
        const currentDate = todayDateStr();
        // 날짜가 바뀌었거나 아직 개인화되지 않은 경우에만 재계산
        if (todayCard?.date === currentDate) return;

        // 전날 카드 자동 아카이브
        const updatedArchive =
          todayCard && !archiveCards.find((c) => c.id === todayCard.id)
            ? [todayCard, ...archiveCards]
            : archiveCards;

        // 최신 evolvedTasteCoordinates 기반으로 새 카드 선택
        const fresh = getPersonalizedCard(evolvedTasteCoordinates, selectedKeywords, updatedArchive);
        set({ todayCard: fresh, isTodayCardFlipped: false, archiveCards: updatedArchive });
      },
    }),
    { name: "flip-side-store" }
  )
);
