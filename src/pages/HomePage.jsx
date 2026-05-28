import { useEffect } from "react";
import HeroSection from "../components/HeroSection.jsx";
import ScrollSlides from "../components/ScrollSlides.jsx";
import Footer from "../components/Footer.jsx";
import HeaderScrollActive from "../components/HeaderScrollActive.jsx";
import { useScrollDirection } from "../hooks/useScrollDirection.js";

/**
 * HomePage — Hero_Section부터 시작 (Hero_Intro 제거).
 *
 * 구조:
 *   ┌─ HeroSection (100vh, snap-section)      ← Background+텍스트+헤더 시퀀스
 *   │  ScrollSlides (500vh, smooth scroll)
 *   │  Footer
 *   └ HeaderScrollActive (fixed, 본문 진입 후 ↑ 시 등장)
 *
 * 스크롤 정책:
 *   - HeroSection 영역(0 ~ vh): JS-based snap (휠 멈춤 후 120ms → 0 또는 vh로 smooth)
 *   - ScrollSlides 이후: 자유 스크롤 (smooth)
 *   - 페이지 진입 시 항상 scrollY=0에서 시작 (HeroSection 시퀀스 1회 발동)
 */

export default function HomePage() {
  const { direction, atTop, pastHero } = useScrollDirection({
    threshold: 6,
    topZoneVh: 1, // HeroSection 통과 후 본문 진입 판정
  });

  // 진입 시 scrollY=0 강제 (브라우저 복원 위치 무시)
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
  }, []);

  // HeroSection 영역에서만 JS 스냅
  useEffect(() => {
    let snapTimer = null;
    let isSnapping = false;

    const onScroll = () => {
      clearTimeout(snapTimer);
      if (isSnapping) return;
      const vh = window.innerHeight;
      const sy = window.scrollY;
      if (sy <= 0 || sy >= vh) return;
      snapTimer = setTimeout(() => {
        const cur = window.scrollY;
        if (cur <= 0 || cur >= vh) return;
        const target = cur < vh / 2 ? 0 : vh;
        if (Math.abs(cur - target) > 2) {
          isSnapping = true;
          window.scrollTo({ top: target, behavior: "smooth" });
          setTimeout(() => {
            isSnapping = false;
          }, 600);
        }
      }, 130);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(snapTimer);
    };
  }, []);

  const showScrollActive = pastHero && direction === "up" && !atTop;

  return (
    <div className="relative">
      <HeroSection />
      <ScrollSlides />
      <Footer />

      <HeaderScrollActive
        visible={showScrollActive}
        onMenuClick={() => {
          /* TODO: 모바일 시트 메뉴 */
        }}
      />
    </div>
  );
}
