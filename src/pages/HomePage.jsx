import { useEffect, useState } from "react";
import HeroIntro from "../components/HeroIntro.jsx";
import HeroSection from "../components/HeroSection.jsx";
import ScrollSlides from "../components/ScrollSlides.jsx";
import Footer from "../components/Footer.jsx";
import HeaderScrollActive from "../components/HeaderScrollActive.jsx";
import { useScrollDirection } from "../hooks/useScrollDirection.js";

/**
 * HomePage — Figma 0:1 100% 재현 + zoom-into-text 인터랙션
 *
 * 구조 (fixed + spacer 패턴):
 *   ┌─ document ─────────────────────────────────┐
 *   │  spacer (150vh)   ← 사용자 스크롤 영역      │
 *   │  HeroSection (100vh)                       │
 *   │  Footer                                    │
 *   └────────────────────────────────────────────┘
 *
 *   HeroIntro는 position: fixed inset-0 z-30 으로 항상 viewport 위에 표시.
 *   spacer 영역을 사용자가 150vh 스크롤하는 동안:
 *     - progress 0 → 1 매핑
 *     - HeroIntro 글자가 "파" 위치로 scale 1 → 12 zoom
 *     - 마지막 5% 구간에서 HeroIntro opacity 1 → 0 (crossfade)
 *
 *   progress 1 도달 시점 = scrollY 150vh = HeroSection이 viewport.top.
 *   결과: zoom 완료 순간에 정확히 HeroSection 도시 사진이 등장 →
 *         사용자는 "파" 글자 안의 사진이 그대로 Hero_Section 배경이 된 듯한 인상.
 *
 * 흐름:
 *   1. 진입 → HeroIntro 풀스크린 흰 배경 + 거대 헤딩 (도시 사진 텍스트 클립)
 *   2. 2초 대기 후 글자 1자씩 stagger 등장
 *   3. 사용자 스크롤 → 글자가 "파" 쪽으로 확대 (scale 1 → 12)
 *   4. zoom 완료 = HeroSection 등장. EventHeader + Header 슬라이드 인.
 *   5. 본문 진입 후 ↑ 스크롤 시 HeaderScrollActive 등장.
 */

/** spacer height (vh) — 사용자가 휠 한 번 굴리면 100vh 점프 (scroll-snap mandatory) */
const ZOOM_SPACER_VH = 100;

export default function HomePage() {
  const { direction, atTop, pastHero } = useScrollDirection({
    threshold: 6,
    topZoneVh: ZOOM_SPACER_VH / 100 + 0.5, // spacer + HeroSection 절반 이후를 "본문"으로
  });

  // zoom 진행률 (0 ~ 1) — spacer 영역을 사용자 스크롤하는 동안 비례
  const [zoomProgress, setZoomProgress] = useState(0);
  const [crossfade, setCrossfade] = useState(0);

  useEffect(() => {
    let ticking = false;
    let snapTimer = null;
    let isSnapping = false;

    const update = () => {
      const vh = window.innerHeight;
      const spacerH = (ZOOM_SPACER_VH / 100) * vh;
      const sy = window.scrollY;
      const raw = Math.max(0, Math.min(1, sy / spacerH));

      // crossfade 구간: progress 0.93 ~ 1.0 (전체의 마지막 7%)
      const fade = Math.max(0, Math.min(1, (raw - 0.93) / 0.07));

      setZoomProgress(raw);
      setCrossfade(fade);

      // JS-based snap — spacer 영역(0 < scrollY < spacerH)에서만 동작
      // CSS scroll-snap 대신 JS scroll-end 감지로 처리 → HeroSection 이후 자유 스크롤
      clearTimeout(snapTimer);
      if (!isSnapping && sy > 0 && sy < spacerH) {
        snapTimer = setTimeout(() => {
          const cur = window.scrollY;
          if (cur > 0 && cur < spacerH) {
            const target = cur < spacerH / 2 ? 0 : spacerH;
            if (Math.abs(cur - target) > 2) {
              isSnapping = true;
              window.scrollTo({ top: target, behavior: "smooth" });
              setTimeout(() => { isSnapping = false; }, 600);
            }
          }
        }, 120);
      }

      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      clearTimeout(snapTimer);
    };
  }, []);

  const showScrollActive = pastHero && direction === "up" && !atTop;

  return (
    <div className="relative">
      {/* ① HeroIntro — fixed inset-0 풀스크린. spacer 동안 zoom + crossfade
          ⚠ scroll-driven opacity는 transition 없음 (1:1 매핑이라야 부드러움) */}
      <div
        className="fixed inset-0 z-[60]"
        style={{
          opacity: (1 - crossfade).toFixed(3),
          pointerEvents: crossfade >= 0.6 ? "none" : "auto",
          willChange: "opacity",
        }}
        aria-hidden={crossfade >= 0.95}
      >
        <HeroIntro progress={zoomProgress} />
      </div>

      {/* ② Spacer — 사용자 스크롤 영역 (zoom 진행) + scroll-snap-align: start */}
      <div
        aria-hidden
        style={{ height: `${ZOOM_SPACER_VH}vh` }}
        className="pointer-events-none"
      />

      {/* ③ HeroSection — spacer 끝나는 시점에 viewport.top에 도달. zoom 완료와 일치 */}
      <HeroSection />

      {/* ④ ScrollSlides — Hero_Section 아래 풀스크린 페이드 스택 (4 슬라이드) */}
      <ScrollSlides />

      {/* ⑤ Footer */}
      <Footer />

      {/* ⑤ Scroll Up Active Header — 본문 진입 후 ↑ */}
      <HeaderScrollActive
        visible={showScrollActive}
        onMenuClick={() => {
          /* TODO: 모바일 시트 메뉴 */
        }}
      />
    </div>
  );
}
