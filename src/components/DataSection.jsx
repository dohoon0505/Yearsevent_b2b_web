import { useEffect, useRef, useState } from "react";

/**
 * DataSection — 두 개의 독립된 100vh scrub reveal 슬로건 섹션
 *
 * 구조 (각각 별도 <section>):
 *   ┌─ About Us (200vh track / sticky 100vh) ── 좌측 정렬
 *   │   모든 위대한 비즈니스는 …          ← 스크롤하며 단어 scrub reveal
 *   └─ For Business (200vh track / sticky 100vh) ── 우측 정렬
 *       저희는 2016년을 시작으로 …       ← 스크롤하며 단어 scrub reveal
 *
 * 각 섹션:
 *   - 자기만의 sticky 100vh 프레임 (시각적으로 한 화면을 가득 채움)
 *   - 자기만의 트랙(200vh) 위에서 progress 0 → 1 동안 슬로건 단어가 순차 reveal
 *   - 진입 시 IntersectionObserver 로 label·슬로건 fade-up
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
function SectionLabel({ text, style }) {
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

/**
 * ScrubSloganSection — 100vh sticky 프레임 1개 + 스크럽 단어 reveal
 *
 * 자기만의 트랙(trackVh) 위에서 progress 0 → 1 을 계산하고,
 * progress 0.05 → 0.95 구간 동안 슬로건 단어를 순차적으로 lit 시킨다.
 */
function ScrubSloganSection({
  ariaLabel,
  label,
  lines,
  total,
  align = "left",
  trackVh = 200,
}) {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);

  // 진입 시 label·슬로건 fade-up
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

  // 트랙 위치 → progress
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

  const lit = Math.max(0, Math.min(1, (progress - 0.05) / 0.9));
  const litIdx = Math.floor(lit * (total + 1));

  const itemsAlign = align === "right" ? "items-end" : "items-start";

  return (
    <section ref={sectionRef} aria-label={ariaLabel} className="relative bg-white">
      {/* sticky track — trackVh / sticky 100vh */}
      <div ref={trackRef} style={{ height: `${trackVh}vh` }} className="relative">
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          <div
            className={`h-full w-full flex flex-col justify-center gap-[24px] px-6 md:px-12 lg:px-[120px] xl:px-[260px] py-[100px] md:py-[120px] ${itemsAlign}`}
          >
            <SectionLabel
              text={label}
              style={{
                opacity: ready ? 1 : 0,
                transform: ready ? "translateY(0)" : "translateY(20px)",
              }}
            />
            <Slogan
              lines={lines}
              litIndex={litIdx}
              align={align}
              style={{
                opacity: ready ? 1 : 0,
                transform: ready ? "translateY(0)" : "translateY(28px)",
                transitionDelay: "0.14s",
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default function DataSection() {
  return (
    <>
      <ScrubSloganSection
        ariaLabel="회사 소개"
        label="About Us"
        lines={ABOUT_LINES}
        total={TOTAL_ABOUT}
        align="left"
      />
      <ScrubSloganSection
        ariaLabel="비즈니스 소개"
        label="For Business"
        lines={BUSINESS_LINES}
        total={TOTAL_BUSINESS}
        align="right"
      />
    </>
  );
}
