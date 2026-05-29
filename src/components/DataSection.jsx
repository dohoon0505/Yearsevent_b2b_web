import { useEffect, useLayoutEffect, useRef, useState } from "react";
import slideLegal from "../assets/slide-legal.webp";
import slideIndustry from "../assets/slide-industry.webp";
import slideCorporate from "../assets/slide-corporate.webp";
import slideCommunity from "../assets/slide-community.webp";
import slideEvent from "../assets/slide-event.webp";

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
// 연속 스크럽 색 보간용 RGB (DIM↔DARK / DIM↔ACCENT)
const DIM_RGB = [212, 216, 226];
const DARK_RGB = [34, 34, 34];
const smoothstep = (t) => t * t * (3 - 2 * t);

// About Us 이미지 슬라이더 — 이미지는 기존 slide 5종을 인접 중복 없이 순환 매핑(플레이스홀더)
const SLIDER_CARDS = [
  {
    img: slideLegal,
    title: "부고장 수령",
    desc: "가장 힘든 순간에 전하는 위로가, 가장 깊은 신뢰로 남습니다.",
  },
  {
    img: slideCommunity,
    title: "청첩장 수령",
    desc: "거래처의 기쁜 날, 귀사의 이름이 담긴 아름다운 축복을 더해주세요.",
  },
  {
    img: slideCorporate,
    title: "이·취임식",
    desc: "새로운 리더의 탄생, 귀사의 든든한 지지를 가장 먼저 보여주세요.",
  },
  {
    img: slideIndustry,
    title: "확장·이전",
    desc: "파트너의 성장은 곧 귀사의 기회입니다. 더 큰 도약을 응원 해주세요.",
  },
  {
    img: slideEvent,
    title: "개업축하",
    desc: "파트너의 새로운 시작, 첫인상이 평생의 비즈니스를 좌우합니다.",
  },
  {
    img: slideCorporate,
    title: "승진 · 영전",
    desc: "핵심 파트너의 성취를 축하하는 것, 가장 확실한 네트워킹의 완성입니다.",
  },
  {
    img: slideCommunity,
    title: "출산·득남·득녀",
    desc: "비즈니스를 넘어 가족의 기쁨까지 챙기는 세심함, 진정한 신뢰의 증거입니다.",
  },
  {
    img: slideIndustry,
    title: "임직원 경조사",
    desc: "‘우리를 챙겨주는 든든한 회사’라는 자부심, 꼼꼼한 경조사 지원에서 출발합니다.",
  },
];

// 반복(loop) 렌더 — 카드를 3벌 이어 붙여 이음새 없는 center-focus 루프 구성.
// focal은 가운데 벌의 첫 카드(A_START_I)부터 한 바퀴(UNIQUE_N step) 이동 →
// 양옆에 항상 이웃 카드가 채워져(빈 공간 없음) 중앙 카드가 Active 되는 캐러셀.
// 마지막 카드 다음에 첫 카드가 다시 중앙으로 들어온다.
const UNIQUE_N = SLIDER_CARDS.length;
const LOOP_CARDS = [...SLIDER_CARDS, ...SLIDER_CARDS, ...SLIDER_CARDS];
const A_START_I = UNIQUE_N; // 시작 시 중앙(Active)에 둘 카드 = 가운데 벌의 임직원

// ───────── About Us 다단계 무대 ─────────
const A_TRACK_VH = 460;
const A_TEXT_END = 0.32; // 텍스트 scrub 완료 (~1화면)
const A_TRANS_END = 0.52; // 텍스트 상단 이동 + 슬라이더 등장 완료 (전환 구간 ↑ 매끄럽게)
const A_TOP_PAD = 120; // 상단 padding 120 (요구사항)
const A_GAP = 36; // 텍스트 ↔ 슬라이더 간격
const A_BOTTOM_PAD = 72;
const A_CARD_MAXH = 460;

const clamp01 = (v) => Math.max(0, Math.min(1, v));
const lerp = (a, b, t) => a + (b - a) * t;
// 시작·끝 속도 0 → 전환(텍스트 이동/슬라이더 등장)이 툭 튀지 않고 매끄럽게 가감속
const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

