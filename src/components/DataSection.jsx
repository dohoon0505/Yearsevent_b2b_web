import { useEffect, useRef, useState } from "react";

/**
 * DataSection — 100vh sticky 안에 두 개의 scrub reveal 슬로건
 *
 * 레이아웃 (zigzag):
 *   ┌────────────────────────────────────┐
 *   │ About Us •                         │
 *   │ 모든 위대한 비즈니스는              │
 *   │ 작은 축하와 깊은 위로에서           │
 *   │ 시작됩니다.                         │
 *   │                                    │
 *   │                       For Business │
 *   │                  2016년을 시작으로  │
 *   │           200개가 넘는 기업·단체의  │
 *   │            경조사를 전담하고 있어요 │
 *   └────────────────────────────────────┘
 *
 * 인터랙션 phase:
 *   Phase 1 (progress 0 → 0.5): About Us 슬로건 단어 scrub reveal
 *   Phase 2 (progress 0.5 → 1.0): For Business 슬로건 단어 scrub reveal
 *   progress 1.0 → sticky 해제, 다음 섹션
 *
 * Track: 250vh / sticky 100vh
 */

const ABOUT_LINES = [
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
  [
    { text: "시작되는", tone: "dark" },
    { text: "것을", tone: "dark" },
    { text: "아시나요?", tone: "dark" },
  ],
];

const BUSINESS_LINES = [
  [
    { text: "저희는", tone: "dark" },
    { text: "2016년", tone: "accent", noSpace: true },
    { text: "을", tone: "dark" },
    { text: "시작으로", tone: "dark" },
  ],
  [
    { text: "200개", tone: "accent", noSpace: true },
    { text: "가", tone: "dark" },
    { text: "넘는", tone: "dark" },
    { text: "기업·단체의", tone: "dark" },
  ],
  [
    { text: "축하", tone: "accent", noSpace: true },
    { text: "와", tone: "dark" },
    { text: "위로", tone: "accent", noSpace: true },
    { text: "를", tone: "dark" },
    { text: "함께하고", tone: "dark" },
    { text: "있어요", tone: "dark", noSpace: true },
    { text: ":)", tone: "dark" },
  ],
];

const TOTAL_ABOUT = ABOUT_LINES.reduce((acc, l) => acc + l.length, 0);
const TOTAL_BUSINESS = BUSINESS_LINES.reduce((acc, l) => acc + l.length, 0);

const DIM = "#d4d8e2";
const DARK = "#222222";
const ACCENT = "var(--color-brand-red)";

/** 라벨 컴포넌트 — 텍스트 + 작은 dot */
function SectionLabel({ text, align = "left", style }) {
  return (
    <p
      className="text-[var(--color-brand-red)] font-bold text-[18px] md:text-[22px] tracking-[-0.01em] inline-flex items-center gap-[8px] hero-fade-up"
      style={style}
    >
      <span>{text}</span>
      <span
        aria-hidden
        className="inline-block w-[7px] h-[7px] rounded-full bg-[var(--color-brand-red)]"
      />
    </p>
  );
}

/** 슬로건 단어 스크럽 렌더러 */
function Slogan({ lines, litIndex, align = "left", style }) {
  let wordCounter = 0;
  return (
    <h2
      className={`font-bold text-[36px] md:text-[46px] lg:text-[52px] xl:text-[58px] leading-[1.25] tracking-[-0.018em] hero-fade-up ${
        align === "right" ? "text-right" : "text-left"
      }`}
      style={style}
    >
      {lines.map((line, lineIdx) => (
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
  );
}

export default function DataSection() {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setReady(true);
          obs.disconnect();
        }
      },
      { threshold: 0.05 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

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

  // Phase 1: About Us (progress 0 → 0.5)
  const aboutProgress = Math.max(0, Math.min(1, progress / 0.5));
  const aboutLit = Math.max(0, Math.min(1, (aboutProgress - 0.05) / 0.9));
  const aboutLitIdx = Math.floor(aboutLit * (TOTAL_ABOUT + 1));

  // Phase 2: For Business (progress 0.5 → 1.0)
  const businessProgress = Math.max(0, Math.min(1, (progress - 0.5) / 0.5));
  const businessLit = Math.max(0, Math.min(1, (businessProgress - 0.05) / 0.9));
  const businessLitIdx = Math.floor(businessLit * (TOTAL_BUSINESS + 1));

  // About Us 100% 완료 전까지 For Business 영역 숨김
  const businessReady = ready && progress >= 0.5;

  return (
    <section
      ref={sectionRef}
      aria-label="회사 데이터"
      className="relative bg-white"
    >
      {/* sticky track — 250vh / sticky 100vh */}
      <div ref={trackRef} style={{ height: "250vh" }} className="relative">
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          <div className="h-full w-full flex flex-col justify-between px-6 md:px-12 lg:px-[120px] xl:px-[260px] py-[100px] md:py-[120px]">
            {/* 상단 좌측 — About Us */}
            <div className="flex flex-col gap-[24px] items-start">
              <SectionLabel
                text="About Us"
                style={{
                  opacity: ready ? 1 : 0,
                  transform: ready ? "translateY(0)" : "translateY(20px)",
                }}
              />
              <Slogan
                lines={ABOUT_LINES}
                litIndex={aboutLitIdx}
                align="left"
                style={{
                  opacity: ready ? 1 : 0,
                  transform: ready ? "translateY(0)" : "translateY(28px)",
                  transitionDelay: "0.14s",
                }}
              />
            </div>

            {/* 하단 우측 — For Business (About Us 100% 완료 후 등장) */}
            <div className="flex flex-col gap-[24px] items-end">
              <SectionLabel
                text="For Business"
                style={{
                  opacity: businessReady ? 1 : 0,
                  transform: businessReady
                    ? "translateY(0)"
                    : "translateY(20px)",
                }}
              />
              <Slogan
                lines={BUSINESS_LINES}
                litIndex={businessLitIdx}
                align="right"
                style={{
                  opacity: businessReady ? 1 : 0,
                  transform: businessReady
                    ? "translateY(0)"
                    : "translateY(28px)",
                  transitionDelay: "0.14s",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
