import { useEffect, useRef, useState } from "react";

/**
 * DataSection — Hero 바로 아래 회사 데이터 섹션
 *
 * 참고: scroll-text-reveal scrub-color 패턴 (Framer Marketplace Text Reveal)
 *
 * 구조 (총 240vh):
 *   - track 240vh / sticky stage 100vh
 *   - 사용자가 140vh 스크롤 동안 단어가 dim → on 색상으로 채워짐
 *   - progress 1.0 도달 시 sticky 해제 → 다음 섹션으로 자연스럽게 이어짐
 *
 * 시퀀스:
 *   1) IntersectionObserver로 viewport 진입 감지
 *   2) About Us label fade-up → 헤딩 → 통계 카드 stagger (초기 1회)
 *   3) 사용자 스크롤 → scrub color reveal (단어별 색상 토글)
 *
 * 강조 단어:
 *   "작은 축하와 깊은 위로" → brand-peach 색상
 *   그 외 → dark (#222)
 */

const SLOGAN_LINES = [
  [
    { text: "모든", tone: "dark" },
    { text: "위대한", tone: "dark" },
    { text: "비즈니스는", tone: "dark" },
  ],
  [
    { text: "작은", tone: "accent" },
    { text: "축하와", tone: "accent" },
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
  const trackRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [inView, setInView] = useState(false);

  // IntersectionObserver — 섹션 진입 시퀀스 트리거
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // 스크롤 진행률 추적 (scrub) — track 기준 0~1
  useEffect(() => {
    let ticking = false;
    const update = () => {
      const node = trackRef.current;
      if (!node) {
        ticking = false;
        return;
      }
      const rect = node.getBoundingClientRect();
      const max = Math.max(1, rect.height - window.innerHeight);
      const raw = Math.max(0, Math.min(1, -rect.top / max));
      setProgress(raw);
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

  // 단어 인덱스 매핑 — Framer Text Reveal 동일 (앞 5% 패딩 + 뒤 10% 여유)
  const lit = Math.max(0, Math.min(1, (progress - 0.05) / 0.85));
  const litIndex = Math.floor(lit * (TOTAL_WORDS + 1));

  let wordCounter = 0;

  return (
    <section
      ref={trackRef}
      aria-label="회사 데이터"
      className="relative bg-white"
      style={{ height: "240vh" }}
    >
      <div className="sticky top-0 h-screen w-full flex items-center px-6 md:px-12 lg:px-[120px] xl:px-[260px] py-[80px]">
        <div className="w-full grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-14 lg:gap-20 items-end">
          {/* 좌측 — About Us label + 슬로건 (scrub color) */}
          <div>
            <p
              className="typo-eyebrow text-[var(--color-brand-red)] hero-fade-up"
              style={{
                opacity: inView ? 1 : 0,
                transform: inView ? "translateY(0)" : "translateY(20px)",
              }}
            >
              About Us
            </p>

            <h2
              className="mt-8 font-bold text-[34px] md:text-[44px] lg:text-[54px] leading-[1.28] tracking-[-0.018em] hero-fade-up"
              style={{
                opacity: inView ? 1 : 0,
                transform: inView ? "translateY(0)" : "translateY(24px)",
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
                        className="inline-block transition-colors duration-200 ease-out"
                        style={{ color: isLit ? onColor : DIM }}
                      >
                        {w.text}
                        {i < line.length - 1 ? " " : ""}
                      </span>
                    );
                  })}
                </span>
              ))}
            </h2>
          </div>

          {/* 우측 — 3개 통계 카드 */}
          <ul className="flex flex-col gap-2">
            {STATS.map((stat, i) => (
              <li
                key={stat.label}
                className="hero-fade-up"
                style={{
                  opacity: inView ? 1 : 0,
                  transform: inView ? "translateY(0)" : "translateY(28px)",
                  transitionDelay: `${0.34 + i * 0.12}s`,
                }}
              >
                <div className="flex items-end justify-between gap-6 pt-6 pb-7 border-b border-[#222]">
                  <div className="min-w-0">
                    <p className="text-[17px] md:text-[19px] font-bold tracking-[-0.012em] text-[#222]">
                      {stat.label}
                    </p>
                    <p className="mt-2 text-[12px] md:text-[13px] text-[var(--color-neutral-60)] leading-[1.45]">
                      {stat.desc}
                    </p>
                  </div>
                  <p className="shrink-0 text-[44px] md:text-[58px] lg:text-[72px] font-extrabold tracking-[-0.025em] leading-[1] text-[#222]">
                    {stat.value}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
