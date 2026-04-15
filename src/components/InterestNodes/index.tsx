"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { InterestKeyword } from "@/lib/store";
import { CATEGORIES } from "../InterestGrid/data";

// ─── 레이아웃 상수 ────────────────────────────────────────────────────────────

const COLS      = 3;     // 고정 3열 그리드
const PARENT_R  = 52;    // 부모 노드 반지름 (px)
const SUB_R     = 36;    // 서브 노드 반지름 (px)
const CELL_W    = 116;   // 그리드 셀 너비
const CELL_H    = 116;   // 그리드 셀 높이
const PAD_TOP   = 20;    // 상단 여백
const PAD_X     = 12;    // 좌우 여백

// 서브 노드 궤도 반지름 — 부모 반지름 + 서브 반지름 + gap
const ORBIT_R = PARENT_R + SUB_R + 20;

// 그룹별 랜덤 색상 팔레트
const GROUP_COLORS = [
  "#ff6b6b", "#ff9f43", "#feca57", "#48dbfb",
  "#a29bfe", "#fd79a8", "#55efc4", "#74b9ff",
  "#e17055", "#6c5ce7", "#00cec9", "#fdcb6e",
  "#ff7675", "#81ecec", "#fab1a0", "#dfe6e9",
];

// ─── 타입 ─────────────────────────────────────────────────────────────────────

type SubNode = {
  id: string;
  label: string;
  keyword: InterestKeyword;
  parentId: string;
  x: number; // 캔버스 내 절대 X
  y: number; // 캔버스 내 절대 Y
};

type GroupData = {
  color: string;
  subs: SubNode[];
  parentX: number; // 스폰 기준점 X
  parentY: number; // 스폰 기준점 Y
};

interface Props {
  selectedKeywords: InterestKeyword[];
  onToggle: (kw: InterestKeyword) => void;
  disabled: boolean;
}

// ─── 위치 계산 ────────────────────────────────────────────────────────────────

// 3열 그리드에서 인덱스 기반 부모 노드 중심 좌표 반환
function getParentPos(idx: number, containerW: number): { x: number; y: number } {
  const totalCellW = (containerW - PAD_X * 2) / COLS;
  const col = idx % COLS;
  const row = Math.floor(idx / COLS);
  return {
    x: PAD_X + col * totalCellW + totalCellW / 2,
    y: PAD_TOP + row * CELL_H + CELL_H / 2,
  };
}

/**
 * 서브 노드 배치
 *
 * 첫 행(row === 0): 부모 옆에 세로 일직선
 *   - 좌열/중열 → 오른쪽, 우열 → 왼쪽
 *   - y는 Canvas top(PAD_TOP + SUB_R) 아래로만 배치
 *
 * 나머지 행: 부채꼴 전개
 *   - 좌열/중열 → 오른쪽(0°), 우열 → 왼쪽(180°)
 */
function getOrbitPositions(
  cx: number,
  cy: number,
  count: number,
  containerW: number,
  canvasH: number,
  col: number,
  row: number,
): Array<{ x: number; y: number }> {
  const minY = PAD_TOP + SUB_R;
  const maxY = canvasH - SUB_R - 6;
  const marginX = SUB_R + 6;

  // ── 첫 행: 세로 일직선 ──────────────────────────────────────────
  if (row === 0) {
    const step   = SUB_R * 2 + 8;
    const totalH = step * count - 8;
    const rawStartY = cy - totalH / 2;
    const startY = Math.max(minY, Math.min(maxY - totalH + SUB_R, rawStartY));
    const x = col === COLS - 1
      ? cx - PARENT_R - SUB_R - 10
      : cx + PARENT_R + SUB_R + 10;
    return Array.from({ length: count }, (_, i) => ({
      x,
      y: startY + i * step,
    }));
  }

  // ── 나머지 행: 부채꼴 ───────────────────────────────────────────
  const baseAngle  = col === COLS - 1 ? Math.PI : 0;
  const minArcStep = (SUB_R * 2 + 8) / ORBIT_R;
  const spread     = count === 1 ? 0 : minArcStep * (count - 1);

  return Array.from({ length: count }, (_, i) => {
    const t     = count === 1 ? 0.5 : i / (count - 1);
    const angle = baseAngle - spread / 2 + t * spread;
    return {
      x: Math.max(marginX, Math.min(containerW - marginX, cx + Math.cos(angle) * ORBIT_R)),
      y: Math.max(minY,    Math.min(maxY,                 cy + Math.sin(angle) * ORBIT_R)),
    };
  });
}

