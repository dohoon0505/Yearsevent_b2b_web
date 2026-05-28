import { useEffect, useRef, useState } from "react";

/**
 * DataSection — Figma 85:50 100% 재현
 *
 * 레이아웃 (height 자연 흐름, 100vh sticky 미사용):
 *   - 부모 flex-col gap-40 items-start, px-260 py-200
 *   - 위: About Us + 슬로건 (좌측 정렬, items-start)
 *   - 아래: 통계 3카드 묶음 (우측 정렬, items-end, gap-50)
 *
 * 스크럽 컬러 (sticky 없는 자연 스크롤 버전):
 *   - 슬로건 ref가 viewport 80%~20% 구간을 통과하는 동안 progress 0→1
 *   - 단어 인덱스 매핑으로 dim → on 색상 토글
 *
 * 진입 시퀀스:
 *   IntersectionObserver → About Us → 슬로건 → 통계 카드 stagger
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
  const sectionRef = useRef(null);
  const sloganRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [inView, setInView] = useState(false);

  // IntersectionObserver — 섹션 진입 시퀀스 트리거
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // 자연 스크롤 진행률 — 슬로건이 viewport 80%~20% 구간을 통과하는 동안 0→1
  useEffect(() => {
    let ticking = false;
    const update = () => {
      const node = sloganRef.current;
      if (!node) {
        ticking = false;
        return;
      }
      const rect = node.getBoundingClientRect();
      const vh = window.innerHeight;
      const start = vh * 0.8;
      const end = vh * 0.2;
      const raw = (start - rect.top) / (start - end);
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

  // 단어 인덱스 매핑 (Framer Text Reveal 스펙)
  const lit = Math.max(0, Math.min(1, (progress - 0.05) / 0.85));
  const litIndex = Math.floor(lit * (TOTAL_WORDS + 1));

  let wordCounter = 0;

  return (
    <section
      ref={sectionRef}
      aria-label="회사 데이터"
      className="relative bg-white"
    >
      <div className="flex flex-col gap-[40px] items-start px-6 md:px-12 lg:px-[120px] xl:px-[260px] py-[120px] md:py-[160px] xl:py-[200px]">
        {/* 좌측 — About Us 라벨 + 슬로건 (items-start) */}
        <div className="flex flex-col gap-[30px] items-start">
          <p
            className="text-[var(--color-brand-red)] font-bold text-[20px] md:text-[24px] tracking-[-0.01em] hero-fade-up"
            style={{
              opacity: inView ? 1 : 0,
              transform: inView ? "translateY(0)" : "translateY(20px)",
            }}
          >
            About Us
          </p>

          <h2
            ref={sloganRef}
            className="font-bold text-[36px] md:text-[48px] lg:text-[56px] xl:text-[60px] leading-[1.28] tracking-[-0.018em] hero-fade-up"
            style={{
              opacity: inView ? 1 : 0,
              transform: inView ? "translateY(0)" : "translateY(28px)",
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

        {/* 우측 — 통계 카드 묶음 (w-full + items-end) */}
        <div className="w-full flex flex-col gap-[50px] items-end">
          {STATS.map((stat, i) => (
            <div
              key={stat.label}
              className="w-full max-w-[560px] flex flex-col gap-[20px] hero-fade-up"
              style={{
                opacity: inView ? 1 : 0,
                transform: inView ? "translateY(0)" : "translateY(28px)",
                transitionDelay: `${0.34 + i * 0.14}s`,
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
      </div>
    </section>
  );
}
