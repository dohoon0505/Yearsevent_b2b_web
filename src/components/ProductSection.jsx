import { useEffect, useLayoutEffect, useRef, useState } from "react";

/**
 * ProductSection — Figma 151:332 (sequence 01~06) + 코멘트 #9·#10·#11
 *
 *   TRACK 640vh / sticky 100vh
 *   [다크(#222): "What kind of Product?" 라임 라벨 + 헤드라인1 scrub
 *      + "비즈니스" 단어 로테이터(#10·#11 — text-scramble-word-rotator-08 md,
 *        마스크 세로 순환: 정지 70% + easeInOutCubic 슬라이드 30%)]
 *   → [헤드라인 교체: "모든 경조사 소식에 발 빠르게 대응합니다"]
 *   → [다크 영역이 캡슐(802×369)로 축소되며 흰 배경 전환(시퀀스 04)]
 *   → [흰 배경 쇼케이스: 좌측 텍스트+CTA 고정, 상품 카드 우→좌 슬라이드
 *      + 커스텀 라벨 커서(#9)]
 *   → [100%: 흰 섹션 좌하단 border-radius → 다음 섹션 배경으로 연결(#9)]
 *
 * 성능: 스크롤 프레임에서 React state 갱신 없이 ref 직접 DOM 기록.
 */

// 단어 로테이터(#10·#11) — text-scramble-word-rotator-08 md 패턴:
//   마스크(1줄 높이, overflow hidden) 안에 단어들 + 첫 단어 클론을 세로로 쌓고,
//   세그먼트당 70% 정지 + 30% easeInOutCubic 슬라이드로 한 칸씩 순환.
//   마스크 폭은 가장 긴 단어로 고정(문장 들썩임 방지), 클론 도착 시 리셋 → 이음새 없음.
const ROT_WORDS = ["비즈니스", "부고소식", "청첩장 소식", "확장소식", "이전소식", "취임소식", "개업소식"];

// 헤드라인1 scrub 토큰 (로테이터 단어 제외)
const PD_H1_WORDS = ["에 필요한", "모든", "경조사", "상품,"];

// 상품 카드 (Figma 199:42~44 — 디자인은 플레이스홀더, 문구만 실카피로 대체)
const PRODUCTS = [
  { title: "대형 관엽화분", desc: "개업·이전 축하의 품격을 높이는 프리미엄 관엽" },
  { title: "근조화환", desc: "깊은 애도의 마음을 정중하게 전하는 근조 3단 화환" },
  { title: "축하화환", desc: "개업·취임·행사의 기쁨을 더하는 축하 3단 화환" },
  { title: "동양란", desc: "변함없는 신뢰의 마음을 전하는 단아한 동양란" },
  { title: "호접란", desc: "공간을 화사하게 밝히는 서양 호접란" },
  { title: "쌀화환", desc: "축하의 마음이 기부로 이어지는 드리미 쌀화환" },
];

const PD_TRACK_VH = 640;
// 인터랙션 임계값 (p ∈ [0,1])
const PD_TEXT_END = 0.14; // 헤드라인1 scrub 완료
const PD_SWAP_AT = 0.18; // 헤드라인1 → 2 교체
const PD_SWAP_DUR = 0.08;
const PD_CAP_AT = 0.32; // 다크 → 캡슐 축소 (시퀀스 04)
const PD_CAP_END = 0.48;
const PD_CAPFADE_DUR = 0.08; // 캡슐 페이드아웃
const PD_SHOW_AT = 0.5; // 쇼케이스 등장
const PD_SHOW_DUR = 0.08;
const PD_CARDS_AT = 0.56; // 카드 우→좌 슬라이드 (#9)
const PD_CARDS_END = 0.94;
const PD_RADIUS_AT = 0.95; // 좌하단 radius (#9)

const LIME = "#e2ef5d";
const DIM_RGB = [108, 114, 130];
const WHITE_RGB = [255, 255, 255];