// 전체 캔버스 높이 계산 — 마지막 노드 + 하단 여백 + 최대 궤도 공간 확보
function getCanvasHeight(containerW: number): number {
  const rows = Math.ceil(CATEGORIES.length / COLS);
  return PAD_TOP + rows * CELL_H + ORBIT_R + SUB_R + 32;
}

// ─── 스타일 ───────────────────────────────────────────────────────────────────

const Wrapper = styled.div`
  width: 100%;
  /* 스크롤 가능하되 스크롤바 UI 숨김 */
  overflow-y: auto;
  overflow-x: hidden;
  &::-webkit-scrollbar { display: none; }
  scrollbar-width: none;
  margin-top: 14px;
`;

const Canvas = styled.div<{ $h: number }>`
  position: relative;
  width: 100%;
  height: ${p => p.$h}px;
`;

// ─── 노드 원 ─────────────────────────────────────────────────────────────────

const NodeCircle = styled.div<{
  $r: number;
  $border: string;
  $fill: string;
}>`
  width: ${p => p.$r * 2}px;
  height: ${p => p.$r * 2}px;
  border-radius: 50%;
  background: ${p => p.$fill};
  border: 1px solid ${p => p.$border};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  /* 네온 글로우: border 색 기반 외부 + 내부 ring */
  box-shadow:
    0 0 6px ${p => p.$border},
    0 0 14px ${p => p.$border}44,
    0 3px 10px rgba(200, 100, 40, 0.08);
  transition: border-color 0.25s, box-shadow 0.25s, background 0.2s;
  pointer-events: none;
`;

const NodeEmoji = styled.span`
  font-size: 24px;
  line-height: 1;
`;

const NodeLabel = styled.span`
  font-size: 10px;
  font-weight: 700;
  color: rgba(55, 22, 5, 0.78);
  text-align: center;
  margin-top: 4px;
  max-width: ${PARENT_R * 2 - 8}px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const SubText = styled.span<{ $selected: boolean }>`
  font-size: 9.5px;
  font-weight: 700;
  color: ${p => (p.$selected ? "rgba(255,255,255,0.96)" : "rgba(55, 22, 5, 0.82)")};
  text-align: center;
  padding: 0 3px;
  line-height: 1.25;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: keep-all;
