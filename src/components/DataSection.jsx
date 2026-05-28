import { useEffect, useRef, useState } from "react";

/**
 * DataSection — Figma 85:50, sticky scrub reveal (슬로건 단일 phase)
 *
 * 통계 카드 영역은 모두 제거됨. About Us + 슬로건만 표시.
 *
 * 인터랙션:
 *   - sticky track 200vh + sticky stage 100vh
 *   - 사용자가 100vh 스크롤하는 동안 슬로건 단어가 dim → on 색상으로 reveal
 *   - 5% 패딩 후 90% 구간에서 단어 인덱스 매핑
 *   - 100% 도달 → sticky 해제 → 다음 섹션 이동
 */

const SLOGAN_LINES = [
  [
    { text: "모든", tone: "dark" },
    { text: "위대한", tone: "dark" },
    { text: "비즈니스는", tone: "dark" },
  ],
  [
    { text: "작은", tone: "accent" },
    { text: "축하", tone: "accent", noSpace: true },
    { text: "와", tone: "dark" },
    { text: "깊은", tone: "accent" },
    { text: "위로", tone: "accent" },
    { text: "에서", tone: "dark" },
  ],
  [{ text: "시작됩니다.", tone: "dark" }],
];

const TOTAL_WORDS = SLOGAN_LINES.reduce((acc, line) => acc + line.length, 0);

const DIM = "#d4d8e2";
const DARK = "#222222";
const ACCENT = "var(--color-brand-red)";

export default function DataSection() {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [aboutReady, setAboutReady] = useState(false);

  // 진입 시퀀스 (About Us + 슬로건 fade-up)
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAboutReady(true);
          obs.disconnect();
        }
      },
      { threshold: 0.05 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // sticky track 기반 progress (0~1)
  useEffect(() => {
    let ticking = false;
    const update = () => {
      const node = trackRef.current;
      if (!node) {
        ticking = false;
        return;
      }
      const rect = node.getBoundingClientRect();
      const vh = window.innerHeight;
      const max = Math.max(1, rect.height - vh);
      const raw = -rect.top / max;
      setProgress(Math.max(0, Math.min(1, raw)));
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
    };
  }, []);

  // 단어 인덱스 매핑 — 5% 패딩 후 90% 구간에서 reveal
  const lit = Math.max(0, Math.min(1, (progress - 0.05) / 0.9));
  const litIndex = Math.floor(lit * (TOTAL_WORDS + 1));

  let wordCounter = 0;

  return (
    <section
      ref={sectionRef}
      aria-label="회사 데이터"
      className="relative bg-white"
    >
      {/* sticky track — 200vh / sticky 100vh */}
      <div ref={trackRef} style={{ height: "200vh" }} className="relative">
        <div className="sticky top-0 h-screen w-full flex flex-col items-start justify-center px-6 md:px-12 lg:px-[120px] xl:px-[260px]">
          <div className="flex flex-col gap-[30px] items-start">
            <p
              className="text-[var(--color-brand-red)] font-bold text-[20px] md:text-[24px] tracking-[-0.01em] hero-fade-up"
              style={{
                opacity: aboutReady ? 1 : 0,
                transform: aboutReady ? "translateY(0)" : "translateY(20px)",
              }}
            >
              About Us
            </p>

            <h2
              className="font-bold text-[36px] md:text-[48px] lg:text-[56px] xl:text-[60px] leading-[1.28] tracking-[-0.018em] hero-fade-up"
              style={{
                opacity: aboutReady ? 1 : 0,
                transform: aboutReady ? "translateY(0)" : "translateY(28px)",
                transitionDelay: "0.14s",
              }}
            >
              {SLOGAN_LINES.map((line, lineIdx) => (
                <span key={lineIdx} className="block">
                  {line.map((w, i) => {
                    const idx = wordCounter++;
                    const isLit = idx < litIndex;
                    const onColor = w.tone === "accent" ? ACCENT : DARK;
                    return (
                      <span
                        key={i}
                        className="inline-block whitespace-pre transition-colors duration-300 ease-out"
                        style={{ color: isLit ? onColor : DIM }}
                      >
                        {w.text}
                        {i < line.length - 1 && !w.noSpace ? " " : ""}
                      </span>
                    );
                  })}
                </span>
              ))}
            </h2>
          </div>
        </div>
      </div>
    </section>
  );
}
