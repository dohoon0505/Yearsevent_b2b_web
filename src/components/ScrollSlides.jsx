import { useEffect, useRef, useState } from "react";
import slideEvent from "../assets/slide-event.png";
import slideCommunity from "../assets/slide-community.png";
import slideLegal from "../assets/slide-legal.png";
import slideCorporate from "../assets/slide-corporate.png";
import slideIndustry from "../assets/slide-industry.png";

const SLIDES = [
  {
    eyebrow: "01",
    label: "법무법인 · 세무법인",
    title: "격식 있는 자리, 빈틈없는 관리",
    desc: "고객사·동료·재판부 경조사까지, 법무·세무법인 특유의 촘촘한 경조사 관계를 전담 매니저가 체계적으로 관리합니다.",
    bg: slideLegal,
    tone: "from-[rgba(35,31,32,0.50)] to-[rgba(35,31,32,0.90)]",
  },
  {
    eyebrow: "02",
    label: "제조업 · 도소매업",
    title: "현장 곁에서 함께하는 파트너",
    desc: "전국 공장·물류센터·매장에 신속 배송합니다. 35% 단가 절감과 월 정산 시스템으로 비용 관리까지 한 번에 해결합니다.",
    bg: slideIndustry,
    tone: "from-[rgba(35,31,32,0.55)] to-[rgba(11,13,18,0.92)]",
  },
  {
    eyebrow: "03",
    label: "임직원 경조사",
    title: "직원 복지의 시작, 경조사 관리",
    desc: "총무·HR 담당자의 경조사 업무 부담을 덜어드립니다. 부서별 자동 발주, 월 정산, 세금계산서 일괄 발급으로 관리 효율을 극대화합니다.",
    bg: slideCorporate,
    tone: "from-[rgba(203,13,53,0.25)] to-[rgba(35,31,32,0.88)]",
  },
  {
    eyebrow: "04",
    label: "모임 · 단체",
    title: "소속감을 꽃으로 전합니다",
    desc: "동문회·향우회·종교단체 등 다양한 모임의 경조사를 한 곳에서 관리합니다. 회원 명부 연동으로 발주 누락 없이 정확하게.",
    bg: slideCommunity,
    tone: "from-[rgba(35,31,32,0.55)] to-[rgba(35,31,32,0.92)]",
  },
  {
    eyebrow: "05",
    label: "행사현장 · 시위현장",
    title: "수천 송이, 현장 도착 30분",
    desc: "대규모 행사·집회·시위 현장에 화환·근조화를 일괄 발송합니다. 100건 이상의 동시 주문도 전국 네트워크로 당일 배송을 보장합니다.",
    bg: slideEvent,
    tone: "from-[rgba(35,31,32,0.40)] to-[rgba(11,13,18,0.88)]",
  },
];

export default function ScrollSlides() {
  const trackRef = useRef(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let ticking = false;
    const update = () => {
      const node = trackRef.current;
      if (!node) { ticking = false; return; }
      const rect = node.getBoundingClientRect();
      const max = Math.max(1, rect.height - window.innerHeight);
      const raw = Math.max(0, Math.min(1, -rect.top / max));
      setProgress(raw);
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
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
      aria-label="도입사례 슬라이드"
      className="relative"
      style={{ height: `${N * 100}vh` }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-black contain-paint">
        {SLIDES.map((slide, i) => (
          <div
            key={i}
            aria-hidden
            className="absolute inset-0 slide-fade"
            style={{ opacity: i === activeIndex ? 1 : 0 }}
          >
            <img
              src={slide.bg}
              alt=""
              className="absolute inset-0 h-full w-full object-cover select-none"
              draggable="false"
            />
            <div className={`absolute inset-0 bg-gradient-to-b ${slide.tone}`} />
          </div>
        ))}

        <div className="absolute inset-x-0 bottom-[160px] md:bottom-[180px] z-10">
          <div className="relative">
            {SLIDES.map((slide, i) => (
              <article
                key={i}
                className="absolute left-0 right-0 bottom-0 px-6 md:px-12 lg:px-[150px] slide-article"
                style={{
                  opacity: i === activeIndex ? 1 : 0,
                  transform: i === activeIndex ? "translateY(0)" : "translateY(16px)",
                  pointerEvents: i === activeIndex ? "auto" : "none",
                }}
                aria-hidden={i !== activeIndex}
              >
                <p className="typo-eyebrow text-white/75">
                  {slide.eyebrow} · {slide.label}
                </p>
                <h2 className="typo-slide-title mt-5 max-w-3xl text-white">
                  {slide.title}
                </h2>
                <p className="typo-body-slide mt-6 max-w-xl text-white/85">
                  {slide.desc}
                </p>
              </article>
            ))}
          </div>
        </div>

        <div className="absolute bottom-12 left-0 right-0 z-20 px-6 md:px-12 lg:px-[150px]">
          <div className="flex gap-4 md:gap-6">
            {SLIDES.map((slide, i) => {
              const start = i / N;
              const end = (i + 1) / N;
              const local =
                progress < start ? 0
                : progress > end ? 1
                : (progress - start) / (end - start);
              const isActive = i === activeIndex;
              const isPast = i < activeIndex;
              const labelTone = isActive || isPast ? "text-white" : "text-white/50";
              const num = String(i + 1).padStart(2, "0");

              return (
                <div key={i} className="flex flex-1 flex-col gap-3" data-i={i}>
                  <div className={`typo-label flex items-baseline gap-2 transition-colors duration-300 ${labelTone}`}>
                    <span className="opacity-80 tabular">{num}</span>
                    <span className="truncate">{slide.label}</span>
                  </div>
                  <div className="h-[3px] rounded-full bg-white/25 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-white progress-fill"
                      style={{ transform: `scaleX(${local.toFixed(3)})` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {Array.from({ length: N - 1 }, (_, i) => (
        <div key={i} style={{ height: "100vh" }} aria-hidden />
      ))}
    </section>
  );
}
