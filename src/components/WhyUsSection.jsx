import { useEffect, useRef, useState } from "react";

/**
 * WhyUsSection — Hero와 도입사례(ScrollSlides) 사이 핵심 가치 섹션
 *
 * 구성 (총 200vh):
 *   A) 100vh — 슬로건 + 4개 강점 카드 (white)
 *   B) 100vh — 주요 지표 4개 (neutral-10)
 *
 * 진입 시 IntersectionObserver로 fade-up reveal.
 */

const STRENGTHS = [
  {
    eyebrow: "01",
    title: "8년 운영 노하우",
    desc: "법인·단체 경조사 화환을 전담 운영해 온 메이플라워의 검증된 시스템.",
  },
  {
    eyebrow: "02",
    title: "35% 단가 절감",
    desc: "도매가 직거래와 자체 물류 네트워크로 시장 평균 대비 35% 저렴.",
  },
  {
    eyebrow: "03",
    title: "전국 무료배송",
    desc: "전국 협력 화원 네트워크로 주문 후 평균 30분 내 현장 도착.",
  },
  {
    eyebrow: "04",
    title: "월정산 · 책임배상",
    desc: "세금계산서 일괄 발급, 건당 50만원 책임 배상 제도로 안심.",
  },
];

const METRICS = [
  { num: "8년+", label: "법인 전담 운영" },
  { num: "9,500+", label: "법인 고객사" },
  { num: "100,000+", label: "누적 주문 건수" },
  { num: "30분", label: "평균 현장 도착" },
];

function useInView(threshold = 0.18) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

export default function WhyUsSection() {
  const [refA, inViewA] = useInView(0.2);
  const [refB, inViewB] = useInView(0.25);

  return (
    <section
      aria-label="핵심 가치"
      className="relative bg-white text-[#222]"
    >
      {/* A — 슬로건 + 강점 카드 */}
      <div
        ref={refA}
        className="min-h-screen flex flex-col justify-center px-6 md:px-12 lg:px-[260px] py-[140px]"
      >
        <div className="max-w-[1200px] mx-auto w-full">
          <p
            className="typo-eyebrow text-[var(--color-brand-red)] hero-fade-up"
            style={{
              opacity: inViewA ? 1 : 0,
              transform: inViewA ? "translateY(0)" : "translateY(20px)",
            }}
          >
            WHY OLHAE
          </p>
          <h2
            className="typo-display mt-5 max-w-[860px] hero-fade-up"
            style={{
              opacity: inViewA ? 1 : 0,
              transform: inViewA ? "translateY(0)" : "translateY(24px)",
              transitionDelay: "0.12s",
            }}
          >
            법인 경조사 관리,
            <br />
            <span className="text-[var(--color-brand-red)]">
              더 이상 담당자의 부담이 아닙니다.
            </span>
          </h2>
          <p
            className="typo-body-hero mt-7 max-w-[640px] text-[var(--color-neutral-70)] hero-fade-up"
            style={{
              opacity: inViewA ? 1 : 0,
              transform: inViewA ? "translateY(0)" : "translateY(24px)",
              transitionDelay: "0.24s",
            }}
          >
            8년 동안 직접 운영해 온 메이플라워의 시스템 그대로 — 발주, 배송,
            정산, 사후 관리를 전담 매니저가 한 번에 책임집니다.
          </p>

          <ul className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-12">
            {STRENGTHS.map((s, i) => (
              <li
                key={s.eyebrow}
                className="border-t-2 border-[var(--color-brand-red)] pt-6 hero-fade-up"
                style={{
                  opacity: inViewA ? 1 : 0,
                  transform: inViewA ? "translateY(0)" : "translateY(28px)",
                  transitionDelay: `${0.36 + i * 0.1}s`,
                }}
              >
                <p className="typo-caption text-[var(--color-brand-red)]">
                  {s.eyebrow}
                </p>
                <h3 className="mt-4 text-[22px] md:text-[24px] font-bold tracking-[-0.015em] leading-[1.25]">
                  {s.title}
                </h3>
                <p className="typo-body-slide mt-3 text-[var(--color-neutral-70)]">
                  {s.desc}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* B — 주요 지표 */}
      <div
        ref={refB}
        className="min-h-screen flex flex-col justify-center px-6 md:px-12 lg:px-[260px] py-[140px] bg-[var(--color-neutral-10)] border-t border-[var(--color-neutral-20)]"
      >
        <div className="max-w-[1200px] mx-auto w-full">
          <p
            className="typo-eyebrow text-[var(--color-neutral-60)] hero-fade-up"
            style={{
              opacity: inViewB ? 1 : 0,
              transform: inViewB ? "translateY(0)" : "translateY(20px)",
            }}
          >
            BY THE NUMBERS
          </p>
          <h2
            className="typo-display mt-5 max-w-[860px] hero-fade-up"
            style={{
              opacity: inViewB ? 1 : 0,
              transform: inViewB ? "translateY(0)" : "translateY(24px)",
              transitionDelay: "0.12s",
            }}
          >
            숫자로 증명하는
            <br />
            <span className="text-[var(--color-brand-red)]">
              8년의 신뢰
            </span>
          </h2>

          <ul className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-14">
            {METRICS.map((m, i) => (
              <li
                key={i}
                className="border-l-2 border-[var(--color-brand-red)] pl-6 hero-fade-up"
                style={{
                  opacity: inViewB ? 1 : 0,
                  transform: inViewB ? "translateY(0)" : "translateY(28px)",
                  transitionDelay: `${0.28 + i * 0.1}s`,
                }}
              >
                <p className="text-[48px] md:text-[68px] font-extrabold tracking-[-0.015em] leading-[1.05] text-[#222]">
                  {m.num}
                </p>
                <p className="typo-label mt-4 text-[var(--color-neutral-70)]">
                  {m.label}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
