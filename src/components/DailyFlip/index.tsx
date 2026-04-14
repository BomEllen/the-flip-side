"use client";

import { useState } from "react";
import styled from "styled-components";
import { motion, useAnimation } from "framer-motion";
import { FlipCardData, CATEGORY_TO_AXIS } from "@/lib/store";

interface DailyFlipProps {
  card: FlipCardData;
  onReact: (reaction: "boom-up" | "boom-down") => void;
}

/* ─── Layout shell ───────────────────────────────────────────── */

const Container = styled.div`
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 22px 22px 18px;
  color: white;
  overflow-y: auto;
  gap: 0;

  &::-webkit-scrollbar {
    display: none;
  }
`;

/* ─── Top: eyebrow + category + title ────────────────────────── */

const EyebrowRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
`;

const Eyebrow = styled.span`
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(255, 210, 120, 0.9);
  text-shadow: 0 0 10px rgba(255, 180, 50, 0.6);
`;

const CategoryPill = styled.span`
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgba(255, 200, 130, 0.95);
  background: rgba(255, 140, 50, 0.2);
  border: 1px solid rgba(255, 160, 80, 0.4);
  border-radius: 20px;
  padding: 2px 9px;
`;

const CardTitle = styled.h2`
  font-size: 20px;
  font-weight: 800;
  line-height: 1.3;
  color: #ffffff;
  text-shadow: 0 2px 16px rgba(0, 0, 0, 0.3);
  margin-bottom: 14px;
  /* prevent orphan single word on last line */
  text-wrap: balance;
`;

/* ─── Thin separator ─────────────────────────────────────────── */

const Rule = styled.div`
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 170, 80, 0.5) 30%,
    rgba(255, 170, 80, 0.5) 70%,
    transparent 100%
  );
  margin-bottom: 14px;
`;

/* ─── Reasons section ────────────────────────────────────────── */

const SectionLabel = styled.p`
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: none;
  color: rgba(255, 210, 120, 0.9);
  margin-bottom: 11px;
`;

const ReasonsList = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 9px;
  margin-bottom: 14px;
`;

const ReasonRow = styled(motion.div)`
  display: flex;
  gap: 10px;
  align-items: flex-start;
`;

const ReasonNum = styled.span`
  flex-shrink: 0;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.05em;
  color: rgba(255, 190, 90, 0.85);
  min-width: 18px;
  padding-top: 1px;
`;

const ReasonText = styled.p`
  font-size: 12.5px;
  font-weight: 400;
  line-height: 1.55;
  color: rgba(255, 255, 255, 0.85);
`;

/* ─── Challenge strip ────────────────────────────────────────── */

const ChallengeStrip = styled(motion.div)`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  background: rgba(255, 200, 80, 0.08);
  border-left: 2px solid rgba(255, 210, 80, 0.5);
  border-radius: 0 8px 8px 0;
  padding: 9px 12px;
  margin-bottom: 12px;
`;

const ChallengeIcon = styled.span`
  font-size: 13px;
  flex-shrink: 0;
  line-height: 1.5;
`;

const ChallengeText = styled.p`
  font-size: 12px;
  font-weight: 500;
  line-height: 1.5;
  color: rgba(255, 245, 200, 0.9);
`;

/* ─── Content link row ───────────────────────────────────────── */

const ContentTypeIcon: Record<string, string> = {
  youtube: "▶",
  article: "◈",
  music: "♪",
};

const ContentLink = styled(motion.a)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 10px 14px;
  font-size: 12.5px;
  font-weight: 600;
  color: rgba(255, 240, 200, 0.95);
  cursor: pointer;
  text-decoration: none;
  margin-bottom: 10px;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);

  &:hover {
    background: rgba(255, 255, 255, 0.13);
    border-color: rgba(255, 200, 100, 0.35);
  }
`;

const ContentLinkLeft = styled.span`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ContentTypeTag = styled.span`
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255, 200, 100, 0.8);
  background: rgba(255, 150, 50, 0.2);
  border-radius: 4px;
  padding: 2px 6px;
`;

/* ─── Reaction buttons ───────────────────────────────────────── */

const ReactionRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: auto;
  padding-top: 4px;
`;

const ReactionBtn = styled(motion.button)<{
  $active: boolean;
  $variant: "up" | "down";
}>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  padding: 11px 8px;
  border-radius: 14px;
  cursor: pointer;
  border: 1.5px solid
    ${(p) => {
      if (!p.$active) return "rgba(255, 255, 255, 0.18)";
      return p.$variant === "up"
        ? "rgba(100, 230, 160, 0.7)"
        : "rgba(255, 100, 100, 0.7)";
    }};
  background: ${(p) => {
    if (!p.$active) return "rgba(255, 255, 255, 0.06)";
    return p.$variant === "up"
      ? "rgba(60, 200, 120, 0.22)"
      : "rgba(220, 60, 60, 0.22)";
  }};
  transition: border-color 0.18s, background 0.18s;
`;

