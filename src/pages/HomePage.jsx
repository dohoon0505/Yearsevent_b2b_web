import { useEffect } from "react";
import Lenis from "lenis";
import HeroSection from "../components/HeroSection.jsx";
import ScrollSlides from "../components/ScrollSlides.jsx";
import Footer from "../components/Footer.jsx";
import HeaderScrollActive from "../components/HeaderScrollActive.jsx";
import { useScrollDirection } from "../hooks/useScrollDirection.js";

/**
 * HomePage — Hero_Section부터 시작 (Hero_Intro 제거).
 *
 * 구조:
 *   ┌─ HeroSection (100vh, JS snap)           ← Background+텍스트+헤더 시퀀스
 *   │  ScrollSlides (500vh, Lenis smooth)
 *   │  Footer
 *   └ HeaderScrollActive (fixed, 본문 진입 후 ↑ 시 등장)
 *
 * 스크롤 정책:
 *   - HeroSection 영역(0 ~ vh): native + JS snap (방향 기반, 휠 멈춤 후 110ms)
 *   - ScrollSlides 이후: Lenis 부드러운 관성 스크롤 (asinsam·miracell 참고)
 *   - 영역 전환 시 lenis.start() / lenis.stop() 자동 토글
 *   - 페이지 진입 시 scrollY=0 강제 → HeroSection 시퀀스 1회 발동
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

  // Lenis — HeroSection 통과 후 부드러운 관성 스크롤 적용
  // asinsam.com / miracell.co.kr 류의 RAF 기반 smooth scroll 패턴
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expo out
      smoothWheel: true,
      smoothTouch: false, // 모바일은 native scroll
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
    });

    // 초기: HeroSection 영역이면 비활성 (native + JS snap에 위임)
    const HERO_GUARD = 10;
    let prevInHero = window.scrollY < window.innerHeight - HERO_GUARD;
    if (prevInHero) lenis.stop();

    let rafId = null;
    const raf = (time) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    // 영역 전환 감지 — vh 경계를 넘나들 때 start/stop 토글
    const onScroll = () => {
      const sy = window.scrollY;
      const vh = window.innerHeight;
      const inHero = sy < vh - HERO_GUARD;
      if (inHero !== prevInHero) {
        if (inHero) lenis.stop();
        else lenis.start();
        prevInHero = inHero;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      lenis.destroy();
    };
  }, []);

  // HeroSection 영역(0~vh)에서만 JS 스냅 — 사용자 의도 방향 기반
  // wheel/touch/keydown 이벤트로 직접 방향을 캡처 → 위치가 아닌 의도로 snap target 결정
  useEffect(() => {
    let snapTimer = null;
    let isSnapping = false;
    let intentDir = null; // "down" | "up" | null
    let touchStartY = 0;

    const onWheel = (e) => {
      if (e.deltaY > 1) intentDir = "down";
      else if (e.deltaY < -1) intentDir = "up";
    };

    const onTouchStart = (e) => {
      touchStartY = e.touches[0]?.clientY ?? 0;
    };
    const onTouchMove = (e) => {
      const y = e.touches[0]?.clientY ?? 0;
      const dy = touchStartY - y;
      if (dy > 2) intentDir = "down";
      else if (dy < -2) intentDir = "up";
      touchStartY = y;
    };

    const DOWN_KEYS = new Set([
      "ArrowDown",
      "PageDown",
      "End",
      " ",
      "Spacebar",
    ]);
    const UP_KEYS = new Set(["ArrowUp", "PageUp", "Home"]);
    const onKey = (e) => {
      if (DOWN_KEYS.has(e.key)) intentDir = "down";
      else if (UP_KEYS.has(e.key)) intentDir = "up";
    };

    const onScroll = () => {
      clearTimeout(snapTimer);
      if (isSnapping) return;
      const vh = window.innerHeight;
      const sy = window.scrollY;
      // HeroSection 영역 벗어나면 의도 reset
      if (sy <= 0 || sy >= vh) {
        intentDir = null;
        return;
      }
      snapTimer = setTimeout(() => {
        const cur = window.scrollY;
        if (cur <= 0 || cur >= vh) return;
        // 의도 우선 → fallback: 위치 절반 기준
        const target =
          intentDir === "up"
            ? 0
            : intentDir === "down"
              ? vh
              : cur < vh / 2
                ? 0
                : vh;
        if (Math.abs(cur - target) > 2) {
          isSnapping = true;
          window.scrollTo({ top: target, behavior: "smooth" });
          setTimeout(() => {
            isSnapping = false;
            intentDir = null;
          }, 650);
        }
      }, 110);
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKey);
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
