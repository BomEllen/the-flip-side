"use client";

import { useTransform, motion, MotionValue } from "framer-motion";
import styled from "styled-components";
import { FlipCardData } from "@/lib/store";
import DailyFlip from "@/components/DailyFlip";

interface FlipCardProps {
  card: FlipCardData;
  /** Scroll-driven Y-axis rotation: 0° (front) → 180° (back). Bi-directional. */
  rotateY: MotionValue<number>;
  onReact: (reaction: "boom-up" | "boom-down") => void;
}

/* ─── Card container ─────────────────────────────────────────── */

const CardScene = styled.div`
  height: 100%;
  aspect-ratio: 3 / 4;
  max-width: 100%;
  perspective: 1200px;
  position: relative;
`;

/* ─── Front face — warm glassmorphism ("My World") ───────────── */

const CardFront = styled(motion.div)<{ $gradient: string }>`
  position: absolute;
  inset: 0;
  border-radius: 28px;
  padding: 28px 28px 32px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 0;
  background: ${(p) => p.$gradient};
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1.5px solid rgba(255, 255, 255, 0.75);
  box-shadow:
    0 8px 32px rgba(255, 140, 66, 0.14),
    0 2px 8px rgba(255, 255, 255, 0.6) inset;
  backface-visibility: hidden;
  will-change: transform;
  overflow: hidden;

  /* warm glass highlight */
  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.55) 0%,
      rgba(255, 255, 255, 0.1) 50%,
      transparent 100%
    );
    border-radius: inherit;
    pointer-events: none;
  }
`;

/* ─── Back face — warm deep glow ("The Other Side") ─────────── */

const CardBack = styled(motion.div)<{ $gradient: string }>`
  position: absolute;
  inset: 0;
  border-radius: 28px;
  padding: 0;
  background: ${(p) => p.$gradient};
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1.5px solid rgba(255, 140, 60, 0.4);
  box-shadow:
    0 0 40px rgba(255, 100, 50, 0.28),
    0 0 80px rgba(220, 60, 20, 0.14),
    0 8px 32px rgba(0, 0, 0, 0.3);
  backface-visibility: hidden;
  will-change: transform;
  overflow: hidden;

  /* warm neon border glow */
  &::after {
    content: "";
    position: absolute;
    inset: -1px;
    border-radius: inherit;
    background: linear-gradient(
      135deg,
      rgba(255, 107, 157, 0.4),
      transparent 50%,
      rgba(255, 203, 71, 0.25)
    );
    z-index: 0;
    pointer-events: none;
  }
`;

/* ─── Front face content ─────────────────────────────────────── */

const FrontLabel = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(160, 60, 20, 0.7);
  background: rgba(255, 255, 255, 0.55);
  border-radius: 20px;
  padding: 4px 12px;
  width: fit-content;
`;

const FrontTitle = styled.h2`
  font-size: clamp(20px, 2.5vw, 26px);
  font-weight: 700;
  line-height: 1.3;
  color: rgba(60, 18, 5, 0.9);
`;

const FrontDesc = styled.p`
  font-size: 14px;
  font-weight: 400;
  line-height: 1.6;
  color: rgba(100, 40, 15, 0.65);
`;

/* ─── Category icon ──────────────────────────────────────────── */

const CATEGORY_ICONS: Record<string, string> = {
  테크: "💻",
  "K-팝": "🎶",
  하이킹: "🏔️",
  미니멀리즘: "◻️",
  "심야 감성": "🌙",
  댄스: "💃",
  디자인: "🎨",
  메탈: "🎸",
  게임: "🎮",
  웰니스: "🧘",
  음악: "🎵",
  피트니스: "🏋️",
  요리: "🍳",
  사진: "📷",
  아트: "🖼️",
  스포츠: "⚽",
  독서: "📚",
  여행: "✈️",
};

const FrontIconArea = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(64px, 10vw, 96px);
  filter: drop-shadow(0 8px 24px rgba(180, 80, 20, 0.18));
  user-select: none;
`;

/* ─── Decorative blobs ───────────────────────────────────────── */

const DecoCircle = styled.div<{
  $size: number;
  $top?: string;
  $right?: string;
  $left?: string;
  $bottom?: string;
  $color: string;
  $opacity: number;
}>`
  position: absolute;
  width: ${(p) => p.$size}px;
  height: ${(p) => p.$size}px;
  border-radius: 50%;
  top: ${(p) => p.$top ?? "auto"};
  right: ${(p) => p.$right ?? "auto"};
  left: ${(p) => p.$left ?? "auto"};
  bottom: ${(p) => p.$bottom ?? "auto"};
  background: ${(p) => p.$color};
  opacity: ${(p) => p.$opacity};
  filter: blur(${(p) => p.$size * 0.3}px);
  pointer-events: none;
`;

/* ─── Component ──────────────────────────────────────────────── */

export default function FlipCard({ card, rotateY, onReact }: FlipCardProps) {
  // Back face is offset by -180° so it starts hidden and reveals as front hides
  const backRotateY = useTransform(rotateY, (v) => v - 180);

  return (
    <CardScene>
      {/* Front face */}
      <CardFront
        $gradient={card.frontContent.imageGradient}
        style={{ rotateY }}
      >
        <DecoCircle
          $size={120}
          $top="-20px"
          $right="-20px"
          $color="rgba(255, 180, 120, 0.55)"
          $opacity={0.7}
        />
        <DecoCircle
          $size={80}
          $top="60px"
          $left="20px"
          $color="rgba(255, 220, 150, 0.5)"
          $opacity={0.5}
        />

        <FrontLabel>✦ My World</FrontLabel>

        <FrontIconArea>
          {CATEGORY_ICONS[card.frontContent.category] ?? "✦"}
        </FrontIconArea>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <FrontTitle>{card.frontContent.title}</FrontTitle>
          <FrontDesc>{card.frontContent.description}</FrontDesc>
        </div>
      </CardFront>

      {/* Back face */}
      <CardBack
        $gradient={card.backContent.imageGradient}
        style={{ rotateY: backRotateY }}
      >
        <DecoCircle
          $size={200}
          $top="-60px"
          $right="-60px"
          $color="rgba(255, 120, 60, 0.5)"
          $opacity={0.45}
        />
        <DecoCircle
          $size={150}
          $bottom="-40px"
          $left="-40px"
          $color="rgba(255, 200, 80, 0.5)"
          $opacity={0.35}
        />
        <DailyFlip card={card} onReact={onReact} />
      </CardBack>
    </CardScene>
  );
}
