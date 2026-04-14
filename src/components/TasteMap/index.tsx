"use client";

import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
import { TasteCoordinate } from "@/lib/store";

interface TasteMapProps {
  coordinates: TasteCoordinate[];
  // 아카이브 카드 반응 기반 이동 후 좌표 (나중에 API 연동)
  evolvedCoordinates?: TasteCoordinate[];
  showEvolution?: boolean;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;

const ChartWrapper = styled.div`
  position: relative;
  width: 280px;
  height: 280px;
`;

// SVG 레이더 차트 컴포넌트
// recharts를 사용하지 않고 직접 SVG를 그려서 더 세밀한 애니메이션 제어
const SVGChart = styled.svg`
  overflow: visible;
`;

const LegendRow = styled.div`
  display: flex;
  gap: 20px;
  margin-top: 20px;
  flex-wrap: wrap;
  justify-content: center;
`;

const LegendItem = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
  color: rgba(120, 50, 20, 0.7);

  &::before {
    content: "";
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: ${(p) => p.$color};
  }
`;

// 극좌표 → 직교좌표 변환
function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angleIndex: number,
  total: number
): [number, number] {
  const angle = (Math.PI * 2 * angleIndex) / total - Math.PI / 2;
  return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
}

// 좌표 배열을 SVG path d 문자열로 변환
function coordinatesToPath(points: [number, number][]): string {
  return points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(2)},${p[1].toFixed(2)}`)
    .join(" ") + " Z";
}

export default function TasteMap({
  coordinates,
  evolvedCoordinates,
  showEvolution = false,
}: TasteMapProps) {
  const cx = 140;
  const cy = 140;
  const maxR = 100;
  const levels = 4; // 동심원 레벨 수

  const axes = coordinates.map((c) => c.axis);
  const n = axes.length;

  // 원본 좌표 → SVG 포인트
  const originalPoints: [number, number][] = coordinates.map((c, i) => {
    const r = (c.value / 100) * maxR;
    return polarToCartesian(cx, cy, r, i, n);
  });

  // 진화된 좌표 → SVG 포인트 (있을 경우)
  const evolvedPoints: [number, number][] | null = evolvedCoordinates
    ? evolvedCoordinates.map((c, i) => {
        const r = (c.value / 100) * maxR;
        return polarToCartesian(cx, cy, r, i, n);
      })
    : null;

  // 동심원 반경 배열
  const rings = Array.from({ length: levels }, (_, i) =>
    Math.round((maxR * (i + 1)) / levels)
  );

  // 축 끝점 (레이블 위치)
  const axisEnds: [number, number][] = axes.map((_, i) =>
    polarToCartesian(cx, cy, maxR + 24, i, n)
  );

  return (
    <Container>
      <ChartWrapper>
        <SVGChart width={280} height={280} viewBox="0 0 280 280">
          {/* 동심원 그리드 */}
          {rings.map((r, i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke="rgba(255, 150, 70, 0.12)"
              strokeWidth={1}
            />
          ))}

          {/* 축 선 */}
          {axes.map((_, i) => {
            const [ex, ey] = polarToCartesian(cx, cy, maxR, i, n);
            return (
              <line
                key={i}
                x1={cx}
                y1={cy}
                x2={ex}
                y2={ey}
                stroke="rgba(255, 150, 70, 0.22)"
                strokeWidth={1}
              />
            );
          })}

          {/* 원본 취향 영역 (Framer Motion으로 path 애니메이션) */}
          <motion.path
            d={coordinatesToPath(originalPoints)}
            fill="rgba(255, 140, 60, 0.18)"
            stroke="rgba(220, 100, 30, 0.75)"
            strokeWidth={2}
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />

          {/* 진화된 취향 영역 (showEvolution이 true일 때만) */}
          {showEvolution && evolvedPoints && (
            <motion.path
              d={coordinatesToPath(evolvedPoints)}
              fill="rgba(255, 200, 80, 0.14)"
              stroke="rgba(220, 160, 40, 0.65)"
              strokeWidth={2}
              strokeDasharray="5 3"
              strokeLinejoin="round"
              initial={{ opacity: 0 }}
              animate={{ d: coordinatesToPath(evolvedPoints), opacity: 1 }}
              transition={{
                d: { duration: 0.55, ease: "easeOut" },
                opacity: { duration: 0.4 },
              }}
            />
          )}

          {/* 원본 취향 데이터 포인트 */}
          {originalPoints.map(([x, y], i) => (
            <motion.circle
              key={i}
              cx={x}
              cy={y}
              r={4}
              fill="rgba(220, 100, 30, 0.9)"
              stroke="white"
              strokeWidth={1.5}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.8 + i * 0.05, type: "spring" }}
              style={{ originX: `${x}px`, originY: `${y}px` }}
            />
          ))}

          {/* 축 레이블 */}
          {axes.map((axis, i) => {
            const [lx, ly] = axisEnds[i];
            // 레이블 정렬 결정
            const textAnchor =
              lx < cx - 5 ? "end" : lx > cx + 5 ? "start" : "middle";
            return (
              <text
                key={i}
                x={lx}
                y={ly}
                textAnchor={textAnchor}
                dominantBaseline="central"
                fontSize={11}
                fontWeight={600}
                fill="rgba(150, 60, 20, 0.75)"
                fontFamily="Pretendard, sans-serif"
              >
                {axis}
              </text>
            );
          })}
        </SVGChart>
      </ChartWrapper>

      {/* 범례 */}
      {showEvolution && (
        <LegendRow>
          <LegendItem $color="rgba(220, 100, 30, 0.9)">초기 취향</LegendItem>
          <LegendItem $color="rgba(220, 160, 40, 0.8)">현재 취향</LegendItem>
        </LegendRow>
      )}
    </Container>
  );
}
