import { PromoBar } from "@/components/home/PromoBar";
import { HomeNav } from "@/components/home/HomeNav";
import { HeroSection } from "@/components/home/HeroSection";
import { AboutSection } from "@/components/home/AboutSection";
import { WarningSection } from "@/components/home/WarningSection";
import { BenefitsSection } from "@/components/home/BenefitsSection";
import { CasesSection } from "@/components/home/CasesSection";
import { StatsSection } from "@/components/home/StatsSection";
import { ArcadeSection } from "@/components/home/ArcadeSection";
import { FloatingCTA } from "@/components/home/FloatingCTA";

/**
 * 올해의경조사 홈(/)
 *
 * 풀페이지 스크롤 스냅 구조:
 * - 고정 상단: PromoBar(48px) + HomeNav(64px) — 합산 112px
 * - 본문: .fullscroll-container 내부 sections (각 100vh, scroll-snap-align: start)
 * - 우하단 고정: FloatingCTA (카카오톡 상담, pulse)
 */
export default function Home() {
  return (
    <>
      <PromoBar />
      <HomeNav />

      <div className="fullscroll-container h-screen overflow-y-scroll">
        <HeroSection />
        <AboutSection />
        <WarningSection />
        <BenefitsSection />
        <CasesSection />
        <StatsSection />
        <ArcadeSection />
      </div>

      <FloatingCTA />
    </>
  );
}
