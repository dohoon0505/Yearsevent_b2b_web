import { useEffect, useLayoutEffect, useRef, useState } from "react";
import slideLegal from "../assets/slide-legal.png";
import slideIndustry from "../assets/slide-industry.png";
import slideCorporate from "../assets/slide-corporate.png";
import slideCommunity from "../assets/slide-community.png";
import slideEvent from "../assets/slide-event.png";

/**
 * DataSection — About Us(다단계 sticky 무대) + For Business(scrub 슬로건)
 *
 * ┌─ About Us  (TRACK 600vh / sticky 100vh 무대)
 * │   progress 구간:
 * │     [0 ~ 0.22]  텍스트 단어 scrub reveal (중앙 정렬)
 * │     [0.22~0.34] 텍스트가 상단(top padding 120)으로 이동 + 이미지 슬라이더 등장
 * │     [0.34~1.0 ] center-focus 가로 이미지 슬라이더 (첨부 md 패턴)
 * │   → 텍스트 + 슬라이더는 100vh 안에 공존, 100% 도달 시 sticky 해제
 * └─ For Business (TRACK 200vh / sticky 100vh) — 우측 정렬 scrub 슬로건
 *
 * 성능: 스크롤 프레임에서 React state 갱신 없이 ref 직접 DOM(transform/opacity)만 기록.
 *       레이아웃 측정값(텍스트 높이·카드 중심)은 measure()에서 캐시.
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

// About 슬로건 단어를 전역 인덱스와 함께 평탄화 (ref 직접 색 제어용)
let _gi = 0;
const ABOUT_FLAT = ABOUT_LINES.map((line) =>
  line.map((w) => ({ ...w, gi: _gi++ })),
);
const TOTAL_ABOUT = _gi;
const TOTAL_BUSINESS = BUSINESS_LINES.reduce((acc, l) => acc + l.length, 0);

const DIM = "#d4d8e2";
const DARK = "#222222";
const ACCENT = "var(--color-brand-red)";

// About Us 이미지 슬라이더 — 프로젝트 기존 slide 이미지 재사용
const SLIDER_CARDS = [
  { img: slideCorporate, title: "임직원 경조사", cat: "기업 복지의 시작" },
  { img: slideIndustry, title: "제조 · 도소매", cat: "현장 곁의 파트너" },
  { img: slideLegal, title: "법무 · 세무법인", cat: "격식 있는 자리" },
  { img: slideCommunity, title: "모임 · 단체", cat: "소속감을 꽃으로" },
  { img: slideEvent, title: "행사 현장", cat: "수천 송이, 30분" },
];

// ───────── About Us 다단계 무대 ─────────
const A_TRACK_VH = 600;
const A_TEXT_END = 0.22; // 텍스트 scrub 완료
const A_TRANS_END = 0.34; // 텍스트 상단 이동 + 슬라이더 등장 완료
const A_TOP_PAD = 120; // 상단 padding 120 (요구사항)
const A_GAP = 36; // 텍스트 ↔ 슬라이더 간격
const A_BOTTOM_PAD = 72;
const A_CARD_MAXH = 460;

const clamp01 = (v) => Math.max(0, Math.min(1, v));
const lerp = (a, b, t) => a + (b - a) * t;
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

function AboutScrollStage() {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const textWrapRef = useRef(null);
  const wordRefs = useRef([]);
  const sliderWrapRef = useRef(null);
  const sliderViewportRef = useRef(null);
  const sliderTrackRef = useRef(null);
  const cardRefs = useRef([]);
  const geo = useRef({ vh: 0, centerY: 0, maxX: 0, vpW: 1, cardCx: [] });
  const [ready, setReady] = useState(false);

  // 진입 시 텍스트 블록 fade-in
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
      { threshold: 0.02 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useLayoutEffect(() => {
    let ticking = false;

    // 레이아웃 측정 → geo 캐시 (mount / resize / font load 시)
    const measure = () => {
      const vh = window.innerHeight;
      const tw = textWrapRef.current;
      const vp = sliderViewportRef.current;
      const track = sliderTrackRef.current;
      const sw = sliderWrapRef.current;
      if (!tw || !vp || !track || !sw) return;

      const textH = tw.offsetHeight;
      const sliderTop = A_TOP_PAD + textH + A_GAP;
      const sliderH = Math.max(160, vh - sliderTop - A_BOTTOM_PAD);
      const cardH = Math.min(sliderH, A_CARD_MAXH);
      const cardW = Math.round(cardH * 0.74);

      sw.style.top = `${sliderTop}px`;
      vp.style.height = `${sliderH}px`;
      cardRefs.current.forEach((c) => {
        if (!c) return;
        c.style.height = `${cardH}px`;
        c.style.width = `${cardW}px`;
      });

      // 사이즈 적용 후 기하 측정 (transform은 offsetLeft에 영향 없음 → 1회 캐시)
      const maxX = Math.max(0, track.scrollWidth - vp.clientWidth);
      const cardCx = cardRefs.current.map((c) =>
        c ? c.offsetLeft + c.offsetWidth / 2 : 0,
      );
      geo.current = {
        vh,
        centerY: (vh - textH) / 2 - A_TOP_PAD,
        maxX,
        vpW: vp.clientWidth,
        cardCx,
      };
    };

    const update = () => {
      ticking = false;
      const node = trackRef.current;
      if (!node) return;
      if (window.innerHeight !== geo.current.vh) measure();
      const g = geo.current;
      const rect = node.getBoundingClientRect();
      const vh = window.innerHeight;
      const max = Math.max(1, rect.height - vh);
      const p = clamp01(-rect.top / max);

      // 1) 텍스트 단어 scrub reveal
      const reveal = clamp01(p / A_TEXT_END);
      const lit = clamp01((reveal - 0.05) / 0.9);
      const litIdx = Math.floor(lit * (TOTAL_ABOUT + 1));
      const words = wordRefs.current;
      for (let i = 0; i < words.length; i++) {
        const el = words[i];
        if (!el) continue;
        const on = i < litIdx;
        const c = on ? (el.dataset.accent === "1" ? ACCENT : DARK) : DIM;
        if (el.dataset.c !== c) {
          el.style.color = c;
          el.dataset.c = c;
        }
      }

      // 2) 텍스트 중앙 → 상단 이동
      let ty;
      if (p <= A_TEXT_END) ty = g.centerY;
      else if (p < A_TRANS_END)
        ty = lerp(
          g.centerY,
          0,
          easeOutCubic((p - A_TEXT_END) / (A_TRANS_END - A_TEXT_END)),
        );
      else ty = 0;
      textWrapRef.current.style.transform = `translate3d(0, ${ty.toFixed(1)}px, 0)`;

      // 3) 슬라이더 등장 (transition 구간 fade + slide up)
      const appear = clamp01((p - A_TEXT_END) / (A_TRANS_END - A_TEXT_END));
      const sw = sliderWrapRef.current;
      sw.style.opacity = appear.toFixed(3);
      sw.style.transform = `translate3d(0, ${((1 - appear) * 40).toFixed(1)}px, 0)`;
      sw.style.pointerEvents = appear > 0.99 ? "auto" : "none";

      // 4) center-focus 가로 스크롤
      const sp = clamp01((p - A_TRANS_END) / (1 - A_TRANS_END));
      const dx = -g.maxX * sp;
      sliderTrackRef.current.style.transform = `translate3d(${dx.toFixed(1)}px, 0, 0)`;
      const vw = g.vpW;
      const cards = cardRefs.current;
      for (let i = 0; i < cards.length; i++) {
        const c = cards[i];
        if (!c) continue;
        const cx = g.cardCx[i] + dx;
        const d = Math.abs(cx - vw / 2) / vw;
        c.style.transform = `scale(${Math.max(0.82, 1 - d * 0.5).toFixed(3)})`;
        c.style.opacity = Math.max(0.4, 1 - d * 1.1).toFixed(3);
      }
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    const onResize = () => {
      measure();
      update();
    };

    measure();
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    // 웹폰트 로드 후 텍스트 높이 변동 대응
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        measure();
        update();
      });
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <section ref={sectionRef} aria-label="회사 소개" className="relative bg-white">
      <div ref={trackRef} style={{ height: `${A_TRACK_VH}vh` }} className="relative">
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          {/* 텍스트 블록 — 중앙↔상단 이동 (transform JS 제어) */}
          <div
            ref={textWrapRef}
            className="absolute inset-x-0 px-6 md:px-12 lg:px-[120px] xl:px-[260px] will-change-transform"
            style={{
              top: `${A_TOP_PAD}px`,
              opacity: ready ? 1 : 0,
              transition: "opacity 0.5s ease-out",
            }}
          >
            <p className="text-[var(--color-brand-red)] font-bold text-[18px] md:text-[22px] tracking-[-0.01em] inline-flex items-center gap-[8px]">
              <span>About Us</span>
              <span
                aria-hidden
                className="inline-block w-[7px] h-[7px] rounded-full bg-[var(--color-brand-red)]"
              />
            </p>
            <h2 className="mt-[24px] font-bold text-[32px] md:text-[42px] lg:text-[48px] xl:text-[54px] leading-[1.25] tracking-[-0.018em] text-left">
              {ABOUT_FLAT.map((line, li) => (
                <span key={li} className="block">
                  {line.map((w, wi) => (
                    <span
                      key={wi}
                      ref={(el) => (wordRefs.current[w.gi] = el)}
                      data-accent={w.tone === "accent" ? "1" : "0"}
                      className="inline-block whitespace-pre"
                      style={{ color: DIM }}
                    >
                      {w.text}
                      {wi < line.length - 1 && !w.noSpace ? " " : ""}
                    </span>
                  ))}
                </span>
              ))}
            </h2>
          </div>

          {/* 이미지 슬라이더 — center-focus (top/height JS 제어) */}
          <div
            ref={sliderWrapRef}
            className="absolute inset-x-0 will-change-transform"
            style={{ top: `${A_TOP_PAD}px`, opacity: 0 }}
            aria-label="회사 소개 갤러리"
          >
            <div
              ref={sliderViewportRef}
              className="w-full overflow-hidden flex items-center"
            >
              <div
                ref={sliderTrackRef}
                className="flex items-center gap-[24px] will-change-transform"
                style={{ paddingLeft: "clamp(24px, 6vw, 120px)" }}
              >
                {SLIDER_CARDS.map((card, i) => (
                  <article
                    key={i}
                    ref={(el) => (cardRefs.current[i] = el)}
                    className="flex-none flex flex-col rounded-[16px] bg-white border border-[#ececec] overflow-hidden will-change-transform"
                    style={{
                      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                      transformOrigin: "center center",
                    }}
                  >
                    <div className="flex-1 min-h-0 overflow-hidden bg-[#e5e5e5]">
                      <img
                        src={card.img}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        draggable="false"
                        className="w-full h-full object-cover select-none"
                      />
                    </div>
                    <div className="px-[16px] py-[14px]">
                      <p className="text-[16px] md:text-[18px] font-bold text-[#18181b] tracking-[-0.01em] leading-[1.2]">
                        {card.title}
                      </p>
                      <p className="mt-[5px] text-[12.5px] md:text-[13px] text-[#71717a] tracking-[-0.003em]">
                        {card.cat}
                      </p>
                    </div>
                  </article>
                ))}
                {/* 끝 여백 — 마지막 카드가 중앙까지 도달 */}
                <div
                  className="flex-none"
                  style={{ width: "clamp(120px, 40vw, 720px)" }}
                  aria-hidden
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** 슬로건 단어 스크럽 렌더러 (For Business — React state 기반) */
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

