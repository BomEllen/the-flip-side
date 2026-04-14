"use client";

import styled from "styled-components";
import { motion } from "framer-motion";
import { InterestKeyword } from "@/lib/store";

interface KeywordCardProps {
  keyword: InterestKeyword;
  isSelected: boolean;
  onToggle: (keyword: InterestKeyword) => void;
  disabled?: boolean;
}

// 선택 상태에 따라 스타일 전환
const Card = styled(motion.button)<{ $selected: boolean; $disabled: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 16px 12px;
  border-radius: 20px;
  border: 1.5px solid
    ${(p) =>
      p.$selected
        ? "rgba(220, 100, 30, 0.6)"
        : "rgba(255, 170, 100, 0.3)"};
  background: ${(p) =>
    p.$selected
      ? "rgba(255, 130, 40, 0.15)"
      : "rgba(255, 255, 255, 0.55)"};
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  cursor: ${(p) => (p.$disabled && !p.$selected ? "not-allowed" : "pointer")};
  opacity: ${(p) => (p.$disabled && !p.$selected ? 0.5 : 1)};
  transition: border-color 0.2s, background 0.2s, opacity 0.2s;
  box-shadow: ${(p) =>
    p.$selected
      ? "0 4px 20px rgba(220, 100, 30, 0.25), 0 0 0 2px rgba(220, 100, 30, 0.15) inset"
      : "0 2px 12px rgba(220, 130, 60, 0.08)"};
`;

const Emoji = styled.span`
  font-size: 28px;
  line-height: 1;
`;

const Label = styled.span<{ $selected: boolean }>`
  font-size: 13px;
  font-weight: 600;
  color: ${(p) => (p.$selected ? "rgba(180, 65, 15, 0.9)" : "rgba(100, 45, 15, 0.65)")};
  text-align: center;
  word-break: keep-all;
  line-height: 1.3;
`;

const CheckMark = styled(motion.div)`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: rgba(220, 90, 30, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: white;
`;

export default function KeywordCard({
  keyword,
  isSelected,
  onToggle,
  disabled = false,
}: KeywordCardProps) {
  return (
    <Card
      $selected={isSelected}
      $disabled={disabled}
      onClick={() => onToggle(keyword)}
      whileHover={!disabled || isSelected ? { scale: 1.05, y: -2 } : {}}
      whileTap={!disabled || isSelected ? { scale: 0.95 } : {}}
      style={{ position: "relative" }}
      // 선택 시 팝 애니메이션
      animate={isSelected ? { scale: [1, 1.08, 1] } : { scale: 1 }}
      transition={{ duration: 0.25 }}
    >
      {/* 선택 체크마크 */}
      {isSelected && (
        <CheckMark
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
        >
          ✓
        </CheckMark>
      )}
      <Emoji>{keyword.emoji}</Emoji>
      <Label $selected={isSelected}>{keyword.label}</Label>
    </Card>
  );
}
