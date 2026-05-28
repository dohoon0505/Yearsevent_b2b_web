import { useEffect, useRef, useState } from "react";
import slideLegal from "../assets/slide-legal.png";
import slideIndustry from "../assets/slide-industry.png";
import slideCorporate from "../assets/slide-corporate.png";
import slideCommunity from "../assets/slide-community.png";

/**
 * ScrollCardSection — base44 stack-up 패턴 100% 응용
 *
 * 참고: scroll-card-update stack-up (https://base44.com)
 *
 * 구조:
 *   - track 500vh + sticky stage 100vh
 *   - 배경 4 레이어 (고정, opacity 600ms 크로스페이드)
 *   - 흰색 이너 카드 4개 (translateY 100%→0 stack up, zIndex 순서)
 *
 * 이너 카드 디자인 (Figma & base44 시그니처):
 *   - 65vw / max-w-1100px / aspect 1100:587 / radius 9px
 *   - grid 59fr : 41fr (텍스트 : 이미지)
 *   - 좌측: 넘버링 (01/04) + 타이틀 + 본문 + CTA
 *   - 우측: object-cover 이미지
 */

const CARDS = [
  {
    title: "주문부터 도착까지 30분",
    body: "전국 협력 화원 네트워크로 평균 30분 내 현장 도착. 급한 경조사도 놓치지 않습니다.",
    cta: "서비스 체험신청",
    bg: "linear-gradient(rgb(240,240,240) 42.34%, rgb(240,195,236) 91.67%, rgb(204,231,233) 104.12%)",
    img: slideLegal,
  },
  {
    title: "전국 협력 화원 네트워크",
    body: "전국 어디든 닿는 무료배송. 대도시부터 지방 소도시까지 동일한 품질과 가격으로 발송합니다.",
    cta: "서비스 체험신청",
    bg: "linear-gradient(rgb(242,241,237) 42.49%, rgb(213,223,224) 93.98%, rgb(229,255,148) 104.08%)",
    img: slideIndustry,
  },
  {
    title: "월 정산 · 50만원 책임 배상",
    body: "세금계산서 일괄 발급, 건당 50만원 책임 배상 제도로 안심할 수 있는 거래 시스템을 운영합니다.",
    cta: "서비스 체험신청",
    bg: "linear-gradient(rgb(237,234,228) 42.62%, rgb(249,251,201) 94.17%, rgb(254,233,105) 104.07%)",
    img: slideCorporate,
  },
  {
    title: "1:1 전담 매니저",
    body: "법인·단체 특성을 이해하는 전담 매니저가 발주부터 사후 관리까지 모든 과정을 책임집니다.",
    cta: "서비스 체험신청",
    bg: "linear-gradient(0deg, rgb(203,13,53) -13.02%, rgb(219,221,218) 9.58%, rgb(245,242,236) 83.05%)",
    img: slideCommunity,
  },
];

export default function ScrollCardSection() {
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

  const N = CARDS.length;
  const segs = N - 1;
  const activeIdx = Math.min(Math.floor(progress * N), N - 1);

  return (
    <section
      ref={trackRef}
      aria-label="서비스 핵심"
      className="relative"
      style={{ height: `${N * 100 + 100}vh` }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* 배경 4 레이어 — 고정, 크로스페이드 */}
        {CARDS.map((card, i) => (
          <div
            key={`bg-${i}`}
            aria-hidden
            className="absolute inset-0 transition-opacity duration-[600ms] ease-out"
            style={{
              background: card.bg,
              opacity: i === activeIdx ? 1 : 0,
            }}
          />
        ))}

        {/* 카드 stack up — translateY 100%→0, zIndex 순서 */}
        {CARDS.map((card, i) => {
          let translateY = 0;
          if (i > 0) {
            const start = (i - 1) / segs;
            const local = Math.max(0, Math.min(1, (progress - start) * segs));
            translateY = (1 - local) * 100;
          }
          return (
            <div
              key={`card-${i}`}
              className="absolute inset-0 flex items-center justify-center"
              style={{
                transform: `translateY(${translateY.toFixed(3)}%)`,
                zIndex: i + 1,
                willChange: "transform",
              }}
            >
              {/* 이너 카드 */}
              <div
                className="grid bg-white rounded-[9px] overflow-hidden shadow-[0_18px_48px_-12px_rgba(0,0,0,0.18)]"
                style={{
                  width: "65vw",
                  maxWidth: "1100px",
                  gridTemplateColumns: "59fr 41fr",
                  aspectRatio: "1100 / 587",
                }}
              >
                {/* 좌측 — 넘버링 + 타이틀 + 본문 + CTA */}
                <div
                  className="flex flex-col justify-center"
                  style={{
                    padding:
                      "clamp(32px,2.6vw,44px) clamp(44px,4.17vw,70px) clamp(32px,2.6vw,44px) clamp(32px,2.6vw,44px)",
                    gap: "clamp(28px,2.6vw,44px)",
                  }}
                >
                  {/* 넘버링 */}
                  <div
                    className="flex items-baseline gap-1"
                    style={{ fontSize: "clamp(15px,1.15vw,19px)" }}
                  >
                    <span className="text-black font-medium tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-[#696f7b]">/</span>
                    <span className="text-[#696f7b] tabular-nums">
                      {String(N).padStart(2, "0")}
                    </span>
                    <span className="text-black ml-4 font-medium tracking-[-0.003em]">
                      {card.title}
                    </span>
                  </div>

                  {/* 본문 */}
                  <p
                    className="text-black m-0 font-normal tracking-[-0.012em]"
                    style={{
                      fontSize: "clamp(22px,1.77vw,30px)",
                      lineHeight: "1.2",
                    }}
                  >
                    {card.body}
                  </p>

                  {/* CTA */}
                  <a
                    href="https://pf.kakao.com/_glBxdn/chat"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="self-start inline-flex items-center bg-[#0f0f0f] text-white rounded-full font-medium hover:bg-[#2a2a2a] transition-colors duration-150"
                    style={{
                      padding:
                        "clamp(14px,1.1vw,18px) clamp(28px,2.1vw,36px)",
                      fontSize: "clamp(13px,0.94vw,16px)",
                    }}
                  >
                    {card.cta}
                  </a>
                </div>

                {/* 우측 — 이미지 */}
                <div className="overflow-hidden">
                  <img
                    src={card.img}
                    alt=""
                    className="w-full h-full object-cover block select-none"
                    draggable="false"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
