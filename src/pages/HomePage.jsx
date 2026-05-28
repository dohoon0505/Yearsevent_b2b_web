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

  // HeroSection 영역(0~vh)에서 wheel/touch/key 이벤트를 즉시 가로채서 snap
  // 이전 방식: native scroll 진행 → 휠 멈춤 → 110ms 대기 → snap (시각적 멈춤 발생)
  // 개선 방식: 첫 입력에서 preventDefault → 즉시 vh/0으로 smooth scrollTo (중간 멈춤 X)
  useEffect(() => {
    let isSnapping = false;
    let touchStartY = 0;

    const snapTo = (dir) => {
      const vh = window.innerHeight;
      const cur = window.scrollY;
      const target = dir === "down" ? vh : 0;
      if (Math.abs(cur - target) <= 2) return;
      isSnapping = true;
      window.scrollTo({ top: target, behavior: "smooth" });
      setTimeout(() => {
        isSnapping = false;
      }, 700);
    };

    const inHero = () => {
      const sy = window.scrollY;
      const vh = window.innerHeight;
      return sy >= 0 && sy < vh - 2;
    };

    const onWheel = (e) => {
      if (!inHero()) return;
      e.preventDefault();
      if (isSnapping) return;
      if (Math.abs(e.deltaY) < 1) return;
      snapTo(e.deltaY > 0 ? "down" : "up");
    };

    const onTouchStart = (e) => {
      touchStartY = e.touches[0]?.clientY ?? 0;
    };
    const onTouchMove = (e) => {
      if (!inHero()) return;
      e.preventDefault();
      if (isSnapping) return;
      const y = e.touches[0]?.clientY ?? 0;
      const dy = touchStartY - y;
      if (Math.abs(dy) < 5) return;
      snapTo(dy > 0 ? "down" : "up");
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
      if (!inHero()) return;
      const isDown = DOWN_KEYS.has(e.key);
      const isUp = UP_KEYS.has(e.key);
      if (!isDown && !isUp) return;
      e.preventDefault();
      if (isSnapping) return;
      snapTo(isDown ? "down" : "up");
    };

    // passive:false 로 등록해야 preventDefault 가능
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKey);
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
