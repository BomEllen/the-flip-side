"use client";

import { useState, useEffect } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAppStore, InterestKeyword } from "@/lib/store";

import InterestNodes from "@/components/InterestNodes";
import TasteMap from "@/components/TasteMap";

// ─── 레이아웃 ────────────────────────────────────────────────────────────────

const Page = styled.div`
  min-height: 100dvh;
  max-width: 480px;
  margin: 0 auto;
  padding: 0 20px 40px;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
`;

const BgBlob = styled.div<{
  $size: number;
  $top?: string;
  $right?: string;
  $left?: string;
  $bottom?: string;
  $color: string;
}>`
  position: fixed;
  width: ${(p) => p.$size}px;
  height: ${(p) => p.$size}px;
  border-radius: 50%;
  top: ${(p) => p.$top ?? "auto"};
  right: ${(p) => p.$right ?? "auto"};
  left: ${(p) => p.$left ?? "auto"};
  bottom: ${(p) => p.$bottom ?? "auto"};
  background: ${(p) => p.$color};
  filter: blur(${(p) => p.$size * 0.35}px);
  pointer-events: none;
  z-index: 0;
`;

// ─── 상단 네비게이션 ─────────────────────────────────────────────────────────

const TopNav = styled.div`
  display: flex;
  align-items: center;
  padding: 28px 0 0;
  z-index: 1;
  min-height: 44px;
`;

const BackButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: rgba(200, 90, 30, 0.75);
  background: rgba(255, 255, 255, 0.55);
  border: 1.5px solid rgba(255, 160, 80, 0.3);
  border-radius: 20px;
  padding: 6px 14px;
  backdrop-filter: blur(8px);
  cursor: pointer;
`;

// ─── 스텝 인디케이터 ─────────────────────────────────────────────────────────

const StepBar = styled.div`
  display: flex;
  gap: 8px;
  padding: 28px 0 0;
  z-index: 1;
`;

const StepDot = styled.div<{ $active: boolean; $done: boolean }>`
  height: 4px;
  flex: 1;
  border-radius: 4px;
  background: ${(p) =>
    p.$done
      ? "rgba(220, 100, 30, 0.7)"
      : p.$active
      ? "rgba(220, 100, 30, 0.9)"
      : "rgba(255, 180, 120, 0.25)"};
  transition: background 0.3s;
`;

// ─── 공통 텍스트 ─────────────────────────────────────────────────────────────

const StepLabel = styled.p`
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(200, 90, 30, 0.65);
  margin-top: 32px;
  z-index: 1;
`;

const StepTitle = styled.h1`
  font-size: 28px;
  font-weight: 800;
  line-height: 1.3;
  color: rgba(60, 18, 8, 0.9);
  margin-top: 10px;
  z-index: 1;
`;

const StepDesc = styled.p`
  font-size: 14px;
  font-weight: 400;
  color: rgba(120, 50, 20, 0.65);
  margin-top: 8px;
  line-height: 1.6;
  z-index: 1;
`;

// ─── 스텝 1: 키워드 선택 ──────────────────────────────────────────────────────

const SelectionCount = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 20px;
  z-index: 1;
`;

const CountText = styled.span<{ $enough: boolean }>`
  font-size: 13px;
  font-weight: 700;
  color: ${(p) =>
    p.$enough ? "rgba(80, 190, 120, 0.9)" : "rgba(180, 80, 30, 0.65)"};
  transition: color 0.2s;
`;

const ProgressBar = styled.div`
  width: 120px;
  height: 6px;
  border-radius: 6px;
  background: rgba(255, 180, 120, 0.2);
  overflow: hidden;
`;

const ProgressFill = styled(motion.div)`
  height: 100%;
  border-radius: 6px;
  background: linear-gradient(90deg, rgba(220, 100, 30, 0.7), rgba(255, 160, 60, 0.7));
`;


// ─── 스텝 2: 취향 시각화 ──────────────────────────────────────────────────────

const TypeRevealCard = styled(motion.div)`
  margin-top: 20px;
  padding: 24px;
  border-radius: 24px;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.75) 0%,
    rgba(255, 235, 210, 0.65) 100%
  );
  border: 1.5px solid rgba(255, 160, 80, 0.4);
  backdrop-filter: blur(20px);
  box-shadow: 0 8px 32px rgba(220, 100, 40, 0.12);
  z-index: 1;
  text-align: center;
`;

const TypeRevealLabel = styled.p`
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(200, 90, 30, 0.6);
  margin-bottom: 12px;
`;

const TypeRevealName = styled(motion.h2)`
  font-size: 22px;
  font-weight: 800;
  color: rgba(60, 18, 8, 0.9);
  line-height: 1.3;
`;

const SelectedKeywordTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
  justify-content: center;
`;

const Tag = styled(motion.span)`
  font-size: 12px;
  font-weight: 600;
  padding: 5px 12px;
  border-radius: 20px;
  background: rgba(255, 140, 50, 0.12);
  border: 1px solid rgba(255, 160, 80, 0.3);
  color: rgba(180, 70, 20, 0.8);
`;

// ─── CTA 버튼 ────────────────────────────────────────────────────────────────

const CTAButton = styled(motion.button)<{ $disabled?: boolean }>`
  width: 100%;
  padding: 16px;
  border-radius: 20px;
  font-size: 16px;
  font-weight: 800;
  background: ${(p) =>
    p.$disabled
      ? "rgba(255, 180, 120, 0.25)"
      : "linear-gradient(135deg, rgba(220, 90, 30, 0.9), rgba(255, 150, 50, 0.9))"};
  color: ${(p) => (p.$disabled ? "rgba(180, 100, 50, 0.4)" : "white")};
  border: none;
  margin-top: 24px;
  z-index: 1;
  box-shadow: ${(p) =>
    p.$disabled ? "none" : "0 8px 24px rgba(220, 90, 30, 0.35)"};
  cursor: ${(p) => (p.$disabled ? "not-allowed" : "pointer")};
  transition: background 0.3s, box-shadow 0.3s;
