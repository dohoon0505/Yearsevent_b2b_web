import { useEffect, useRef, useState } from "react";

/**
 * DataSection — Figma 85:50 + sticky pin scrub reveal
 *
 * 인터랙션 흐름:
 *   1) 진입 시 About Us + 슬로건 fade-up
 *   2) 슬로건 sticky pin (track 200vh, stage 100vh)
 *      사용자가 100vh 스크롤하는 동안 progress 0→1
 *      텍스트 100% 채워지기 전까지 화면 스크롤 X (sticky 잠금)
 *   3) progress 1.0 도달 → sticky 해제 → 사용자가 더 스크롤 시 통계 카드 영역 등장
 *   4) 통계 카드 viewport 진입 → IntersectionObserver 트리거 → 0.22s stagger
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
  {
    label: "설립일",
    desc: "2016년 설립, 2018년 합병",
    value: "2016~",
  },
  {
    label: "누적 주문",
    desc: "일 평균 200개 가량의 주문 소화",
    value: "60만+",
  },
  {
    label: "전담 기업",
    desc: "10년의 경험으로, 노하우로",
    value: "200+",
  },
];

const DIM = "#d4d8e2";
const DARK = "#222222";
const ACCENT = "#ef695d";

export default function DataSection() {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const statsRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [aboutReady, setAboutReady] = useState(false);
  const [statsReady, setStatsReady] = useState(false);

  // About Us + 슬로건 등장 시퀀스 (section 진입)
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

  // 통계 카드 viewport 진입 시 stagger 등장
  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsReady(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // sticky track 기반 progress (track 안에서 0~1)
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

  // 단어 인덱스 — 처음 5% 패딩 + 90% 구간에서 reveal
  const lit = Math.max(0, Math.min(1, (progress - 0.05) / 0.9));
  const litIndex = Math.floor(lit * (TOTAL_WORDS + 1));

  let wordCounter = 0;

  return (
    <section
      ref={sectionRef}
      aria-label="회사 데이터"
      className="relative bg-white"
    >
      {/* 슬로건 sticky 트랙 — track 200vh / sticky stage 100vh */}
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
                        className="inline-block transition-colors duration-300 ease-out"
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

      {/* 통계 카드 — sticky 해제 후 자연 등장 (viewport 진입 시 stagger) */}
      <div
        ref={statsRef}
        className="w-full flex flex-col gap-[50px] items-end px-6 md:px-12 lg:px-[120px] xl:px-[260px] pb-[150px]"
      >
        {STATS.map((stat, i) => (
          <div
            key={stat.label}
            className="w-full max-w-[560px] flex flex-col gap-[45px]"
            style={{
              opacity: statsReady ? 1 : 0,
              transform: statsReady ? "translateY(0)" : "translateY(40px)",
              transition:
                "opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1), transform 0.9s cubic-bezier(0.16, 1, 0.3, 1)",
              transitionDelay: statsReady ? `${i * 0.22}s` : "0s",
            }}
          >
            <div className="flex items-center justify-between gap-6">
              <div className="flex flex-col gap-[10px] min-w-0">
                <p className="text-[22px] md:text-[26px] font-medium text-black tracking-[-0.012em] leading-[1.4]">
                  {stat.label}
                </p>
                <p className="text-[14px] md:text-[17px] font-light text-black tracking-[-0.003em] leading-[1.4]">
                  {stat.desc}
                </p>
              </div>
              <p className="text-[56px] md:text-[68px] lg:text-[80px] font-extrabold tracking-[-0.01em] leading-[1] text-black whitespace-nowrap">
                {stat.value}
              </p>
            </div>
            <div className="h-[3px] w-full bg-[#222]" />
          </div>
        ))}
      </div>
    </section>
  );
}
