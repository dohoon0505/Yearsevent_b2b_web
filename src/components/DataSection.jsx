import { useEffect, useRef, useState } from "react";

/**
 * DataSection — Figma 85:50, 100vh sticky 안에 두 항목 동시 표시
 *
 * 인터랙션 phase:
 *   Phase 1 (progress 0 → 0.5):  About Us 슬로건 단어 scrub reveal
 *     - 사용자가 100vh 스크롤 → 슬로건 100% reveal
 *   Phase 2 (progress 0.5 → 1.0): For Business 통계 카드 stagger reveal
 *     - 사용자가 추가 100vh 스크롤 → 카드 3개 순차 등장
 *   progress 1.0 → sticky 해제, 다음 섹션으로 이동
 *
 * 레이아웃 (100vh sticky stage):
 *   ┌────────────────────────────┐
 *   │ About Us                   │
 *   │ 모든 위대한 비즈니스는       │
 *   │ 작은 축하와 깊은 위로에서    │
 *   │ 시작됩니다.                 │
 *   │                            │
 *   │              For Business  │
 *   │     설립일       2016~     │
 *   │     누적 주문    60만+     │
 *   │     전담 기업    200+      │
 *   └────────────────────────────┘
 *
 * Track: 250vh (사용자 150vh 스크롤로 두 phase 진행)
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

const STATS = [
  { label: "설립일", desc: "2016년 설립, 2018년 합병", value: "2016~" },
  { label: "누적 주문", desc: "일 평균 200개 가량의 주문 소화", value: "60만+" },
  { label: "전담 기업", desc: "10년의 경험으로, 노하우로", value: "200+" },
];

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

  // Phase 1 — About Us 슬로건 (progress 0 ~ 0.5)
  const sloganProgress = Math.max(0, Math.min(1, progress / 0.5));
  const sloganLit = Math.max(0, Math.min(1, (sloganProgress - 0.05) / 0.9));
  const litIndex = Math.floor(sloganLit * (TOTAL_WORDS + 1));

  // Phase 2 — For Business 통계 카드 (progress 0.5 ~ 1.0)
  const statsProgress = Math.max(0, Math.min(1, (progress - 0.5) / 0.5));
  const cardReveal = (i) => {
    // 카드 3개를 0.05 패딩 + overlap stagger로 등장
    const cardStart = 0.05 + i * 0.3;
    const cardEnd = cardStart + 0.35;
    const t = (statsProgress - cardStart) / (cardEnd - cardStart);
    return Math.max(0, Math.min(1, t));
  };

  let wordCounter = 0;

  return (
    <section
      ref={sectionRef}
      aria-label="회사 데이터"
      className="relative bg-white"
    >
      {/* sticky track — 250vh / sticky 100vh */}
      <div ref={trackRef} style={{ height: "250vh" }} className="relative">
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          <div className="h-full w-full flex flex-col justify-center gap-[5vh] px-6 md:px-12 lg:px-[120px] xl:px-[260px] py-[8vh]">
            {/* 상단 — About Us + 슬로건 (좌측 정렬) */}
            <div className="flex flex-col gap-[18px] items-start">
              <p
                className="text-[var(--color-brand-red)] font-bold text-[18px] md:text-[22px] tracking-[-0.01em] hero-fade-up"
                style={{
                  opacity: aboutReady ? 1 : 0,
                  transform: aboutReady ? "translateY(0)" : "translateY(20px)",
                }}
              >
                About Us
              </p>

              <h2
                className="font-bold text-[28px] md:text-[40px] lg:text-[46px] xl:text-[52px] leading-[1.22] tracking-[-0.018em] hero-fade-up"
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

            {/* 하단 — For Business 통계 카드 (우측 정렬) */}
            <div className="w-full flex flex-col gap-[18px] items-end">
              <p
                className="text-[var(--color-brand-red)] font-bold text-[16px] md:text-[18px] tracking-[-0.01em] self-end hero-fade-up"
                style={{
                  opacity: statsProgress > 0.02 ? 1 : 0,
                  transform: statsProgress > 0.02 ? "translateY(0)" : "translateY(12px)",
                  transition:
                    "opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              >
                For Business
              </p>

              <div className="w-full flex flex-col gap-[22px] items-end">
                {STATS.map((stat, i) => {
                  const t = cardReveal(i);
                  return (
                    <div
                      key={stat.label}
                      className="w-full max-w-[520px] flex flex-col gap-[18px]"
                      style={{
                        opacity: t,
                        transform: `translateY(${(1 - t) * 30}px)`,
                        transition: "opacity 0.15s linear, transform 0.15s linear",
                      }}
                    >
                      <div className="flex items-center justify-between gap-6">
                        <div className="flex flex-col gap-[6px] min-w-0">
                          <p className="text-[18px] md:text-[22px] font-medium text-black tracking-[-0.012em] leading-[1.3]">
                            {stat.label}
                          </p>
                          <p className="text-[12px] md:text-[14px] font-light text-black tracking-[-0.003em] leading-[1.4]">
                            {stat.desc}
                          </p>
                        </div>
                        <p className="text-[42px] md:text-[54px] lg:text-[64px] font-extrabold tracking-[-0.01em] leading-[1] text-black whitespace-nowrap">
                          {stat.value}
                        </p>
                      </div>
                      <div className="h-[2px] w-full bg-[#222]" />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