`;

// ─── 페이지 전환 variants ─────────────────────────────────────────────────────

const pageVariants = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
};

// ─── 메인 컴포넌트 ────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const router = useRouter();
  const { selectedKeywords, toggleKeyword, completeOnboarding, resetKeywords, tasteCoordinates, userTypeLabel } =
    useAppStore();

  // 페이지 진입 시 키워드 선택 초기화 — 이전 세션 잔류 상태 방지
  useEffect(() => {
    resetKeywords();
  }, []);

  const isEnough = selectedKeywords.length >= 5;
  const isMax = selectedKeywords.length >= 10;

  const handleNextStep = () => {
    if (!isEnough) return;
    completeOnboarding();
    setStep(2);
  };

  // 스텝 2 → 스텝 1 뒤로가기 — 키워드 재선택 허용
  const handleBack = () => {
    resetKeywords();
    setStep(1);
  };

  const handleStart = () => {
    router.replace("/");
  };

  return (
    <Page>
      {/* 배경 블롭 */}
      <BgBlob $size={300} $top="-80px" $right="-80px" $color="rgba(255, 180, 100, 0.3)" />
      <BgBlob $size={200} $bottom="100px" $left="-60px" $color="rgba(255, 220, 150, 0.25)" />
      <BgBlob $size={150} $bottom="300px" $right="-30px" $color="rgba(255, 140, 100, 0.2)" />

      {/* 상단 네비게이션: 스텝 2에서는 뒤로가기 버튼 노출 */}
      <TopNav>
        {step === 2 && (
          <BackButton
            onClick={handleBack}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
          >
            ← 다시 선택
          </BackButton>
        )}
      </TopNav>

      {/* 스텝 진행 바 */}
      <StepBar>
        {([1, 2] as const).map((s) => (
          <StepDot key={s} $active={step === s} $done={step > s} />
        ))}
      </StepBar>

      <AnimatePresence mode="wait">
        {/* ─ 스텝 1: 키워드 선택 ─ */}
        {step === 1 && (
          <motion.div
            key="step1"
            variants={pageVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.4, ease: "easeOut" }}
            style={{ display: "flex", flexDirection: "column", zIndex: 1 }}
          >
            <StepLabel>Step 1 — 취향 탐색</StepLabel>
            <StepTitle>당신의 세계는 어디에 있나요?</StepTitle>
            <StepDesc>
              관심 있는 키워드를 5~10개 선택하세요. 당신이 사랑하는 것들을 알아야, 당신이 싫어할 것을 찾을 수 있어요.
            </StepDesc>

            <SelectionCount>
              <CountText $enough={isEnough}>
                {isEnough
                  ? `✓ ${selectedKeywords.length}개 선택됨`
                  : `${selectedKeywords.length} / 5개 이상 선택`}
              </CountText>
              <ProgressBar>
                <ProgressFill
                  animate={{ width: `${(selectedKeywords.length / 10) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </ProgressBar>
            </SelectionCount>

            <InterestNodes
              selectedKeywords={selectedKeywords}
              onToggle={toggleKeyword}
              disabled={isMax}
            />

            <CTAButton
              $disabled={!isEnough}
              onClick={handleNextStep}
              whileHover={isEnough ? { scale: 1.02 } : {}}
              whileTap={isEnough ? { scale: 0.97 } : {}}
            >
              내 취향 분석하기 →
            </CTAButton>
          </motion.div>
        )}

        {/* ─ 스텝 2: 취향 시각화 ─ */}
        {step === 2 && (
          <motion.div
            key="step2"
            variants={pageVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.4, ease: "easeOut" }}
            style={{ display: "flex", flexDirection: "column", zIndex: 1 }}
          >
            <StepLabel>Step 2 — 취향 좌표</StepLabel>
            <StepTitle>당신의 취향 지형이 나왔어요!</StepTitle>
            <StepDesc>
              The Flip Side는 이 좌표에서 가장 먼 반대편 콘텐츠를 매일 하나씩 가져다줍니다.
            </StepDesc>

            {/* 유저 타입 레이블 */}
            <TypeRevealCard
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <TypeRevealLabel>✦ 당신의 취향 유형</TypeRevealLabel>
              <TypeRevealName
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                "{userTypeLabel}"
              </TypeRevealName>

              <SelectedKeywordTags>
                {selectedKeywords.map((k, i) => (
                  <Tag
                    key={k.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.05 }}
                  >
                    {k.emoji} {k.label}
                  </Tag>
                ))}
              </SelectedKeywordTags>
            </TypeRevealCard>

            {/* 레이더 차트 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              style={{
                background: "rgba(255, 255, 255, 0.6)",
                borderRadius: 24,
                padding: "20px 16px",
                marginTop: 16,
                border: "1.5px solid rgba(255, 160, 80, 0.3)",
                backdropFilter: "blur(16px)",
              }}
            >
              <TasteMap coordinates={tasteCoordinates} />
            </motion.div>

            <CTAButton
              onClick={handleStart}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              The Flip Side 시작하기 ✦
            </CTAButton>
          </motion.div>
        )}
      </AnimatePresence>
    </Page>
  );
}
