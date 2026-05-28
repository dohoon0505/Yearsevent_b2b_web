import { useEffect, useRef } from "react";
import slideLegal from "../assets/slide-legal.png";
import slideIndustry from "../assets/slide-industry.png";
import slideCorporate from "../assets/slide-corporate.png";
import slideCommunity from "../assets/slide-community.png";

/**
 * ScrollCardSection — Figma 95:212 + base44 stack-up + 성능 최적화
 *
 * 성능 전략 (정밀 검사 결과):
 *   - React state 제거 → useRef + 직접 DOM 조작 (React 재렌더 0회)
 *   - transform: translate3d() — GPU 가속 보장
 *   - 가려진 카드 visibility: hidden — paint/composite 생략
 *   - box-shadow boolean toggle + CSS transition (매 프레임 재계산 X)
 *   - 배경 그라데이션 4 레이어 opacity 직접 토글
 *
 * 인터랙션:
 *   - track 500vh / sticky 100vh
 *   - 카드 1번 처음부터 표시, 2~4번 viewport 100vh 아래에서 슬라이드 업
 *   - 활성 카드만 box-shadow, 배경 그라데이션 0.5 opacity 크로스페이드
 */

const CARDS = [
  {
    title: "대한민국 전 지역 무료배송",
    lines: [
      "강원도 · 제주도 · 읍면리 그 어디에도 배송비를 청구하지 않습니다.",
      "대한민국 전국에 자사 네트워크망이 존재하기에,",
      "타사와는 다르게 100% 무료배송을 제공해 드리고 있습니다.",
    ],
    img: slideLegal,
    bg: "linear-gradient(#fff 42.34%, rgb(240,195,236) 91.67%, rgb(204,231,233) 104.12%)",
  },
  {
    title: "시장 평균 대비 35% 단가 절감",
    lines: [
      "도매가 직거래로 시장 평균 대비 35% 저렴한 단가를 보장합니다.",
      "자체 물류 네트워크와 안정적인 공급망으로,",
      "화환 · 근조화 모든 품목에서 합리적인 가격을 제시합니다.",
    ],
    img: slideIndustry,
    bg: "linear-gradient(#fff 42.49%, #fff 70%, rgb(229,255,148) 104.08%)",
  },
  {
    title: "월 정산 · 50만원 책임 배상",
    lines: [
      "매월 세금계산서를 일괄 발급하여 거래 관리가 편리합니다.",
      "건당 50만원의 책임 배상 제도로,",
      "만약의 사고에도 안심하고 거래하실 수 있습니다.",
    ],
    img: slideCorporate,
    bg: "linear-gradient(#fff 42.62%, rgb(249,251,201) 94.17%, rgb(254,233,105) 104.07%)",
  },
  {
    title: "1:1 전담 매니저 배정",
    lines: [
      "법인 · 단체 특성을 이해하는 전담 매니저가 배정됩니다.",
      "발주부터 사후 관리까지 모든 과정을 책임지며,",
      "카카오톡 상담으로 신속한 지원을 받으실 수 있습니다.",
    ],
    img: slideCommunity,
    bg: "linear-gradient(0deg, rgb(203,13,53) -13.02%, #fff 9.58%, #fff 83.05%)",
  },
];

const N = CARDS.length;
const SEGS = N - 1;
const SHADOW_ON = "0 0 50px rgba(0,0,0,0.1)";