const ReactionEmoji = styled.span`
  font-size: 20px;
  line-height: 1;
`;

const ReactionLabel = styled.span<{ $active: boolean; $variant: "up" | "down" }>`
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${(p) => {
    if (!p.$active) return "rgba(255, 255, 255, 0.55)";
    return p.$variant === "up"
      ? "rgba(130, 255, 180, 0.95)"
      : "rgba(255, 140, 140, 0.95)";
  }};
  transition: color 0.18s;
`;

/* ─── Axis badge ─────────────────────────────────────────────── */

const AxisTag = styled(motion.span)`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 9.5px;
  font-weight: 600;
  color: rgba(255, 220, 130, 0.85);
  background: rgba(255, 180, 60, 0.12);
  border: 1px solid rgba(255, 200, 80, 0.3);
  border-radius: 4px;
  padding: 1px 7px;
  margin-left: 4px;
`;

/* ─── Stagger variants ───────────────────────────────────────── */

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.35 } },
};

/* ─── Component ──────────────────────────────────────────────── */

export default function DailyFlip({ card, onReact }: DailyFlipProps) {
  const { backContent, reaction } = card;
  const affectedAxis = CATEGORY_TO_AXIS[backContent.category];

  // Local optimistic reaction state so UI updates instantly
  const [localReaction, setLocalReaction] = useState<"boom-up" | "boom-down" | null>(
    reaction
  );

  const upAnim = useAnimation();
  const downAnim = useAnimation();

  const handleReact = async (r: "boom-up" | "boom-down") => {
    setLocalReaction(r);
    onReact(r);

    // Haptic-like press burst
    const ctrl = r === "boom-up" ? upAnim : downAnim;
    await ctrl.start({
      scale: [1, 0.86, 1.12, 1],
      transition: { duration: 0.32, ease: "easeInOut" },
    });
  };

  return (
    <Container>
      {/* ── Eyebrow ── */}
      <EyebrowRow>
        <Eyebrow>✦ The Other Side</Eyebrow>
        <CategoryPill>{backContent.category}</CategoryPill>
      </EyebrowRow>

      {/* ── Title ── */}
      <CardTitle>{backContent.title}</CardTitle>

      <Rule />

      {/* ── Reasons ── */}
      <SectionLabel>😬 당신이 싫어할 3가지 이유</SectionLabel>
      <ReasonsList variants={listVariants} initial="hidden" animate="visible">
        {backContent.reasons.map((reason, i) => (
          <ReasonRow key={i} variants={itemVariants}>
            <ReasonNum>0{i + 1}</ReasonNum>
            <ReasonText>{reason}</ReasonText>
          </ReasonRow>
        ))}
      </ReasonsList>

      {/* ── Challenge ── */}
      <ChallengeStrip
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.65 }}
      >
        <ChallengeIcon>⚡</ChallengeIcon>
        <ChallengeText>{backContent.challenge}</ChallengeText>
      </ChallengeStrip>

      {/* ── Content link ── */}
      <ContentLink
        href={backContent.contentLink}
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
      >
        <ContentLinkLeft>
          <ContentTypeTag>{ContentTypeIcon[backContent.contentType]}</ContentTypeTag>
          콘텐츠 보러가기
        </ContentLinkLeft>
        <span style={{ opacity: 0.5, fontSize: 12 }}>↗</span>
      </ContentLink>

      {/* ── Reaction buttons ── */}
      <ReactionRow>
        {/* Boom Up */}
        <ReactionBtn
          $active={localReaction === "boom-up"}
          $variant="up"
          animate={upAnim}
          whileTap={{ scale: 0.88 }}
          whileHover={{ scale: 1.04, y: -1 }}
          onClick={() => handleReact("boom-up")}
        >
          <ReactionEmoji>👍</ReactionEmoji>
          <ReactionLabel $active={localReaction === "boom-up"} $variant="up">
            Boom Up
          </ReactionLabel>
          {localReaction === "boom-up" && affectedAxis && (
            <AxisTag
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              ↑ {affectedAxis}
            </AxisTag>
          )}
        </ReactionBtn>

        {/* Boom Down */}
        <ReactionBtn
          $active={localReaction === "boom-down"}
          $variant="down"
          animate={downAnim}
          whileTap={{ scale: 0.88 }}
          whileHover={{ scale: 1.04, y: -1 }}
          onClick={() => handleReact("boom-down")}
        >
          <ReactionEmoji>👎</ReactionEmoji>
          <ReactionLabel $active={localReaction === "boom-down"} $variant="down">
            Boom Down
          </ReactionLabel>
          {localReaction === "boom-down" && affectedAxis && (
            <AxisTag
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              ↓ {affectedAxis}
            </AxisTag>
          )}
        </ReactionBtn>
      </ReactionRow>
    </Container>
  );
}
