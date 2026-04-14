"use client";

import styled from "styled-components";
import { motion } from "framer-motion";
import { FlipCardData } from "@/lib/store";

interface ArchiveGridProps {
  cards: FlipCardData[];
}

// ─── 그리드 ───────────────────────────────────────────────────────────────────

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
  width: 100%;
`;

// ─── 아카이브 카드 ────────────────────────────────────────────────────────────

const ArchiveCard = styled(motion.div)<{ $gradient: string }>`
  border-radius: 22px;
  overflow: hidden;
  position: relative;
  aspect-ratio: 3/4;
  background: ${(p) => p.$gradient};
  border: 1.5px solid rgba(255, 255, 255, 0.42);
  box-shadow:
    0 4px 20px rgba(200, 100, 40, 0.13),
    0 1px 0 rgba(255, 255, 255, 0.5) inset;
  cursor: pointer;

  /* 상단 유리 하이라이트 */
  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      145deg,
      rgba(255, 255, 255, 0.32) 0%,
      transparent 55%
    );
    pointer-events: none;
    z-index: 1;
  }
`;

// ─── 카드 중앙 이모지 아이콘 ──────────────────────────────────────────────────

const CardIcon = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(48px, 8vw, 64px);
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15));
  user-select: none;
  z-index: 0;
`;

// ─── 카드 하단 콘텐츠 — warm glass 패널 ──────────────────────────────────────

const CardContent = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 13px 14px;
  background: linear-gradient(
    to top,
    rgba(30, 12, 5, 0.72) 0%,
    rgba(30, 12, 5, 0.0) 100%
  );
  z-index: 2;
`;

const CardCategory = styled.span`
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: rgba(255, 210, 140, 0.9);
  display: block;
  margin-bottom: 4px;
`;

const CardTitle = styled.p`
  font-size: 13px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.95);
  line-height: 1.35;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

// ─── 리액션 뱃지 ─────────────────────────────────────────────────────────────

const ReactionBadge = styled(motion.div)<{ $type: "boom-up" | "boom-down" }>`
  position: absolute;
  top: 10px;
  right: 10px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  z-index: 3;
  background: ${(p) =>
    p.$type === "boom-up"
      ? "rgba(80, 210, 150, 0.22)"
      : "rgba(220, 80, 100, 0.22)"};
  border: 1.5px solid
    ${(p) =>
      p.$type === "boom-up"
        ? "rgba(80, 210, 150, 0.55)"
        : "rgba(220, 80, 100, 0.55)"};
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
`;

// ─── 날짜 태그 ────────────────────────────────────────────────────────────────

const DateTag = styled.span`
  position: absolute;
  top: 10px;
  left: 10px;
  font-size: 10px;
  font-weight: 600;
  color: rgba(255, 240, 210, 0.75);
  background: rgba(20, 8, 2, 0.28);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  padding: 3px 8px;
  z-index: 3;
`;

// ─── 카테고리 이모지 맵 ───────────────────────────────────────────────────────

const CATEGORY_ICONS: Record<string, string> = {
  테크: "💻", "K-팝": "🎶", 하이킹: "🏔️", 미니멀리즘: "🪴",
  "심야 감성": "🌙", 댄스: "💃", 디자인: "🎨", 메탈: "🎸",
  게임: "🎮", 웰니스: "🧘", 음악: "🎵", 피트니스: "🏋️",
  요리: "🍳", 사진: "📸", 아트: "🖼️", 스포츠: "⚽",
  독서: "📚", 여행: "✈️",
};

// ─── Framer Motion variants ───────────────────────────────────────────────────

const gridVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.94 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

// ─── 빈 상태 ─────────────────────────────────────────────────────────────────

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  gap: 10px;
`;

const EmptyEmoji = styled.div`
  font-size: 52px;
  margin-bottom: 8px;
  filter: drop-shadow(0 6px 16px rgba(200, 100, 40, 0.2));
`;

const EmptyText = styled.p`
  font-size: 16px;
  font-weight: 700;
  color: rgba(120, 50, 20, 0.75);
`;

const EmptySubText = styled.p`
  font-size: 13px;
  font-weight: 400;
  color: rgba(150, 70, 30, 0.52);
  line-height: 1.55;
`;

// ─── 컴포넌트 ─────────────────────────────────────────────────────────────────

export default function ArchiveGrid({ cards }: ArchiveGridProps) {
  if (cards.length === 0) {
    return (
      <EmptyState>
        <EmptyEmoji>🃏</EmptyEmoji>
        <EmptyText>아직 아카이빙된 카드가 없어요.</EmptyText>
        <EmptySubText>
          메인 탭에서 오늘의 플립 카드를<br />먼저 뒤집어보세요!
        </EmptySubText>
      </EmptyState>
    );
  }

  return (
    <Grid
      as={motion.div}
      variants={gridVariants}
      initial="hidden"
      animate="visible"
    >
      {cards.map((card) => (
        <ArchiveCard
          key={card.id}
          $gradient={card.backContent.imageGradient}
          variants={cardVariants}
          transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ scale: 1.03, y: -4, boxShadow: "0 12px 36px rgba(200, 100, 40, 0.24), 0 1px 0 rgba(255,255,255,0.5) inset" }}
          whileTap={{ scale: 0.97 }}
        >
          <DateTag>{card.date}</DateTag>

          {card.reaction && (
            <ReactionBadge
              $type={card.reaction}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              {card.reaction === "boom-up" ? "👍" : "👎"}
            </ReactionBadge>
          )}

          <CardIcon>
            {CATEGORY_ICONS[card.backContent.category] ?? "✦"}
          </CardIcon>

          <CardContent>
            <CardCategory>{card.backContent.category}</CardCategory>
            <CardTitle>{card.backContent.title}</CardTitle>
          </CardContent>
        </ArchiveCard>
      ))}
    </Grid>
  );
}
