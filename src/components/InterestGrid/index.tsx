"use client";

import { useState } from "react";
import styled from "styled-components";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { InterestKeyword } from "@/lib/store";
import { CATEGORIES } from "./data";

interface InterestGridProps {
  selectedKeywords: InterestKeyword[];
  onToggle: (keyword: InterestKeyword) => void;
  disabled?: boolean; // 10개 선택 시 미선택 항목 비활성화
}

// ─── 그리드 컨테이너 ──────────────────────────────────────────────────────────

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  width: 100%;
  /* 각 카드가 자신의 콘텐츠 높이만큼만 차지 — 펼침 시 같은 행 카드에 영향 없음 */
  align-items: start;

  @media (min-width: 480px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

// ─── 카드 ─────────────────────────────────────────────────────────────────────

const Card = styled(motion.div)<{ $expanded: boolean; $hasSelected: boolean }>`
  border-radius: 18px;
  padding: 12px;
  cursor: pointer;
  background: ${(p) =>
    p.$hasSelected
      ? "linear-gradient(135deg, rgba(255,235,210,0.97) 0%, rgba(255,215,170,0.97) 100%)"
      : p.$expanded
      ? "rgba(255, 248, 240, 0.95)"
      : "rgba(255, 255, 255, 0.72)"};
  border: 1.5px solid
    ${(p) =>
      p.$hasSelected
        ? "rgba(220, 100, 30, 0.55)"
        : p.$expanded
        ? "rgba(220, 100, 30, 0.3)"
        : "rgba(255, 200, 140, 0.35)"};
  box-shadow: ${(p) =>
    p.$hasSelected
      ? "0 6px 24px rgba(220, 90, 30, 0.18)"
      : p.$expanded
      ? "0 4px 16px rgba(220, 90, 30, 0.1)"
      : "0 2px 8px rgba(200, 120, 60, 0.07)"};
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  user-select: none;
  will-change: transform;
  overflow: hidden;
`;

// ─── 카드 헤더 ────────────────────────────────────────────────────────────────

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Emoji = styled.span`
  font-size: 18px;
  line-height: 1;
  flex-shrink: 0;
`;

const Label = styled.span<{ $active: boolean }>`
  font-size: 12.5px;
  font-weight: 700;
  color: ${(p) =>
    p.$active ? "rgba(180, 60, 10, 0.95)" : "rgba(80, 35, 10, 0.8)"};
  transition: color 0.2s;
  flex: 1;
  line-height: 1.3;
`;

const Chevron = styled(motion.span)`
  font-size: 10px;
  color: rgba(200, 100, 40, 0.55);
  display: inline-block;
  flex-shrink: 0;
`;

// ─── 선택 카운트 뱃지 ─────────────────────────────────────────────────────────

const SelectedBadge = styled(motion.span)`
  font-size: 9.5px;
  font-weight: 800;
  padding: 2px 7px;
  border-radius: 20px;
  background: rgba(220, 90, 30, 0.9);
  color: white;
  flex-shrink: 0;
`;

// ─── 세부 키워드 목록 ─────────────────────────────────────────────────────────

const SubList = styled(motion.div)`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
`;

const SubChip = styled(motion.button)<{ $selected: boolean; $disabled: boolean }>`
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 20px;
  cursor: ${(p) => (p.$disabled ? "not-allowed" : "pointer")};
  opacity: ${(p) => (p.$disabled ? 0.38 : 1)};
  background: ${(p) =>
    p.$selected ? "rgba(220, 90, 30, 0.88)" : "rgba(255, 140, 50, 0.1)"};
  border: 1px solid
    ${(p) =>
      p.$selected ? "rgba(220, 90, 30, 0.9)" : "rgba(255, 160, 80, 0.3)"};
  color: ${(p) => (p.$selected ? "white" : "rgba(180, 65, 15, 0.85)")};
  white-space: nowrap;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
`;

// ─── Framer Motion variants ───────────────────────────────────────────────────

const subListVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.04 },
  },
  exit: {
    opacity: 0,
    transition: { staggerChildren: 0.025, staggerDirection: -1 as const },
  },
};

