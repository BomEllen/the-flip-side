"use client";

import { useEffect } from "react";
import {
  useMotionValue,
  useTransform,
  useMotionValueEvent,
  motion,
} from "framer-motion";
import styled from "styled-components";
import { useAppStore } from "@/lib/store";
import FlipCard from "@/components/FlipCard";

/* ─── Layout ─────────────────────────────────────────────────── */

const Page = styled.div`
  width: 100%;
  height: calc(100dvh - 72px);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 24px 24px;
  gap: 16px;
  overflow: hidden;

  @media (min-width: 768px) {
    padding: 56px 48px 32px;
    gap: 20px;
  }
`;

/* ─── Header ─────────────────────────────────────────────────── */

const Header = styled.div`
  width: 100%;
  max-width: 480px;
  text-align: center;
  flex-shrink: 0;
`;

const DateLabel = styled.p`
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(180, 80, 30, 0.5);
  margin-bottom: 6px;

  @media (min-width: 768px) {
    font-size: 12px;
  }
`;

const Title = styled.h1`
  font-size: clamp(22px, 3vw, 34px);
  font-weight: 800;
  color: rgba(60, 18, 8, 0.9);
  line-height: 1.2;
`;

const Subtitle = styled.p`
  font-size: clamp(13px, 1.4vw, 16px);
  font-weight: 400;
  color: rgba(120, 50, 20, 0.6);
  margin-top: 6px;
  line-height: 1.55;
`;

/* ─── Card wrapper ───────────────────────────────────────────── */

const CardArea = styled.div`
  flex: 1;
  min-height: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

/* ─── Slider section ─────────────────────────────────────────── */

const SliderSection = styled.div`
  width: 100%;
  max-width: min(480px, calc(100% - 48px));
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex-shrink: 0;
`;

const SliderLabels = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SliderLabel = styled.span<{ $side: "left" | "right" }>`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${(p) =>
    p.$side === "left"
      ? "rgba(100, 40, 15, 0.5)"
      : "rgba(200, 70, 20, 0.7)"};
`;

const SliderTrack = styled.div`
  position: relative;
  width: 100%;
  height: 36px;
  display: flex;
  align-items: center;
`;

const SliderInput = styled.input`
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 6px;
  border-radius: 6px;
  background: linear-gradient(
    90deg,
    rgba(255, 200, 140, 0.4) 0%,
    rgba(220, 90, 30, 0.5) 100%
  );
  outline: none;
  cursor: pointer;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: linear-gradient(135deg, #ff8c42, #e05a1a);
    border: 3px solid white;
    box-shadow: 0 2px 12px rgba(220, 90, 30, 0.45);
    cursor: grab;
    transition: box-shadow 0.15s, transform 0.15s;
  }

  &::-webkit-slider-thumb:active {
    cursor: grabbing;
    box-shadow: 0 4px 20px rgba(220, 90, 30, 0.6);
    transform: scale(1.12);
  }

  &::-moz-range-thumb {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: linear-gradient(135deg, #ff8c42, #e05a1a);
    border: 3px solid white;
    box-shadow: 0 2px 12px rgba(220, 90, 30, 0.45);
    cursor: grab;
  }
`;

/* ─── Post-flip revealed content ─────────────────────────────── */

const RevealedContent = styled(motion.div)`
  width: 100%;
  max-width: min(480px, calc(100% - 48px));
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex-shrink: 0;
  pointer-events: none;

  &[data-active="true"] {
    pointer-events: auto;
  }
`;

const FlipMessage = styled.p`
  font-size: 13px;
  font-weight: 600;
  color: rgba(200, 75, 30, 0.8);
  text-align: center;
`;

const ActionRow = styled.div`
  display: flex;
  gap: 10px;
  width: 100%;
`;

const ActionBtn = styled(motion.button)`
  flex: 1;
  padding: 11px;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 700;
  border: 1.5px solid rgba(255, 140, 66, 0.35);
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  color: rgba(190, 70, 20, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
`;

/* ─── Empty state ────────────────────────────────────────────── */

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
  height: 100%;
  justify-content: center;
`;

/* ─── Component ──────────────────────────────────────────────── */

export default function HomePage() {
  // 0–100 slider value drives all animations
  const sliderVal = useMotionValue(0);

  // Card Y-axis rotation: 0° → 180°
  const rotateY = useTransform(sliderVal, [0, 100], [0, 180]);

  // Revealed content fades in after ~50%
  const revealOpacity = useTransform(sliderVal, [48, 78], [0, 1]);
  const revealY = useTransform(sliderVal, [48, 78], [16, 0]);

  const {
    todayCard,
    isTodayCardFlipped,
    flipTodayCard,
    reactToCard,
    archiveTodayCard,
  } = useAppStore();

  // Persist flip + archive when slider crosses midpoint
  useMotionValueEvent(sliderVal, "change", (v) => {
    if (v > 50 && !isTodayCardFlipped) {
      flipTodayCard();
      archiveTodayCard();
    }
  });

  const today = new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });

  return (
    <Page>
      {/* Header */}
      <Header>
        <DateLabel>{today}</DateLabel>
        <Title>{isTodayCardFlipped ? "The Other Side" : "My World"}</Title>
        <Subtitle>
          {isTodayCardFlipped
            ? "오늘의 역취향 콘텐츠를 만났어요. 어떻게 느껴졌나요?"
            : "슬라이더를 당겨 당신이 싫어할 콘텐츠를 만나보세요."}
        </Subtitle>
      </Header>

      {/* Card */}
      <CardArea>
        {todayCard ? (
          <FlipCard
            card={todayCard}
            rotateY={rotateY}
            onReact={(reaction) => reactToCard(todayCard.id, reaction)}
          />
        ) : (
          <EmptyState>
            <p style={{ fontSize: 48 }}>🌅</p>
            <p style={{ fontSize: 16, fontWeight: 700, color: "rgba(180,70,20,0.7)" }}>
              오늘의 카드를 준비 중이에요
            </p>
          </EmptyState>
        )}
      </CardArea>

      {/* Slider */}
      <SliderSection>
        <SliderLabels>
          <SliderLabel $side="left">✦ My World</SliderLabel>
          <SliderLabel $side="right">The Other Side ✦</SliderLabel>
        </SliderLabels>
        <SliderTrack>
          <SliderInput
            type="range"
            min={0}
            max={100}
            defaultValue={0}
            onChange={(e) => sliderVal.set(Number(e.target.value))}
          />
        </SliderTrack>
      </SliderSection>

      {/* Revealed after flip */}
      <RevealedContent
        style={{ opacity: revealOpacity, y: revealY }}
        data-active={isTodayCardFlipped ? "true" : "false"}
      >
        <FlipMessage>✦ 반대편을 만났어요. 어떻게 느껴지셨나요?</FlipMessage>
        <ActionRow>
          <ActionBtn
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => {
              if (navigator.share && todayCard) {
                navigator.share({
                  title: "The Flip Side",
                  text: `오늘 나의 역취향 콘텐츠: ${todayCard.backContent.title}`,
                });
              }
            }}
          >
            <span>↗</span> 공유하기
          </ActionBtn>
          <ActionBtn whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}>
            <span>◈</span> 아카이브 보기
          </ActionBtn>
        </ActionRow>
      </RevealedContent>
    </Page>
  );
}
