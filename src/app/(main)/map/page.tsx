"use client";

import styled from "styled-components";
import { motion } from "framer-motion";
import { useAppStore } from "@/lib/store";
import TasteMap from "@/components/TasteMap";

const Page = styled.div`
  min-height: calc(100dvh - 72px);
  padding: 28px 20px 100px;
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;

  @media (min-width: 768px) {
    padding: 40px 48px 100px;
  }
`;

const Header = styled.div``;

const Title = styled.h1`
  font-size: clamp(24px, 3vw, 32px);
  font-weight: 800;
  color: rgba(60, 18, 8, 0.9);
`;

const Subtitle = styled.p`
  font-size: 14px;
  font-weight: 400;
  color: rgba(120, 50, 20, 0.6);
  margin-top: 6px;
  line-height: 1.5;
`;

// 유저 타입 레이블 카드
const TypeCard = styled(motion.div)`
  padding: 20px;
  border-radius: 22px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.75) 0%, rgba(255, 235, 210, 0.6) 100%);
  border: 1.5px solid rgba(255, 160, 80, 0.35);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow: 0 4px 20px rgba(220, 100, 40, 0.1);
`;

const TypeLabel = styled.p`
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(200, 90, 30, 0.65);
  margin-bottom: 8px;
`;

const TypeName = styled.h2`
  font-size: 20px;
  font-weight: 800;
  color: rgba(60, 18, 8, 0.9);
  line-height: 1.3;
`;

const TypeDesc = styled.p`
  font-size: 13px;
  font-weight: 400;
  color: rgba(120, 50, 20, 0.65);
  margin-top: 8px;
  line-height: 1.55;
`;

const MapCard = styled(motion.div)`
  padding: 24px 16px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.68);
  border: 1.5px solid rgba(255, 160, 80, 0.28);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow: 0 4px 20px rgba(220, 100, 40, 0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`;

const MapSectionTitle = styled.p`
  font-size: 13px;
  font-weight: 700;
  color: rgba(180, 70, 20, 0.8);
  align-self: flex-start;
`;

// 진화 설명 카드
const EvolutionCard = styled(motion.div)`
  padding: 16px 18px;
  border-radius: 18px;
  background: rgba(255, 180, 60, 0.07);
  border: 1.5px solid rgba(255, 180, 60, 0.28);
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const EvolutionTitle = styled.p`
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(200, 120, 20, 0.85);
`;

const EvolutionDesc = styled.p`
  font-size: 13px;
  font-weight: 400;
  color: rgba(120, 60, 15, 0.75);
  line-height: 1.55;
`;

export default function MapPage() {
  const { tasteCoordinates, evolvedTasteCoordinates, userTypeLabel, archiveCards } = useAppStore();

  const boomUpCount = archiveCards.filter((c) => c.reaction === "boom-up").length;
  const boomDownCount = archiveCards.filter((c) => c.reaction === "boom-down").length;
  const hasReactions = boomUpCount + boomDownCount > 0;

  return (
    <Page>
      <Header>
        <Title>취향 지도</Title>
        <Subtitle>
          역취향 경험이 쌓일수록 당신의 좌표가 이동합니다.
        </Subtitle>
      </Header>

      {/* 유저 타입 */}
      <TypeCard
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <TypeLabel>✦ 나의 취향 유형</TypeLabel>
        <TypeName>"{userTypeLabel}"</TypeName>
        <TypeDesc>
          강한 취향 편향을 가진 당신. The Flip Side는 당신의 좌표가 조금씩 움직이도록 돕습니다.
        </TypeDesc>
      </TypeCard>

      {/* 레이더 차트 */}
      <MapCard
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <MapSectionTitle>
          {hasReactions ? "취향 좌표 변화" : "초기 취향 좌표"}
        </MapSectionTitle>
        <TasteMap
          coordinates={tasteCoordinates}
          evolvedCoordinates={evolvedTasteCoordinates}
          showEvolution={hasReactions}
        />
      </MapCard>

      {/* 진화 설명 */}
      {hasReactions && (
        <EvolutionCard
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <EvolutionTitle>📍 좌표 이동 중</EvolutionTitle>
          <EvolutionDesc>
            Boom Up {boomUpCount}번 · Boom Down {boomDownCount}번 — 당신의 취향
            반경이 조금씩 넓어지고 있어요. 계속 뒤집어보세요.
          </EvolutionDesc>
        </EvolutionCard>
      )}

      {!hasReactions && tasteCoordinates.length > 0 && (
        <EvolutionCard
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <EvolutionTitle>💡 아직 반응 없음</EvolutionTitle>
          <EvolutionDesc>
            메인 탭에서 오늘의 역취향 카드에 반응하면 취향 지도가 움직이기 시작해요.
          </EvolutionDesc>
        </EvolutionCard>
      )}
    </Page>
  );
}