const clamp01 = (v) => Math.max(0, Math.min(1, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smoothstep = (t) => t * t * (3 - 2 * t);
const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export default function ProductSection() {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const darkLayerRef = useRef(null); // 다크 레이어 (clip-path 캡슐 축소 + 페이드)
  const darkInnerRef = useRef(null); // 다크 콘텐츠 (캡슐 축소 시 scale)
  const h1Ref = useRef(null); // 헤드라인1 (scrub + 로테이터)
  const h2Ref = useRef(null); // 헤드라인2
  const h1WordRefs = useRef([]);
  const rotMaskRef = useRef(null); // 로테이터 마스크 (폭 고정)
  const rotInnerRef = useRef(null); // 로테이터 단어 스택 (translateY 순환)
  const whiteLayerRef = useRef(null); // 흰 레이어 (출구 좌하단 radius)
  const showcaseRef = useRef(null); // 쇼케이스 콘텐츠 (등장)
  const cardsTrackRef = useRef(null); // 카드 트랙 (우→좌 슬라이드)
  const cursorRef = useRef(null); // 커스텀 라벨 커서
  const stageRef = useRef(null);
  const geo = useRef({ vw: 0, vh: 0 });
  const pRef = useRef(0); // 로테이터 게이트용 최신 진행률
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
      { threshold: 0.02 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // ── 단어 로테이터 (#10·#11) — md 패턴: 정지 70% + easeInOutCubic 슬라이드 30%
  useEffect(() => {
    const mask = rotMaskRef.current;
    const inner = rotInnerRef.current;
    const section = sectionRef.current;
    if (!mask || !inner || !section) return;

    // 단어별 실제 폭 측정 — 마스크 폭을 "현재 단어" 폭으로 보간해
    // 단어 길이가 달라도 문장 중앙 정렬이 유지된다(폭 전환은 슬라이드와 동기).
    let widths = [];
    const fit = () => {
      widths = Array.from(inner.children, (c) => c.offsetWidth);
      if (widths[0] > 0) mask.style.width = `${widths[0]}px`;
    };
    fit();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
    window.addEventListener("resize", fit);

    // 모션 최소화 선호 시 첫 단어 고정 (md 권장)
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return () => window.removeEventListener("resize", fit);
    }

    const HOLD = 0.7; // 세그먼트의 70%는 정지(읽기 시간)
    const STEP = 1800; // 단어당 1.8s
    const N = ROT_WORDS.length;
    let visible = false;
    let raf = 0;
    const loop = (now) => {
      raf = 0;
      if (!visible) return;
      // 헤드라인 교체 후에는 회전 정지 (마지막 위치 유지)
      if (pRef.current < PD_SWAP_AT + PD_SWAP_DUR) {
        const t = (now % (STEP * N)) / STEP; // 0..N — 마지막 칸 = 첫 단어 클론
        const idx = Math.floor(t);
        const segP = t - idx;
        const slide = segP < HOLD ? 0 : easeInOutCubic((segP - HOLD) / (1 - HOLD));
        inner.style.transform = `translateY(${(-(idx + slide) * 1.5).toFixed(4)}em)`;
        // 마스크 폭: 현재 단어 → 다음 단어 폭으로 슬라이드와 동기 보간(문장 재중앙)
        if (widths.length) {
          const w0 = widths[idx] || 0;
          const w1 = widths[idx + 1] != null ? widths[idx + 1] : w0;
          mask.style.width = `${(w0 + (w1 - w0) * slide).toFixed(1)}px`;
        }
      }
      raf = requestAnimationFrame(loop);
    };
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !raf) raf = requestAnimationFrame(loop);
      },
      { threshold: 0 },
    );
    io.observe(section);
    return () => {
      io.disconnect();
      window.removeEventListener("resize", fit);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  useLayoutEffect(() => {
    let ticking = false;

    const measure = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      // 캡슐(802×369 @1920) — 화면 정중앙
      const capW = Math.min(vw * 0.8, Math.max(520, vw * 0.418));
      const capH = capW * (369 / 802);
      const cap = { x: (vw - capW) / 2, y: (vh - capH) / 2, w: capW, h: capH };
      // 카드 슬라이드 종점 — 마지막 카드가 화면 우측에 닿도록
      const track = cardsTrackRef.current;
      let slideEnd = 0;
      let cardsLeft = vw * 0.42;
      if (track) {
        const parentRect = track.parentElement.getBoundingClientRect();
        cardsLeft = parentRect.left;
        const visibleW = vw - cardsLeft;
        slideEnd = Math.min(0, visibleW - track.scrollWidth - vw * 0.02);
      }
      geo.current = { vw, vh, cap, slideEnd, slideStart: vw * 0.32 };
    };

    const update = () => {
      ticking = false;
      const node = trackRef.current;
      if (!node) return;
      if (window.innerWidth !== geo.current.vw || window.innerHeight !== geo.current.vh)
        measure();
      const g = geo.current;
      const rect = node.getBoundingClientRect();
      const max = Math.max(1, rect.height - g.vh);
      const p = clamp01(-rect.top / max);
      pRef.current = p;

      // 1) 헤드라인1 scrub — DIM → WHITE (로테이터 단어는 항상 라임)
      const reveal = clamp01(p / PD_TEXT_END);
      const litAmt = clamp01((reveal - 0.05) / 0.9);
      const pos = litAmt * (PD_H1_WORDS.length + 1);
      const words = h1WordRefs.current;
      for (let i = 0; i < words.length; i++) {
        const el = words[i];
        if (!el) continue;
        const wf = smoothstep(clamp01((pos - i) / 1.6));
        const r = Math.round(DIM_RGB[0] + (WHITE_RGB[0] - DIM_RGB[0]) * wf);
        const gg = Math.round(DIM_RGB[1] + (WHITE_RGB[1] - DIM_RGB[1]) * wf);
        const b = Math.round(DIM_RGB[2] + (WHITE_RGB[2] - DIM_RGB[2]) * wf);
        const c = `rgb(${r}, ${gg}, ${b})`;
        if (el.dataset.c !== c) {
          el.style.color = c;
          el.dataset.c = c;
        }
      }

      // 2) 헤드라인1 → 2 교체
      const s = smoothstep(clamp01((p - PD_SWAP_AT) / PD_SWAP_DUR));
      if (h1Ref.current) {
        h1Ref.current.style.opacity = (1 - s).toFixed(3);
        h1Ref.current.style.transform = `translate3d(0, ${(-s * 28).toFixed(1)}px, 0)`;
      }
      if (h2Ref.current) {
        h2Ref.current.style.opacity = s.toFixed(3);
        h2Ref.current.style.transform = `translate3d(0, ${((1 - s) * 28).toFixed(1)}px, 0)`;
      }

      // 3) 다크 → 캡슐 축소 (시퀀스 04) → 페이드아웃
      const capT = smoothstep(clamp01((p - PD_CAP_AT) / (PD_CAP_END - PD_CAP_AT)));
      const cap = g.cap;
      const top = lerp(0, cap.y, capT);
      const left = lerp(0, cap.x, capT);
      const right = lerp(0, g.vw - cap.x - cap.w, capT);
      const bottom = lerp(0, g.vh - cap.y - cap.h, capT);
      const rad = lerp(0, cap.h / 2, capT);
      // capT=0이면 clip 해제(none) — inset(0)의 안티앨리어싱 경계로 아래 밝은
      // 레이어가 1px 비치는 헤어라인(섹션 경계 흰 선) 방지.
      const clip =
        capT <= 0
          ? "none"
          : `inset(${top.toFixed(1)}px ${right.toFixed(1)}px ${bottom.toFixed(1)}px ${left.toFixed(1)}px round ${rad.toFixed(1)}px)`;
      const dark = darkLayerRef.current;
      if (dark) {
        if (dark.dataset.clip !== clip) {
          dark.style.clipPath = clip;
          dark.dataset.clip = clip;
        }
        dark.style.opacity = (1 - clamp01((p - PD_CAP_END) / PD_CAPFADE_DUR)).toFixed(3);
      }
      if (darkInnerRef.current)
        darkInnerRef.current.style.transform = `scale(${lerp(1, 0.66, capT).toFixed(4)})`;

      // 4) 쇼케이스 등장 + 카드 우→좌 슬라이드 (#9)
      const sIn = smoothstep(clamp01((p - PD_SHOW_AT) / PD_SHOW_DUR));
      if (showcaseRef.current) {
        showcaseRef.current.style.opacity = sIn.toFixed(3);
        showcaseRef.current.style.transform = `translate3d(0, ${((1 - sIn) * 40).toFixed(1)}px, 0)`;
      }
      const cT = easeInOutCubic(clamp01((p - PD_CARDS_AT) / (PD_CARDS_END - PD_CARDS_AT)));
      if (cardsTrackRef.current)
        cardsTrackRef.current.style.transform = `translate3d(${lerp(g.slideStart, g.slideEnd, cT).toFixed(1)}px, 0, 0)`;

      // 5) 출구 — 흰 레이어 좌하단 radius (#9)
      const exitT = smoothstep(clamp01((p - PD_RADIUS_AT) / (1 - PD_RADIUS_AT)));
      const R = lerp(0, Math.max(120, Math.min(200, g.vw * 0.105)), exitT);
      const wClip = exitT <= 0 ? "none" : `inset(0px round 0px 0px 0px ${R.toFixed(1)}px)`;
      const wl = whiteLayerRef.current;
      if (wl && wl.dataset.clip !== wClip) {
        wl.style.clipPath = wClip;
        wl.dataset.clip = wClip;
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
      onScroll();
    };
    measure();
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
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

  // 커스텀 라벨 커서(#9) — 카드 영역에서 커서를 따라다니는 라벨
  const onCardsMove = (e) => {
    const cur = cursorRef.current;
    const stage = stageRef.current;
    if (!cur || !stage) return;
    const r = stage.getBoundingClientRect();
    cur.style.transform = `translate3d(${(e.clientX - r.left).toFixed(0)}px, ${(e.clientY - r.top).toFixed(0)}px, 0) translate(-50%, -50%)`;
  };
  const onCardsEnter = () => {
    if (cursorRef.current) cursorRef.current.style.opacity = "1";
  };
  const onCardsLeave = () => {
    if (cursorRef.current) cursorRef.current.style.opacity = "0";
  };

  const labelLime = (
    <p
      className="font-bold tracking-[-0.01em] inline-flex items-center gap-[8px]"
      style={{ fontSize: "clamp(15px, 1.05vw, 20px)", color: LIME }}
    >
      <span>What kind of Product?</span>
      <span aria-hidden className="inline-block w-[9px] h-[9px] rounded-full" style={{ background: LIME }} />
    </p>
  );

  return (
    <section ref={sectionRef} aria-label="상품 소개" className="relative bg-[#222]">
      {/* 데스크톱(lg+) — Figma 151:332 시퀀스 */}
      <div className="hidden lg:block">
        <div ref={trackRef} style={{ height: `${PD_TRACK_VH}vh` }} className="relative">
          <div
            ref={stageRef}
            className="sticky top-0 h-screen w-full overflow-hidden"
            style={{ "--pd-pad": "clamp(28px, 7.8vw, 150px)" }}
          >
            {/* 0) 최하단 — 다음 섹션 모티프(글로시 블루) : 출구 radius에서 드러남 */}
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(160deg, #eef3fa 0%, #dde9f8 45%, #c6dcf6 75%, #b5d2f4 100%)",
              }}
            />

            {/* 1) 흰 레이어 — 쇼케이스. 출구에서 좌하단 radius (#9) */}
            <div
              ref={whiteLayerRef}
              className="absolute inset-0 bg-white will-change-[clip-path]"
            >
              <div
                ref={showcaseRef}
                className="absolute inset-0 will-change-transform"
                style={{ opacity: 0 }}
              >
                {/* 좌측 고정 텍스트 + CTA (Figma 199:31) */}
                <div
                  className="absolute z-10 flex flex-col justify-between"
                  style={{
                    left: "var(--pd-pad)",
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: "clamp(300px, 22.5vw, 431px)",
                    height: "clamp(420px, 60vh, 650px)",
                  }}
                >
                  <div>
                    <p className="text-[var(--color-brand-red)] font-bold tracking-[-0.01em] inline-flex items-center gap-[8px]"
                      style={{ fontSize: "clamp(14px, 0.95vw, 18px)" }}
                    >
                      <span>All Products Nationwide</span>
                      <span aria-hidden className="inline-block w-[9px] h-[9px] rounded-full bg-[var(--color-brand-red)]" />
                    </p>
                    <h2
                      className="mt-[18px] xl:mt-[24px] text-[#222] font-bold leading-[1.45] tracking-[-0.02em]"
                      style={{ fontSize: "clamp(34px, 3.2vw, 62px)" }}
                    >
                      경조사 소식을
                      <br />
                      공유 해주세요 :)
                    </h2>
                    <p
                      className="mt-[16px] xl:mt-[22px] text-[#888] leading-[1.6]"
                      style={{ fontSize: "clamp(14px, 0.95vw, 18px)" }}
                    >
                      기업에게, 대표님에게 발생하는 경조사 소식을
                      <br />
                      10년 경력의 노하우로 발 빠르게 대응 해드리고 있어요
                    </p>
                  </div>
                  <button
                    type="button"
                    className="self-start inline-flex items-center gap-[10px] rounded-full bg-[var(--color-brand-red)] text-white font-semibold transition-transform duration-300 hover:-translate-y-[2px]"
                    style={{
                      padding: "clamp(14px, 1.1vw, 18px) clamp(22px, 1.7vw, 30px)",
                      fontSize: "clamp(14px, 1vw, 19px)",
                    }}
                  >
                    <span>상품가이드 더 살펴보기</span>
                    <span aria-hidden>→</span>
                  </button>
                </div>

                {/* 우측 카드 뷰포트 — 우→좌 슬라이드 + 커스텀 라벨 커서 (#9) */}
                <div
                  className="absolute inset-y-0 right-0 overflow-hidden cursor-none"
                  style={{ left: "calc(var(--pd-pad) + clamp(300px, 22.5vw, 431px) + clamp(28px, 2.6vw, 50px))" }}
                  onMouseMove={onCardsMove}
                  onMouseEnter={onCardsEnter}
                  onMouseLeave={onCardsLeave}
                >
                  <div
                    ref={cardsTrackRef}
                    className="absolute top-1/2 left-0 will-change-transform"
                    style={{ transform: "translate3d(32vw, 0, 0)" }}
                  >
                    <div className="flex items-start gap-[clamp(28px,2.6vw,50px)] -translate-y-1/2">
                      {PRODUCTS.map((prod, i) => (
                        <article
                          key={i}
                          className="relative shrink-0 rounded-[24px] bg-[#f7f7f8] flex flex-col justify-end"
                          style={{
                            width: "clamp(320px, 26vw, 500px)",
                            height: "clamp(420px, 60vh, 650px)",
                            padding: "clamp(22px, 1.8vw, 34px)",
                            marginTop: i % 2 === 1 ? "clamp(30px, 6vh, 65px)" : "0px",
                          }}
                        >
                          <p
                            className="text-[#222] font-bold tracking-[-0.01em]"
                            style={{ fontSize: "clamp(19px, 1.45vw, 26px)" }}
                          >
                            {prod.title}
                          </p>
                          <p
                            className="mt-[10px] text-[#888] leading-[1.5]"
                            style={{ fontSize: "clamp(13px, 0.85vw, 16px)" }}
                          >
                            {prod.desc}
                          </p>
                        </article>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2) 다크 레이어 — 라벨 + 헤드라인. 캡슐로 축소(시퀀스 04) 후 페이드아웃 */}
            <div
              ref={darkLayerRef}
              className="absolute inset-0 bg-[#222] will-change-[clip-path]"
              style={{ opacity: ready ? 1 : 0, transition: "opacity .6s ease-out" }}
            >
              <div
                ref={darkInnerRef}
                className="absolute inset-0 flex flex-col items-center justify-center will-change-transform"
              >
                {labelLime}
                {/* 헤드라인 스택 — 1(로테이터) ↔ 2 교체 */}
                <div className="relative mt-[20px] xl:mt-[26px] w-full">
                  <h2
                    ref={h1Ref}
                    className="font-bold leading-[1.5] tracking-[-0.02em] text-center will-change-transform"
                    style={{ fontSize: "clamp(34px, 3.1vw, 60px)" }}
                  >
                    <span className="block whitespace-nowrap">
                      {/* 로테이터 마스크 — 1줄 높이로 클립, 단어 스택이 위로 순환.
                          폭은 현재 단어 폭으로 보간(슬라이드와 동기) → 단어 길이가
                          달라도 조사("에")가 붙고 문장 중앙 정렬 유지 */}
                      <span
                        ref={rotMaskRef}
                        className="inline-block overflow-hidden align-bottom"
                        style={{ height: "1.5em" }}
                      >
                        <span ref={rotInnerRef} className="block will-change-transform">
                          {[...ROT_WORDS, ROT_WORDS[0]].map((w, i) => (
                            <span
                              key={i}
                              className="block whitespace-pre"
                              style={{ height: "1.5em", color: LIME, width: "max-content" }}
                            >
                              {w}
                            </span>
                          ))}
                        </span>
                      </span>
                      <span
                        ref={(el) => (h1WordRefs.current[0] = el)}
                        className="inline-block whitespace-pre"
                        style={{ color: "rgb(108, 114, 130)" }}
                      >
                        에 필요한
                      </span>
                    </span>
                    <span className="block whitespace-nowrap">
                      {["모든 ", "경조사 ", "상품,"].map((t, i) => (
                        <span
                          key={i}
                          ref={(el) => (h1WordRefs.current[i + 1] = el)}
                          className="inline-block whitespace-pre"
                          style={{ color: "rgb(108, 114, 130)" }}
                        >
                          {t}
                        </span>
                      ))}
                    </span>
                  </h2>
                  <h2
                    ref={h2Ref}
                    aria-hidden
                    className="absolute inset-x-0 top-0 font-bold leading-[1.5] tracking-[-0.02em] text-center will-change-transform"
                    style={{ fontSize: "clamp(34px, 3.1vw, 60px)", opacity: 0 }}
                  >
                    <span className="block whitespace-nowrap text-white">모든 경조사 소식에</span>
                    <span className="block whitespace-nowrap">
                      <span style={{ color: LIME }}>발 빠르게 </span>
                      <span className="text-white">대응합니다</span>
                    </span>
                  </h2>
                </div>
              </div>
            </div>

            {/* 3) 커스텀 라벨 커서 (#9) — 카드 영역 한정 표시 */}
            <div
              ref={cursorRef}
              aria-hidden
              className="absolute top-0 left-0 z-50 pointer-events-none inline-flex items-center gap-[8px] rounded-full bg-[#222] text-white font-bold px-[16px] py-[10px] text-[12px] tracking-[0.14em] uppercase transition-opacity duration-200"
              style={{ opacity: 0, transform: "translate3d(-200px, -200px, 0)" }}
            >
              <span aria-hidden className="inline-block w-[7px] h-[7px] rounded-full" style={{ background: LIME }} />
              <span>Scroll</span>
            </div>
          </div>
        </div>
      </div>

      {/* 모바일(<lg) — 정적 스택 */}
      <div className="lg:hidden bg-white">
        {/* 다크 캡슐 헤드 */}
        <div className="px-6 md:px-12 pt-[56px]">
          <div className="rounded-[28px] bg-[#222] px-[26px] py-[44px] flex flex-col items-center text-center gap-[14px]">
            {labelLime}
            <h2 className="text-white font-bold text-[26px] md:text-[34px] leading-[1.5] tracking-[-0.02em]">
              모든 경조사 소식에
              <br />
              <span style={{ color: LIME }}>발 빠르게</span> 대응합니다
            </h2>
          </div>
        </div>
        {/* 쇼케이스 */}
        <div className="px-6 md:px-12 py-[56px] flex flex-col gap-[28px]">
          <div>
            <p className="text-[var(--color-brand-red)] font-bold text-[14px] inline-flex items-center gap-[8px]">
              <span>All Products Nationwide</span>
              <span aria-hidden className="inline-block w-[8px] h-[8px] rounded-full bg-[var(--color-brand-red)]" />
            </p>
            <h2 className="mt-[12px] text-[#222] font-bold text-[28px] md:text-[36px] leading-[1.45] tracking-[-0.02em]">
              경조사 소식을
              <br />
              공유 해주세요 :)
            </h2>
            <p className="mt-[12px] text-[#888] text-[14px] leading-[1.6]">
              기업에게, 대표님에게 발생하는 경조사 소식을 10년 경력의 노하우로 발 빠르게 대응 해드리고 있어요
            </p>
          </div>
          <div className="grid grid-cols-2 gap-[14px]">
            {PRODUCTS.slice(0, 4).map((prod, i) => (
              <div key={i} className="rounded-[18px] bg-[#f7f7f8] p-[18px] flex flex-col justify-end aspect-[10/12]">
                <p className="text-[#222] font-bold text-[16px]">{prod.title}</p>
                <p className="mt-[6px] text-[#888] text-[12px] leading-[1.5]">{prod.desc}</p>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="self-start inline-flex items-center gap-[10px] rounded-full bg-[var(--color-brand-red)] text-white font-semibold px-[24px] py-[15px] text-[15px]"
          >
            <span>상품가이드 더 살펴보기</span>
            <span aria-hidden>→</span>
          </button>
        </div>
      </div>
    </section>
  );
}