function AboutScrollStage() {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const textWrapRef = useRef(null);
  const wordRefs = useRef([]);
  const sliderWrapRef = useRef(null);
  const sliderViewportRef = useRef(null);
  const sliderTrackRef = useRef(null);
  const cardRefs = useRef([]);
  const endSpacerRef = useRef(null);
  const geo = useRef({ vh: 0, centerY: 0, maxX: 0, dx0: 0, focalX: 0, refW: 1, cardCx: [] });
  const accentRGBRef = useRef([203, 13, 53]); // --color-brand-red (resolve 후 갱신)
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

    // --color-brand-red 를 rgb 로 1회 해석 (연속 보간용)
    try {
      const probe = document.createElement("span");
      probe.style.cssText = "color:var(--color-brand-red);position:absolute;visibility:hidden";
      document.body.appendChild(probe);
      const m = getComputedStyle(probe).color.match(/\d+/g);
      if (m && m.length >= 3) accentRGBRef.current = m.slice(0, 3).map(Number);
      document.body.removeChild(probe);
    } catch {
      /* keep fallback */
    }

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

      // center-focus 루프: 트랙 좌측 패딩 0, 대신 dx0 오프셋으로 가운데 벌의
      // 임직원(A_START_I)을 레일 중앙(focalX)에 놓는다. 3벌 렌더라 양옆이 항상
      // 채워지고(빈 공간 없음), focal은 한 바퀴(UNIQUE_N step)만 이동.
      const vpW = vp.clientWidth;
      track.style.paddingLeft = "0px";
      if (endSpacerRef.current) endSpacerRef.current.style.width = "0px";

      // dx=0 기준으로 카드 중심을 "뷰포트 좌측 상대 좌표"로 측정.
      // 트랙/래퍼 transform 때문에 offsetParent가 달라져 offsetLeft 좌표계가
      // 어긋나므로 getBoundingClientRect 사용 (scale은 center-origin → 중심 불변).
      track.style.transform = "translate3d(0,0,0)";
      const vpLeft = vp.getBoundingClientRect().left;
      const cardCx = cardRefs.current.map((c) => {
        if (!c) return 0;
        const r = c.getBoundingClientRect();
        return r.left + r.width / 2 - vpLeft;
      });
      const step = (cardCx[1] || 0) - (cardCx[0] || 0);
      const focalX = vpW / 2; // 레일(인셋 뷰포트) 중앙 = Active 카드 위치
      const dx0 = focalX - (cardCx[A_START_I] || 0); // 시작 시 가운데 임직원을 중앙에
      geo.current = {
        vh,
        centerY: (vh - textH) / 2 - A_TOP_PAD,
        maxX: Math.max(0, step * UNIQUE_N),
        dx0,
        focalX,
        refW: window.innerWidth, // falloff 정규화(전체 폭) — 부드러운 포커스 유지
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

      // 1) 텍스트 단어 scrub reveal — 연속 보간(스크롤 위치에 직결)으로 색을 채운다.
      //    이산 단계(litIdx)가 아니라 각 단어의 채움 정도를 부드럽게 lerp →
      //    스크롤 속도·방향과 무관하게 매끄럽게 칠해짐(딱딱한 단계감 제거).
      const reveal = clamp01(p / A_TEXT_END);
      const litAmt = clamp01((reveal - 0.05) / 0.9);
      const pos = litAmt * (TOTAL_ABOUT + 1); // 0..N+1 연속 채움 위치
      const acc = accentRGBRef.current;
      const words = wordRefs.current;
      for (let i = 0; i < words.length; i++) {
        const el = words[i];
        if (!el) continue;
        // 단어 i 는 1.6칸 폭 창에서 채워짐(이웃과 겹쳐 부드러운 채움 front)
        const wf = smoothstep(clamp01((pos - i) / 1.6));
        const t = el.dataset.accent === "1" ? acc : DARK_RGB;
        const r = Math.round(DIM_RGB[0] + (t[0] - DIM_RGB[0]) * wf);
        const g = Math.round(DIM_RGB[1] + (t[1] - DIM_RGB[1]) * wf);
        const b = Math.round(DIM_RGB[2] + (t[2] - DIM_RGB[2]) * wf);
        const c = `rgb(${r}, ${g}, ${b})`;
        if (el.dataset.c !== c) {
          el.style.color = c;
          el.dataset.c = c;
        }
      }

      // 2)+3) 텍스트 상단 이동 + 슬라이더 등장 — 동일 eased 진행으로 매끄럽게 동기화.
      //   easeInOutCubic: 전환 시작·끝 속도 0 → "툭" 튀지 않고 부드럽게 가감속.
      const tt = clamp01((p - A_TEXT_END) / (A_TRANS_END - A_TEXT_END));
      const e = easeInOutCubic(tt);
      textWrapRef.current.style.transform = `translate3d(0, ${lerp(g.centerY, 0, e).toFixed(1)}px, 0)`;

      const sw = sliderWrapRef.current;
      sw.style.opacity = e.toFixed(3);
      sw.style.transform = `translate3d(0, ${((1 - e) * 48).toFixed(1)}px, 0)`;
      sw.style.pointerEvents = e > 0.99 ? "auto" : "none";

      // 4) center-focus 가로 스크롤 (dx0 = 시작 중앙 정렬 오프셋)
      const sp = clamp01((p - A_TRANS_END) / (1 - A_TRANS_END));
      const dx = g.dx0 - g.maxX * sp;
      sliderTrackRef.current.style.transform = `translate3d(${dx.toFixed(1)}px, 0, 0)`;
      const cards = cardRefs.current;
      for (let i = 0; i < cards.length; i++) {
        const c = cards[i];
        if (!c) continue;
        const cx = g.cardCx[i] + dx;
        const d = Math.abs(cx - g.focalX) / g.refW;
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
            className="absolute inset-x-0 px-6 md:px-12 lg:px-[120px] xl:px-[260px] will-change-transform"
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
              >
                {LOOP_CARDS.map((card, i) => (
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
                        loading="eager"
                        decoding="async"
                        draggable="false"
                        className="w-full h-full object-cover select-none"
                      />
                    </div>
                    <div className="px-[18px] py-[16px]">
                      <p className="text-[16px] md:text-[18px] font-bold text-[#18181b] tracking-[-0.01em] leading-[1.25]">
                        {card.title}
                      </p>
                      <p className="mt-[7px] text-[12.5px] md:text-[13.5px] leading-[1.55] text-[#71717a] tracking-[-0.003em]">
                        {card.desc}
                      </p>
                    </div>
                  </article>
                ))}
                {/* 끝 여백(lead-out) — 마지막 카드가 레일 중앙까지 도달 (width JS 계산) */}
                <div ref={endSpacerRef} className="flex-none" aria-hidden />
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