`;

// ─── 메인 컴포넌트 ────────────────────────────────────────────────────────────

export default function InterestNodes({ selectedKeywords, onToggle, disabled }: Props) {
  const wrapperRef  = useRef<HTMLDivElement>(null);
  const [containerW, setContainerW] = useState(360);
  const [activeId, setActiveId]     = useState<string | null>(null);
  const [groups, setGroups]         = useState<Record<string, GroupData>>({});
  const colorIdx = useRef(0);

  // 컨테이너 너비 감지
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setContainerW(e.contentRect.width));
    ro.observe(el);
    setContainerW(el.offsetWidth);
    return () => ro.disconnect();
  }, []);

  const canvasH = getCanvasHeight(containerW);

  const handleParentClick = useCallback(
    (catId: string) => {
      // 같은 노드 재클릭 → 닫기
      if (activeId === catId) {
        setActiveId(null);
        setGroups({});
        return;
      }

      setActiveId(catId);

      // 이전 그룹 전부 제거 — 잔상 없이 현재 그룹만 유지
      const catIdx = CATEGORIES.findIndex(c => c.id === catId);
      const cat    = CATEGORIES[catIdx];
      const { x: px, y: py } = getParentPos(catIdx, containerW);
      const h   = getCanvasHeight(containerW);
      const col = catIdx % COLS;
      const row = Math.floor(catIdx / COLS);

      const color = GROUP_COLORS[colorIdx.current % GROUP_COLORS.length];
      colorIdx.current++;

      const orbits = getOrbitPositions(px, py, cat.subKeywords.length, containerW, h, col, row);
      const subs: SubNode[] = cat.subKeywords.map((label, i) => ({
        id:       `${catId}_${i}`,
        label,
        keyword:  { id: `${catId}_${i}`, label, emoji: cat.emoji },
        parentId: catId,
        x:        orbits[i].x,
        y:        orbits[i].y,
      }));

      setGroups({ [catId]: { color, subs, parentX: px, parentY: py } });
    },
    [activeId, containerW],
  );

  return (
    <Wrapper ref={wrapperRef}>
      <Canvas $h={canvasH}>

        {/* ── 부모 노드 (고정 그리드) ── */}
        {CATEGORIES.map((cat, idx) => {
          const { x, y } = getParentPos(idx, containerW);
          const group    = groups[cat.id];
          const isActive = activeId === cat.id;

          // 테두리: 활성 그룹 색 → 진하게, 이전 스폰 그룹 → 연하게, 미개척 → 중립 warm
          const borderColor = isActive
            ? (group?.color ?? "rgba(220,100,30,0.9)")
            : group
            ? `${group.color}66`
            : "rgba(255,185,100,0.38)";

          const fillColor = isActive
            ? "rgba(255, 248, 238, 0.97)"
            : "rgba(255, 252, 248, 0.84)";

          return (
            <motion.div
              key={cat.id}
              style={{ position: "absolute", left: 0, top: 0, cursor: "pointer" }}
              animate={{ x: x - PARENT_R, y: y - PARENT_R }}
              transition={{ type: "spring", stiffness: 140, damping: 18 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.88 }}
              onClick={() => handleParentClick(cat.id)}
            >
              <NodeCircle $r={PARENT_R} $border={borderColor} $fill={fillColor}>
                <NodeEmoji>{cat.emoji}</NodeEmoji>
                <NodeLabel>{cat.label}</NodeLabel>
              </NodeCircle>
            </motion.div>
          );
        })}

        {/* ── 서브 노드 (누적 보존) ── */}
        {Object.entries(groups).flatMap(([parentId, group]) =>
          group.subs.map(sub => {
            const isSelected    = selectedKeywords.some(k => k.id === sub.id);
            const isActiveGroup = activeId === parentId;
            const isDisabled    = disabled && !isSelected;

            const borderColor = isActiveGroup ? group.color : `${group.color}44`;
            const fillColor   = isSelected
              ? "rgba(218, 85, 22, 0.9)"
              : "rgba(255, 252, 248, 0.88)";

            return (
              <motion.div
                key={sub.id}
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  cursor: isDisabled ? "not-allowed" : "pointer",
                }}
                // 부모 위치에서 burst 등장
                initial={{ x: group.parentX - SUB_R, y: group.parentY - SUB_R, scale: 0, opacity: 0 }}
                animate={{
                  x:       sub.x - SUB_R,
                  y:       sub.y - SUB_R,
                  scale:   1,
                  opacity: isActiveGroup ? 1 : 0.35,
                }}
                transition={{ type: "spring", stiffness: 220, damping: 22 }}
                whileHover={!isDisabled ? { scale: 1.18 } : undefined}
                whileTap={!isDisabled ? { scale: 0.86 } : undefined}
                onClick={() => !isDisabled && onToggle(sub.keyword)}
              >
                <NodeCircle
                  $r={SUB_R}
                  $border={borderColor}
                  $fill={fillColor}
                  style={{ opacity: isDisabled ? 0.36 : 1 }}
                >
                  <SubText $selected={isSelected}>{sub.label}</SubText>
                </NodeCircle>
              </motion.div>
            );
          })
        )}
      </Canvas>
    </Wrapper>
  );
}
