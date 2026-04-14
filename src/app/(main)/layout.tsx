"use client";

import styled from "styled-components";
import BottomNav from "@/components/BottomNav";
import { useAppStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const Shell = styled.div`
  min-height: 100dvh;
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
`;

const Content = styled.main`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;

  &::-webkit-scrollbar {
    display: none;
  }
`;

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const onboardingComplete = useAppStore((s) => s.onboardingComplete);
  const refreshTodayCard = useAppStore((s) => s.refreshTodayCard);
  const router = useRouter();

  useEffect(() => {
    if (!onboardingComplete) {
      router.replace("/onboarding");
    } else {
      refreshTodayCard();
    }
  }, [onboardingComplete, router, refreshTodayCard]);

  if (!onboardingComplete) return null;

  return (
    <Shell>
      <Content>{children}</Content>
      <BottomNav />
    </Shell>
  );
}