/** For Business — 100vh sticky 프레임 + 스크럽 단어 reveal */
function ScrubSloganSection({ ariaLabel, label, lines, total, trackVh = 200 }) {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);

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

  return (
    <section ref={sectionRef} aria-label={ariaLabel} className="relative bg-white">
      <div ref={trackRef} style={{ height: `${trackVh}vh` }} className="relative">
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          <div className="h-full w-full flex flex-col justify-center gap-[24px] px-6 md:px-12 lg:px-[120px] xl:px-[260px] py-[100px] md:py-[120px] items-end">
            <p
              className="text-[var(--color-brand-red)] font-bold text-[18px] md:text-[22px] tracking-[-0.01em] inline-flex items-center gap-[8px] hero-fade-up"
              style={{
                opacity: ready ? 1 : 0,
                transform: ready ? "translateY(0)" : "translateY(20px)",
              }}
            >
              <span>{label}</span>
              <span
                aria-hidden
                className="inline-block w-[7px] h-[7px] rounded-full bg-[var(--color-brand-red)]"
              />
            </p>
            <Slogan
              lines={lines}
              litIndex={litIdx}
              align="right"
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
      <AboutScrollStage />
      <ScrubSloganSection
        ariaLabel="비즈니스 소개"
        label="For Business"
        lines={BUSINESS_LINES}
        total={TOTAL_BUSINESS}
      />
    </>
  );
}
