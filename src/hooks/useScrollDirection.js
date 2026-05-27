import { useEffect, useState } from "react";

/**
 * useScrollDirection — 스크롤 방향과 위치를 추적한다.
 *
 * Figma 가이드 (66:197):
 *   - Hero 영역에서는 Header(Hero Section) 표시 (sticky 헤더 없음)
 *   - Scroll Down 시 헤더 사라짐
 *   - Scroll Up 시 Header(Up Scroll Active)가 위에서 매끄럽게 등장
 *   - 다시 Scroll Down 시 사라짐
 */
export function useScrollDirection({
  threshold = 8,
  topZoneVh = 1,
} = {}) {
  const [scrollY, setScrollY] = useState(0);
  const [direction, setDirection] = useState("still");
  const [atTop, setAtTop] = useState(true);
  const [pastHero, setPastHero] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;

    const update = () => {
      const currentY = window.scrollY;
      const diff = currentY - lastY;

      if (Math.abs(diff) >= threshold) {
        setDirection(diff > 0 ? "down" : "up");
        lastY = currentY;
      }

      setScrollY(currentY);
      setAtTop(currentY < 24);
      setPastHero(currentY > window.innerHeight * topZoneVh);
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold, topZoneVh]);

  return { scrollY, direction, atTop, pastHero };
}
