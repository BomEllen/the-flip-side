"use client";

import styled from "styled-components";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "오늘", icon: "✦" },
  { href: "/archive", label: "아카이브", icon: "◈" },
  { href: "/map", label: "취향 지도", icon: "◎" },
];

const Nav = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  padding: 10px 0 20px;
  display: flex;
  justify-content: center;
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-top: 1px solid rgba(255, 160, 80, 0.2);
  box-shadow: 0 -4px 24px rgba(255, 120, 50, 0.08);
  z-index: 100;
`;

const NavInner = styled.div`
  width: 100%;
  max-width: 640px;
  padding: 0 24px;
  display: flex;
  justify-content: space-around;

  @media (min-width: 768px) {
    max-width: 800px;
    padding: 0 48px;
  }
`;

const NavItem = styled(Link)<{ $active: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  text-decoration: none;
  flex: 1;
  position: relative;
`;

const IconWrapper = styled(motion.div)<{ $active: boolean }>`
  width: 44px;
  height: 44px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  background: ${(p) =>
    p.$active ? "rgba(255, 140, 66, 0.15)" : "transparent"};
  transition: background 0.2s;
`;

const NavLabel = styled.span<{ $active: boolean }>`
  font-size: 10px;
  font-weight: ${(p) => (p.$active ? "700" : "500")};
  color: ${(p) =>
    p.$active ? "rgba(200, 70, 20, 0.95)" : "rgba(150, 70, 30, 0.5)"};
  transition: color 0.2s;

  @media (min-width: 768px) {
    font-size: 11px;
  }
`;

const ActiveDot = styled(motion.div)`
  position: absolute;
  bottom: -4px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: rgba(220, 80, 30, 0.85);
`;

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <Nav>
      <NavInner>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <NavItem key={item.href} href={item.href} $active={isActive}>
              <IconWrapper
                $active={isActive}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {item.icon}
              </IconWrapper>
              <NavLabel $active={isActive}>{item.label}</NavLabel>
              {isActive && (
                <ActiveDot
                  layoutId="nav-active-dot"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </NavItem>
          );
        })}
      </NavInner>
    </Nav>
  );
}