const chipVariants = {
  hidden: { opacity: 0, y: 7, scale: 0.88 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 400, damping: 24 },
  },
  exit: { opacity: 0, y: 3, scale: 0.92, transition: { duration: 0.1 } },
};

const chevronVariants = {
  closed: { rotate: 0 },
  open: { rotate: 180 },
};

// ─── 개별 카드 ────────────────────────────────────────────────────────────────

function CategoryCard({
  categoryId,
  label,
  emoji,
  subKeywords,
  isExpanded,
  selectedKeywords,
  onToggle,
  onHeaderClick,
  isMaxReached,
}: {
  categoryId: string;
  label: string;
  emoji: string;
  subKeywords: string[];
  isExpanded: boolean;
  selectedKeywords: InterestKeyword[];
  onToggle: (keyword: InterestKeyword) => void;
  onHeaderClick: () => void;
  isMaxReached: boolean;
}) {
  // 이 카테고리 하위에서 선택된 키워드 수
  const selectedInCategory = selectedKeywords.filter(
    (k) => k.id.startsWith(categoryId + "_")
  );
  const hasSelected = selectedInCategory.length > 0;

  const handleChipClick = (subLabel: string, idx: number) => {
    const kw: InterestKeyword = {
      id: `${categoryId}_${idx}`,
      label: subLabel,
      emoji,
    };
    onToggle(kw);
  };

  return (
    <Card
      layout
      layoutId={`card-${categoryId}`}
      $expanded={isExpanded}
      $hasSelected={hasSelected}
      onClick={onHeaderClick}
      whileTap={{ scale: 0.975 }}
    >
      {/* 헤더 */}
      <motion.div layout="position">
        <CardHeader>
          <Emoji>{emoji}</Emoji>
          <Label $active={isExpanded || hasSelected}>{label}</Label>
          {hasSelected && (
            <SelectedBadge
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
            >
              {selectedInCategory.length}
            </SelectedBadge>
          )}
          <Chevron
            variants={chevronVariants}
            animate={isExpanded ? "open" : "closed"}
            transition={{ type: "spring", stiffness: 420, damping: 28 }}
          >
            ▾
          </Chevron>
        </CardHeader>
      </motion.div>

      {/* 세부 키워드 */}
      <AnimatePresence mode="wait">
        {isExpanded && (
          <SubList
            key="subs"
            variants={subListVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {subKeywords.map((sub, idx) => {
              const kwId = `${categoryId}_${idx}`;
              const isSelected = selectedKeywords.some((k) => k.id === kwId);
              const isDisabled = isMaxReached && !isSelected;

              return (
                <SubChip
                  key={kwId}
                  variants={chipVariants}
                  $selected={isSelected}
                  $disabled={isDisabled}
                  onClick={(e) => {
                    // 카드 헤더 토글로 버블링 차단
                    e.stopPropagation();
                    if (!isDisabled) handleChipClick(sub, idx);
                  }}
                  whileHover={!isDisabled ? { scale: 1.05 } : {}}
                  whileTap={!isDisabled ? { scale: 0.93 } : {}}
                >
                  {sub}
                </SubChip>
              );
            })}
          </SubList>
        )}
      </AnimatePresence>
    </Card>
  );
}

// ─── 메인 컴포넌트 ────────────────────────────────────────────────────────────

export default function InterestGrid({
  selectedKeywords,
  onToggle,
  disabled = false,
}: InterestGridProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const isMaxReached = disabled;

  return (
    <LayoutGroup id="interest-grid">
      <Grid>
        {CATEGORIES.map((cat) => (
          <CategoryCard
            key={cat.id}
            categoryId={cat.id}
            label={cat.label}
            emoji={cat.emoji}
            subKeywords={cat.subKeywords}
            isExpanded={expandedId === cat.id}
            selectedKeywords={selectedKeywords}
            onToggle={onToggle}
            onHeaderClick={() =>
              setExpandedId((prev) => (prev === cat.id ? null : cat.id))
            }
            isMaxReached={isMaxReached}
          />
        ))}
      </Grid>
    </LayoutGroup>
  );
}