export default function ScrollCardSection() {
  const trackRef = useRef(null);
  const cardRefs = useRef([]);
  const bgRefs = useRef([]);

  useEffect(() => {
    let ticking = false;

    const update = () => {
      ticking = false;
      const node = trackRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const vh = window.innerHeight;
      const max = Math.max(1, rect.height - vh);
      const p = Math.max(0, Math.min(1, -rect.top / max));
      const idx = Math.min(Math.floor(p * N), N - 1);

      // 카드 transform / visibility / box-shadow 직접 DOM 업데이트
      for (let i = 0; i < N; i++) {
        const el = cardRefs.current[i];
        if (!el) continue;
        const local =
          i === 0
            ? 1
            : Math.max(0, Math.min(1, (p - (i - 1) / SEGS) * SEGS));
        const yvh = ((1 - local) * 100).toFixed(2);
        el.style.transform = `translate3d(0, ${yvh}vh, 0)`;
        // 가려진 카드는 paint 생략
        const visible = local > 0.001;
        if (el.dataset.visible !== String(visible)) {
          el.style.visibility = visible ? "visible" : "hidden";
          el.dataset.visible = String(visible);
        }
        // shadow는 활성 카드만 (boolean이라 매 프레임 재계산 비용 X)
        const shadow = i === idx ? SHADOW_ON : "none";
        if (el.dataset.shadow !== shadow) {
          el.style.boxShadow = shadow;
          el.dataset.shadow = shadow;
        }
      }

      // 배경 그라데이션 opacity 직접 토글
      for (let i = 0; i < N; i++) {
        const bg = bgRefs.current[i];
        if (!bg) continue;
        const next = i === idx ? "0.5" : "0";
        if (bg.dataset.op !== next) {
          bg.style.opacity = next;
          bg.dataset.op = next;
        }
      }
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    // 초기 cardRefs visibility/transform 세팅
    update();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section
      ref={trackRef}
      aria-label="제휴기업 혜택"
      className="relative bg-white"
      style={{ height: `${N * 100 + 100}vh` }}
    >
      <div className="sticky top-0 h-screen w-full bg-white overflow-hidden">
        {/* 배경 그라데이션 4 레이어 */}
        {CARDS.map((card, i) => (
          <div
            key={`bg-${i}`}
            ref={(el) => (bgRefs.current[i] = el)}
            aria-hidden
            className="absolute inset-0"
            style={{
              background: card.bg,
              opacity: 0,
              transition: "opacity 600ms ease-out",
            }}
          />
        ))}

        {/* 콘텐츠 레이어 */}
        <div className="relative h-full w-full flex flex-col items-center justify-center gap-[40px] md:gap-[60px] xl:gap-[70px] px-6 md:px-12 lg:px-[80px] xl:px-[260px] py-[120px] md:py-[140px] xl:py-[150px]">
          {/* 섹션 헤더 */}
          <div className="flex flex-col gap-[20px] md:gap-[30px] items-center">
            <div className="flex gap-[8px] items-center">
              <p className="font-bold text-[var(--color-brand-red)] text-[18px] md:text-[22px] xl:text-[24px] tracking-[-0.01em]">
                Partner Benefits
              </p>
              <span
                aria-hidden
                className="block w-[8px] h-[8px] xl:w-[10px] xl:h-[10px] rounded-full bg-[var(--color-brand-red)]"
              />
            </div>
            <h2 className="font-bold text-[#222] text-[32px] md:text-[44px] xl:text-[58px] tracking-[-0.018em] text-center leading-[1.2]">
              제휴기업은 어떤 혜택이 있나요?
            </h2>
          </div>

          {/* 카드 컨테이너 */}
          <div
            className="relative max-w-[1020px] mx-auto w-full"
            style={{ aspectRatio: "1200 / 554" }}
          >
            {CARDS.map((card, i) => {
              const isLast = i === N - 1;
              return (
                <div
                  key={i}
                  ref={(el) => (cardRefs.current[i] = el)}
                  className="absolute inset-0 flex rounded-[30px] bg-white"
                  style={{
                    zIndex: i + 1,
                    transform: "translate3d(0, 0, 0)",
                    backfaceVisibility: "hidden",
                    transition: "box-shadow 280ms ease-out",
                  }}
                >
                  {/* 좌측 텍스트 패널 */}
                  <div className="bg-[#fbfbfb] flex flex-col items-start justify-between h-full w-[68.4%] p-[20px] md:p-[34px] xl:p-[51px] rounded-l-[30px]">
                    <div className="flex flex-col gap-[20px] md:gap-[30px] xl:gap-[42px] items-start">
                      <div className="flex flex-col gap-[6px] md:gap-[8px] xl:gap-[10px] items-start">
                        <p className="font-medium text-[#c1c1c1] text-[14px] md:text-[19px] xl:text-[24px] tracking-[-0.005em]">
                          제휴기업 혜택 {String(i + 1).padStart(2, "0")}
                        </p>
                        <p className="font-bold text-[#222] text-[19px] md:text-[27px] xl:text-[34px] tracking-[-0.018em] leading-[1.2]">
                          {card.title}
                        </p>
                      </div>

                      <div className="text-[#333] text-[11px] md:text-[14px] xl:text-[17px] leading-[1.5] tracking-[-0.003em]">
                        {card.lines.map((line, j) => (
                          <p key={j} className="m-0">
                            {line}
                          </p>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-end w-full">
                      <p className="font-normal text-[var(--color-brand-red)] text-[12px] md:text-[15px] xl:text-[18px] tracking-[-0.01em]">
                        {isLast
                          ? "혜택을 모두 확인하셨어요"
                          : "스크롤 하여 이동 ↓"}
                      </p>
                    </div>
                  </div>

                  {/* 우측 이미지 패널 */}
                  <div className="flex-1 h-full relative overflow-hidden rounded-r-[30px]">
                    <img
                      src={card.img}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 w-full h-full object-cover select-none"
                      draggable="false"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
