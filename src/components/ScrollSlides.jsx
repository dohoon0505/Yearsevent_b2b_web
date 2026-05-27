import { useEffect, useRef, useState } from "react";
import cityBg from "../assets/hero-city-bg.png";

/**
 * ScrollSlides — Framer Scroll Slides 페이드 스택 패턴
 *
 * 참고: scroll-text-reveal 카탈로그 §00 + Full-screen Scroll · 01 페이드 스택
 *   - track 높이 = N × 100vh
 *   - sticky stage 100vh (top:0)
 *   - 4개 슬라이드 absolute inset-0 stacking, opacity 0/1 (transition 600ms ease-in-out)
 *   - scroll progress 0~1 → activeIndex = floor(p × N)
 *   - 하단 progress bar 4종, 활성 슬라이드만 fill 진행
 *
 * 100vh scroll-snap 처리:
 *   - sticky stage 자체에 snap-section
 *   - 추가 100vh anchor 3개 (1st ~ 3rd) — 한 번 휠 = 1 슬라이드 전환
 *
 * 콘텐츠: 올해의경조사 핵심 가치 4종 — 신뢰 / 직거래 / WEB 3.0 / 확장
 */

const SLIDES = [
  {
    eyebrow: "01 · Trust",
    title: "8년의 직거래로 다져진 신뢰",
    desc:
      "2016년 대구 20평 꽃집에서 시작해, 100만건 이상의 경조사를 직접 운영했습니다. 한 건 한 건이 다음 신뢰의 토대입니다.",
    tone: "from-[rgba(35,31,32,0.65)] to-[rgba(35,31,32,0.92)]",
  },
  {
    eyebrow: "02 · Direct Trade",
    title: "중간마진 없는 단가, 35% 절감",
    desc:
      "꽃배달 대행사 80%가 거치는 4단계 중간 유통을 제거합니다. 자사 직거래 구조이기에 35% 단가 절감과 전국 무료배송이 가능합니다.",
    tone: "from-[rgba(203,13,53,0.55)] to-[rgba(35,31,32,0.95)]",
  },
  {
    eyebrow: "03 · WEB 3.0",
    title: "발주는 1분, 정산은 자동",
    desc:
      "AI 비서가 청첩장·부고장 텍스트를 읽어 발주를 완성합니다. 매월 5일 거래명세서·세금계산서가 자동 발급되어 회계 처리 시간을 1분으로 압축합니다.",
    tone: "from-[rgba(239,105,93,0.45)] to-[rgba(35,31,32,0.95)]",
  },
  {
    eyebrow: "04 · Scale",
    title: "1,000+ 협력기업, 누적 157만건",
    desc:
      "법무·세무법인부터 제조·도소매·유통 기업까지 1,000+ 협력기업이 정기 제휴 중. 누적 거래 1,570,000+ 의 운영 데이터가 매일의 안정성을 보장합니다.",
    tone: "from-[rgba(35,31,32,0.85)] to-[rgba(11,13,18,0.96)]",
  },
];

export default function ScrollSlides() {
  const trackRef = useRef(null);
  const [progress, setProgress] = useState(0);

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

  const N = SLIDES.length;
  const activeIndex = Math.min(Math.floor(progress * N), N - 1);

  return (
    <section
      ref={trackRef}
      aria-label="브랜드 핵심 가치 슬라이드"
      className="relative"
      style={{ height: `${N * 100}vh` }}
    >
      {/* sticky stage — snap-section: Hero_Section에서 휠 1번 = 첫 슬라이드 등장 */}
      <div
        className="snap-section sticky top-0 h-screen w-full overflow-hidden bg-black"
        style={{ contain: "paint" }}
      >
        {/* 배경 사진 — 모든 슬라이드 공통, 슬라이드별로 다른 그라데이션 오버레이로 차별화 */}
        <img
          src={cityBg}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover select-none"
          draggable="false"
        />

        {/* 슬라이드별 그라데이션 오버레이 stack */}
        {SLIDES.map((slide, i) => (
          <div
            key={i}
            aria-hidden
            className={`absolute inset-0 bg-gradient-to-b ${slide.tone}`}
            style={{
              opacity: i === activeIndex ? 1 : 0,
              transition: "opacity 600ms ease-in-out",
              willChange: "opacity",
            }}
          />
        ))}

        {/* 슬라이드별 캡션 stack — 카탈로그 §01 fs-caps 패턴
            bottom 160px (progress bar 위쪽) */}
        <div className="absolute inset-x-0 bottom-[160px] md:bottom-[180px] z-10">
          <div className="relative">
            {SLIDES.map((slide, i) => (
              <article
                key={i}
                className="absolute left-0 right-0 bottom-0 px-6 md:px-12 lg:px-[120px] xl:px-[300px]"
                style={{
                  opacity: i === activeIndex ? 1 : 0,
                  transform:
                    i === activeIndex ? "translateY(0)" : "translateY(16px)",
                  transition:
                    "opacity 500ms ease-out, transform 500ms cubic-bezier(0.2,0,0,1)",
                  willChange: "opacity, transform",
                  pointerEvents: i === activeIndex ? "auto" : "none",
                }}
                aria-hidden={i !== activeIndex}
              >
                <p className="text-[12px] md:text-[13px] font-semibold uppercase tracking-[0.16em] text-white/75">
                  {slide.eyebrow}
                </p>
                <h2 className="mt-5 max-w-3xl text-[clamp(28px,4vw,56px)] font-medium leading-[1.12] tracking-[-0.022em] text-white">
                  {slide.title}
                </h2>
                <p className="mt-6 max-w-xl text-[14px] md:text-[16px] leading-[1.65] font-light text-white/85">
                  {slide.desc}
                </p>
              </article>
            ))}
          </div>
        </div>

        {/* 하단 progress bars — 카탈로그 §01 fs-bars 패턴 */}
        <div className="absolute bottom-12 left-0 right-0 z-20 px-6 md:px-12 lg:px-[120px] xl:px-[300px]">
          <div className="flex gap-6 md:gap-10">
            {SLIDES.map((slide, i) => {
              const start = i / N;
              const end = (i + 1) / N;
              const local =
                progress < start
                  ? 0
                  : progress > end
                    ? 1
                    : (progress - start) / (end - start);
              const isActive = i === activeIndex;
              const isPast = i < activeIndex;
              const labelTone =
                isActive || isPast ? "text-white" : "text-white/50";

              const num = String(i + 1).padStart(2, "0");

              return (
                <div
                  key={i}
                  className="flex flex-1 flex-col gap-3"
                  data-i={i}
                >
                  <div
                    className={`flex items-baseline gap-2 text-[12px] md:text-[14px] font-medium tracking-[0.01em] transition-colors duration-300 ${labelTone}`}
                  >
                    <span className="opacity-80 tabular">{num}</span>
                    <span className="truncate">{slide.eyebrow.split(" · ")[1]}</span>
                  </div>
                  <div className="h-px bg-white/25 overflow-hidden">
                    <div
                      className="h-full bg-white origin-left"
                      style={{
                        transform: `scaleX(${local.toFixed(3)})`,
                        willChange: "transform",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 추가 anchor 3개 — 100vh × 3 = 300vh. sticky 시작점(0) + 3 anchor = 4 snap 위치 */}
      <div className="snap-section" style={{ height: "100vh" }} aria-hidden />
      <div className="snap-section" style={{ height: "100vh" }} aria-hidden />
      <div className="snap-section" style={{ height: "100vh" }} aria-hidden />
    </section>
  );
}
