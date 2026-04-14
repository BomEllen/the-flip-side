"use client";

import styled from "styled-components";
import { motion } from "framer-motion";
import { useAppStore } from "@/lib/store";
import ArchiveGrid from "@/components/ArchiveGrid";

// ─── 레이아웃 ─────────────────────────────────────────────────────────────────

const Page = styled.div`
  min-height: calc(100dvh - 72px);
  padding: 32px 20px 100px;
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: relative;
  overflow: hidden;
`;

// warm amber 배경 블롭
const BgBlob = styled.div<{
  $size: number;
  $top?: string; $left?: string; $right?: string; $bottom?: string;
  $color: string;
}>`
  position: fixed;
  width: ${(p) => p.$size}px;
  height: ${(p) => p.$size}px;
  border-radius: 50%;
  top: ${(p) => p.$top ?? "auto"};
  left: ${(p) => p.$left ?? "auto"};
  right: ${(p) => p.$right ?? "auto"};
  bottom: ${(p) => p.$bottom ?? "auto"};
  background: ${(p) => p.$color};
  filter: blur(${(p) => Math.round(p.$size * 0.32)}px);
  pointer-events: none;
  z-index: 0;
`;

// ─── 헤더 ─────────────────────────────────────────────────────────────────────

const Header = styled.div`
  position: relative;
  z-index: 1;
`;

const Title = styled.h1`
  font-size: clamp(24px, 3vw, 30px);
  font-weight: 800;
  color: rgba(55, 18, 6, 0.9);
  letter-spacing: -0.02em;
`;

const Subtitle = styled.p`
  font-size: 13.5px;
  font-weight: 400;
  color: rgba(120, 50, 18, 0.58);
  margin-top: 6px;
  line-height: 1.55;
`;

// ─── 통계 카드 ────────────────────────────────────────────────────────────────

const StatsRow = styled.div`
  display: flex;
  gap: 10px;
  position: relative;
  z-index: 1;
`;

const StatCard = styled(motion.div)<{ $border: string; $bg: string }>`
  flex: 1;
  padding: 14px 16px 16px;
  border-radius: 20px;
  background: ${(p) => p.$bg};
  border: 1.5px solid ${(p) => p.$border};
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow: 0 2px 12px rgba(200, 100, 40, 0.08);
  display: flex;
  flex-direction: column;
  gap: 4px;

  /* 상단 글래스 하이라이트 */
  position: relative;
  overflow: hidden;
  &::before {
    content: "";
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 40%;
    background: linear-gradient(180deg, rgba(255,255,255,0.35) 0%, transparent 100%);
    pointer-events: none;
  }
`;

const StatValue = styled.span<{ $color: string }>`
  font-size: 30px;
  font-weight: 800;
  color: ${(p) => p.$color};
  line-height: 1;
  letter-spacing: -0.02em;
`;

const StatLabel = styled.span`
  font-size: 11.5px;
  font-weight: 600;
  color: rgba(100, 40, 12, 0.6);
`;

// ─── 섹션 구분선 ──────────────────────────────────────────────────────────────

const SectionLabel = styled.p`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(200, 90, 30, 0.5);
  position: relative;
  z-index: 1;
`;

// ─── 컴포넌트 ─────────────────────────────────────────────────────────────────

export default function ArchivePage() {
  const archiveCards = useAppStore((s) => s.archiveCards);

  const boomUpCount   = archiveCards.filter((c) => c.reaction === "boom-up").length;
  const boomDownCount = archiveCards.filter((c) => c.reaction === "boom-down").length;

  return (
    <Page>
      {/* 배경 블롭 — 앱 전체 warm amber 팔레트와 통일 */}
      <BgBlob $size={300} $top="-80px"   $right="-80px"  $color="rgba(255, 180, 100, 0.28)" />
      <BgBlob $size={220} $bottom="120px" $left="-60px"  $color="rgba(255, 220, 150, 0.22)" />
      <BgBlob $size={160} $bottom="320px" $right="-30px" $color="rgba(255, 140, 100, 0.18)" />

      <Header>
        <Title>아카이브</Title>
        <Subtitle>지금까지 만난 역취향 카드들. 당신의 거부감 기록.</Subtitle>
      </Header>

      {/* 통계 */}
      <StatsRow>
        <StatCard
          $bg="rgba(60, 200, 140, 0.07)"
          $border="rgba(60, 200, 140, 0.3)"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <StatValue $color="rgba(25, 140, 85, 0.9)">{boomUpCount}</StatValue>
          <StatLabel>👍 Boom Up</StatLabel>
        </StatCard>

        <StatCard
          $bg="rgba(220, 70, 90, 0.07)"
          $border="rgba(220, 70, 90, 0.28)"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <StatValue $color="rgba(185, 45, 70, 0.9)">{boomDownCount}</StatValue>
          <StatLabel>👎 Boom Down</StatLabel>
        </StatCard>

        <StatCard
          $bg="rgba(255, 160, 60, 0.08)"
          $border="rgba(255, 160, 60, 0.28)"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <StatValue $color="rgba(195, 88, 14, 0.9)">{archiveCards.length}</StatValue>
          <StatLabel>🃏 총 카드</StatLabel>
        </StatCard>
      </StatsRow>

      {archiveCards.length > 0 && (
        <SectionLabel>지난 플립 기록</SectionLabel>
      )}

      <div style={{ position: "relative", zIndex: 1 }}>
        <ArchiveGrid cards={archiveCards} />
      </div>
    </Page>
  );
}
