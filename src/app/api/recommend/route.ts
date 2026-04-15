import { NextResponse } from "next/server";
import { buildAntiTasteQuery, searchYouTube, resultToCard } from "@/lib/searchEngine";
import { TasteCoordinate, InterestKeyword } from "@/lib/store";

// ─── POST /api/recommend ──────────────────────────────────────────────────────
// 사용자의 취향 좌표 + 선택 키워드를 받아 역취향 카드 데이터를 반환

export async function POST(request: Request) {
  let tasteCoordinates: TasteCoordinate[];
  let selectedKeywords: InterestKeyword[];

  try {
    const body = await request.json();
    tasteCoordinates = body.tasteCoordinates ?? [];
    selectedKeywords = body.selectedKeywords ?? [];
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  // 1. 역취향 검색 쿼리 생성
  const query = buildAntiTasteQuery(tasteCoordinates, selectedKeywords);

  // 2. YouTube API 검색 — 실패 시 null 반환
  const result = await searchYouTube(query);
  if (!result) {
    // API 키 없음 또는 검색 실패 — 클라이언트가 CARD_POOL 폴백 사용
    return NextResponse.json({ fallback: true }, { status: 200 });
  }

  // 3. 검색 결과 → FlipCardData 형태로 변환
  const cardData = resultToCard(result, tasteCoordinates, selectedKeywords, query);

  return NextResponse.json({ card: cardData, query }, { status: 200 });
}
