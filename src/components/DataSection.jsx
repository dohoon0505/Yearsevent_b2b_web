import { useEffect, useLayoutEffect, useRef, useState } from "react";
import obituary from "../assets/Obituary.jpg";
import obituary2 from "../assets/Obituary_2.jpg";
import marriage from "../assets/marriage.jpg";
import marriage2 from "../assets/marriage_2.jpg";
import inauguration from "../assets/inauguration.jpg";
import expansionRelocation from "../assets/Expansion relocation.jpg";
import opening from "../assets/Opening.jpg";
import opening2 from "../assets/Opening_2.jpg";
import promotion from "../assets/promotion.jpg";
import childbirth from "../assets/childbirth.jpg";
import childbirth2 from "../assets/childbirth_2.jpg";
import employees from "../assets/Employees.jpg";

/**
 * DataSection — About Us(다단계 sticky 무대) + For Business(scrub 슬로건)
 *
 * ┌─ About Us  (TRACK 600vh / sticky 100vh 무대)
 * │   progress 구간:
 * │     [0 ~ 0.22]  텍스트 단어 scrub reveal (중앙 정렬)
 * │     [0.22~0.34] 텍스트가 상단(top padding 120)으로 이동 + 이미지 슬라이더 등장
 * │     [0.34~1.0 ] center-focus 가로 이미지 슬라이더 (첨부 md 패턴)
 * │   → 텍스트 + 슬라이더는 100vh 안에 공존, 100% 도달 시 sticky 해제
 * └─ For Business (TRACK 600vh / sticky 150vh) — Figma 7단계 시퀀스 + count-up + 경고 pulse
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

// 새 슬로건 (Figma 100:22): "저희는 성공적인 비즈니스를 / 서포트하는 기업입니다."
// 비즈니스, 서포트는 accent(brand-red)
const BUSINESS_LINES = [
  [
    { text: "저희는", tone: "dark" },
    { text: "성공적인", tone: "dark" },
    { text: "비즈니스", tone: "accent", noSpace: true },
    { text: "를", tone: "dark" },
  ],
  [
    { text: "서포트", tone: "accent", noSpace: true },
    { text: "하는", tone: "dark" },
    { text: "기업입니다.", tone: "dark" },
  ],
];

// About 슬로건 단어를 전역 인덱스와 함께 평탄화 (ref 직접 색 제어용)
let _gi = 0;
const ABOUT_FLAT = ABOUT_LINES.map((line) =>
  line.map((w) => ({ ...w, gi: _gi++ })),
);
const TOTAL_ABOUT = _gi;

// For Business 슬로건 평탄화(연속 스크럽용)
let _gb = 0;
const BUSINESS_FLAT = BUSINESS_LINES.map((line) =>
  line.map((w) => ({ ...w, gi: _gb++ })),
);
const TOTAL_BUSINESS = _gb;

// For Business — DATA 통계 (Figma)
// target: count-up 목표값, suffix: 값 뒤에 붙는 문자 (예: 2016~ / 200+ / 700,000+)
// 카운트업: floor(p * target).toLocaleString("ko-KR") + suffix — linear-count.md 패턴
const FB_STATS = [
  { title: "설립일", sub: "2016년 설립, 2018년 인수합병", target: 2016, suffix: "~", noComma: true },
  { title: "누적 주문처리 수", sub: "일 평균 178건의 주문접수", target: 700000, suffix: "+" },
  { title: "오직 생화 매출", sub: "신뢰할 수 있는 정량적 데이터", target: 15, suffix: "억+" },
  { title: "경조사 제휴기업", sub: "소규모의 기업부터, 관공서까지", target: 200, suffix: "+" },
];

// 카운트업 포맷 — 목표값×진행률을 ko-KR 콤마 포맷 + suffix
//   noComma: 설립일(연도)처럼 천단위 콤마가 어색한 값은 콤마 없이 출력 (2,016~ 아님 → 2016~)
const formatCount = (progress, target, suffix, noComma) => {
  const n = Math.floor(progress * target);
  return `${noComma ? n : n.toLocaleString("ko-KR")}${suffix}`;
};

// For Business — Partner 제휴 기업 칩 (행별 마퀴, 좌/우 교차)
const FB_PARTNERS = [
  ["다산중공업", "세종대학교", "우리은행", "DB손해보험", "삼성전자", "LG디스플레이", "현대자동차"],
  ["법무법인 율촌", "김앤장 법률사무소", "교보생명", "한화생명", "법무법인 로고스", "법무법인 바른"],
  ["세종텔레콤", "SK텔레콤", "(주)화현메디칼", "성은실버케어스", "우리은행", "현대자동차"],
  ["삼성전자", "LG디스플레이", "DB손해보험", "교보생명", "법무법인 바른", "세종대학교"],
];

// For Business 다단계 무대 — Figma 7개 노드 시퀀스 매핑
// 100:22 → 103:664 → 103:773 → 103:879 → 103:909 → 103:1022 → 103:588
const FB_TRACK_VH = 600;
const FB_TOP_PAD = 120;
// 인터랙션 임계값 (스크롤 진행률 p ∈ [0, 1])
const FB_TEXT_END = 0.14; // 슬로건 단어 scrub 완료 (100:22)
const FB_SHIFT_END = 0.22; // 텍스트 가로 중앙 → 좌측 이동 완료 (→ 103:664)
const FB_RISE_END = 0.3; // 컨텐츠 세로 중앙 → 상단 정렬 완료 (DATA 등장 전)
const FB_DATA_1_END = 0.4; // 설립일/2016~ count-up
const FB_DATA_2_END = 0.5; // 누적 주문처리 수/700,000+ count-up
const FB_DATA_3_END = 0.6; // 오직 생화 매출/15억+ count-up
const FB_DATA_4_END = 0.7; // 경조사 제휴기업/200+ count-up
const FB_PARTNER_END = 0.82; // Partner Frame 하단→상단 슬라이드 (→ 103:1022)
const FB_WARN_END = 0.92; // 경고 버튼 페이드인 + pulse 트리거 (→ 103:588)

const DIM = "#d4d8e2";
// 연속 스크럽 색 보간용 RGB (DIM↔DARK / DIM↔ACCENT)
const DIM_RGB = [212, 216, 226];
const DARK_RGB = [34, 34, 34];
const smoothstep = (t) => t * t * (3 - 2 * t);

// About Us 이미지 슬라이더 — 카드명에 맞춘 이미지. imgs 후보가 2개 이상이면 랜덤 1개 선택.
const SLIDER_CARDS = [
  {
    imgs: [obituary, obituary2],
    title: "부고장 수령",
    desc: "가장 힘든 순간에 전하는 위로가, 가장 깊은 신뢰로 남습니다.",
  },
  {
    imgs: [marriage, marriage2],
    title: "청첩장 수령",
    desc: "거래처의 기쁜 날, 귀사의 이름이 담긴 아름다운 축복을 더해주세요.",
  },
  {
    imgs: [inauguration],
    title: "이·취임식",
    desc: "새로운 리더의 탄생, 귀사의 든든한 지지를 가장 먼저 보여주세요.",
  },
  {
    imgs: [expansionRelocation],
    title: "확장·이전",
    desc: "파트너의 성장은 곧 귀사의 기회입니다. 더 큰 도약을 응원 해주세요.",
  },
  {
    imgs: [opening, opening2],
    title: "개업축하",
    desc: "파트너의 새로운 시작, 첫인상이 평생의 비즈니스를 좌우합니다.",
  },
  {
    imgs: [promotion],
    title: "승진 · 영전",
    desc: "핵심 파트너의 성취를 축하하는 것, 가장 확실한 네트워킹의 완성입니다.",
  },
  {
    imgs: [childbirth, childbirth2],
    title: "출산·득남·득녀",
    desc: "비즈니스를 넘어 가족의 기쁨까지 챙기는 세심함, 진정한 신뢰의 증거입니다.",
  },
  {
    imgs: [employees],
    title: "임직원 경조사",
    desc: "‘우리를 챙겨주는 든든한 회사’라는 자부심, 꼼꼼한 경조사 지원에서 출발합니다.",
  },
];

// 흩어진(scattered) 패럴랙스 갤러리 — 카드마다 높이(hf)·세로 오프셋(oy)·깊이(depth)가 달라
// 가로 스크롤 시 카드별로 다른 속도(depth)로 이동 → 레이어가 분리되는 깊이감(패럴랙스).
//   hf    : 최대 카드 높이 대비 비율 (박스 높이 제각각)
//   oy    : 뷰포트 높이 대비 세로 오프셋 (중앙 기준 위/아래로 흩어짐)
//   depth : 가로 이동 속도 배수 (클수록 빠르게=가깝게 보임)
const CARD_LAYOUT = [
  { hf: 0.66, oy: -0.03, depth: 1.12 },
  { hf: 0.84, oy: 0.11, depth: 0.92 },
  { hf: 0.72, oy: -0.12, depth: 1.06 },
  { hf: 1.0, oy: 0.02, depth: 0.86 },
  { hf: 0.54, oy: 0.16, depth: 1.18 },
  { hf: 0.88, oy: -0.07, depth: 0.95 },
  { hf: 0.7, oy: 0.13, depth: 1.09 },
  { hf: 0.94, oy: -0.02, depth: 0.9 },
];
// 카드별로 후보 이미지 중 1개를 랜덤 선택(페이지 로드 1회 고정).
const PARALLAX_CARDS = SLIDER_CARDS.map((c, i) => ({
  ...c,
  img: c.imgs[Math.floor(Math.random() * c.imgs.length)],
  ...CARD_LAYOUT[i % CARD_LAYOUT.length],
}));

// ───────── About Us 다단계 무대 ─────────
const A_TRACK_VH = 460;
const A_TEXT_END = 0.32; // 텍스트 scrub 완료 (~1화면)
const A_TRANS_END = 0.52; // 텍스트 상단 이동 + 슬라이더 등장 완료 (전환 구간 ↑ 매끄럽게)
const A_TOP_PAD = 120; // 상단 padding 120 (요구사항)
const A_GAP = 36; // 텍스트 ↔ 슬라이더 간격
const A_BOTTOM_PAD = 48; // 카드 +15% 확대에 따라 하단 여백 축소 (72 → 48)
const A_CARD_MAXH = 530; // 460 → 530 (+15% 확대)
const A_RAIL_GAP = 44; // 흩어진 박스 가로 간격
const A_RAIL_PAD = 24; // 레일 좌측 시작 여백

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
  const cardRefs = useRef([]);
  const geo = useRef({ vh: 0, centerY: 0, maxX: 0, baseX: [], baseY: [] });
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
      const sw = sliderWrapRef.current;
      if (!tw || !vp || !sw) return;

      const textH = tw.offsetHeight;
      const sliderTop = A_TOP_PAD + textH + A_GAP;
      const sliderH = Math.max(160, vh - sliderTop - A_BOTTOM_PAD);
      const cardMaxH = Math.min(sliderH, A_CARD_MAXH);
      const cardW = Math.round(cardMaxH * 0.6); // 폭은 고정, 높이만 카드별로 변동

      sw.style.top = `${sliderTop}px`;
      vp.style.height = `${sliderH}px`;

      // 카드별 높이(hf)·세로 오프셋(oy) 적용 + baseX/baseY 좌표 캐시.
      // baseX: 가로 레일 위 정지 좌표(sp=0). baseY: 세로 흩어짐 위치.
      const baseX = [];
      const baseY = [];
      cardRefs.current.forEach((c, i) => {
        if (!c) return;
        const lay = PARALLAX_CARDS[i] || { hf: 0.8, oy: 0 };
        const cardH = Math.round(lay.hf * cardMaxH);
        c.style.height = `${cardH}px`;
        c.style.width = `${cardW}px`;
        baseX[i] = A_RAIL_PAD + i * (cardW + A_RAIL_GAP);
        baseY[i] = (sliderH - cardH) / 2 + lay.oy * sliderH;
      });

      const vpW = vp.clientWidth;
      const n = PARALLAX_CARDS.length;
      const contentW = A_RAIL_PAD + n * cardW + (n - 1) * A_RAIL_GAP;
      const minDepth = Math.min(...PARALLAX_CARDS.map((c) => c.depth));
      // 가장 느린(min depth) 카드도 콘텐츠 끝까지 통과하도록 maxX 보정 → 마지막 박스 노출.
      const maxX = Math.max(0, (contentW - vpW + cardW * 0.5) / minDepth);
      geo.current = {
        vh,
        centerY: (vh - textH) / 2 - A_TOP_PAD,
        maxX,
        baseX,
        baseY,
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

      // 4) 흩어진 박스 가로 스크롤 패럴랙스 — 카드마다 depth 배수로 이동량이 달라
      //    레이어가 분리되는 깊이감. 가까운 카드(depth↑)는 빠르게, 먼 카드는 느리게 흐른다.
      const sp = clamp01((p - A_TRANS_END) / (1 - A_TRANS_END));
      const cards = cardRefs.current;
      for (let i = 0; i < cards.length; i++) {
        const c = cards[i];
        if (!c) continue;
        const lay = PARALLAX_CARDS[i];
        const x = (g.baseX[i] || 0) - g.maxX * sp * (lay ? lay.depth : 1);
        // 세로 미세 드리프트 — depth에 비례해 살짝 떠올라 깊이감 보강.
        const y = (g.baseY[i] || 0) - (lay ? (lay.depth - 1) * 24 * sp : 0);
        c.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
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

          {/* 흩어진 박스 패럴랙스 갤러리 — 카드 절대배치 + transform JS 제어 (full-bleed) */}
          <div
            ref={sliderWrapRef}
            className="absolute inset-x-0 will-change-transform"
            style={{ top: `${A_TOP_PAD}px`, opacity: 0 }}
            aria-label="회사 소개 갤러리"
          >
            <div
              ref={sliderViewportRef}
              className="relative w-full overflow-hidden"
            >
              {PARALLAX_CARDS.map((card, i) => (
                <article
                  key={i}
                  ref={(el) => (cardRefs.current[i] = el)}
                  className="absolute top-0 left-0 flex flex-col rounded-[16px] bg-white border border-[#ececec] overflow-hidden will-change-transform"
                  style={{ boxShadow: "0 10px 30px -12px rgba(0,0,0,0.18)" }}
                >
                  <div className="relative flex-1 min-h-0 overflow-hidden bg-[#e5e5e5]">
                    <img
                      src={card.img}
                      alt=""
                      loading="eager"
                      decoding="async"
                      draggable="false"
                      className="w-full h-full object-cover select-none"
                    />
                    {/* 하단 그라데이션 + 캡션 오버레이 (높이 제각각이라 본문은 생략) */}
                    <div className="absolute inset-x-0 bottom-0 px-[16px] pb-[14px] pt-[40px] bg-gradient-to-t from-black/70 via-black/25 to-transparent">
                      <p className="text-[15px] md:text-[17px] font-bold text-white tracking-[-0.01em] leading-[1.25]">
                        {card.title}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * ForBusinessStage — Figma 7-노드 시퀀스 (100:22 → 103:588)
 *   1) [0~0.14] 슬로건 단어 scrub (가로+세로 중앙)
 *   2) [0.14~0.22] 텍스트 가로 중앙 → 좌측 컬럼으로 이동
 *   3) [0.22~0.32] 우측 DATA frame + 설립일 count-up (0~ → 2016~)
 *   4) [0.32~0.42] 경조사 제휴기업 count-up (0+ → 200+)
 *   5) [0.42~0.55] 누적 주문처리 수 count-up (0+ → 700,000+) + 컨텐츠 세로 중앙→상단
 *   6) [0.55~0.72] Partner Frame 하단에서 슬라이드 업 (좌측 하단)
 *   7) [0.72~0.86] 경고 버튼 페이드인 + pulse 2회 (attention-grab)
 * 레이아웃: 좌 (For Business 라벨 + 슬로건 + 경고 버튼 + Partner Frame) | 우 (DATA 3 entries)
 * 2 Attention-grabs:
 *   ① Count-up 시퀀스 (3개 숫자 0 → target)
 *   ② Warning 버튼 등장 pulse 2회 (.fb-warn-pulse CSS)
 */
function ForBusinessStage() {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const wordRefs = useRef([]);
  const textWrapRef = useRef(null);
  const headRef = useRef(null); // For Business 라벨+슬로건 (경고 버튼 제외) — 세로 중앙 정렬 기준
  const lineRefs = useRef([]); // [라벨, 슬로건1, 슬로건2] — center↔left 정렬 보간용
  const dataRef = useRef(null);
  const dataItemRefs = useRef([]);
  const dataValueRefs = useRef([]); // count-up <p> 엘리먼트
  const partnerRef = useRef(null);
  const warnRef = useRef(null);
  const accentRGBRef = useRef([203, 13, 53]);
  // centerX: 가로 중앙 정렬 오프셋, centerY: 세로 중앙 정렬 오프셋
  const geo = useRef({ vh: 0, centerX: 0, centerY: 0 });
  const warnTriggeredRef = useRef(false);
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

  useLayoutEffect(() => {
    let ticking = false;

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

    // 측정 — 텍스트 가로/세로 중앙(centerX/Y) + Partner Frame 좌측 하단 절대 위치
    const measure = () => {
      const vh = window.innerHeight;
      const tw = textWrapRef.current;
      const dataEl = dataRef.current;
      const partnerEl = partnerRef.current;
      if (!tw || !dataEl) return;
      const headEl = headRef.current;
      // 세로 중앙(시퀀스 01): 헤드(For Business 라벨+슬로건)만 viewport 정중앙 기준.
      //   경고 버튼은 시퀀스 07에서만 보이므로 중앙 정렬 계산에서 제외 → 슬로건이 정확히 중앙.
      const headH = headEl ? headEl.offsetHeight : tw.offsetHeight;
      const headW = headEl ? headEl.offsetWidth : tw.offsetWidth;
      const centerY = Math.max(0, (vh - headH) / 2 - FB_TOP_PAD);
      // 가로 중앙(시퀀스 01): 헤드 실제 폭 기준으로 inner 영역 정중앙에 배치.
      //   inner div는 좌우 대칭 마진(mx) → inner 중앙 = 화면 중앙. centerX = 헤드를 그 중앙으로 미는 양.
      const innerW = tw.parentElement ? tw.parentElement.clientWidth : 0;
      const centerX = Math.max(0, (innerW - headW) / 2);
      // 줄별 center 오프셋: 시퀀스 01에서 각 줄(라벨·슬로건1·슬로건2)을 헤드 폭 안에서 가운데로.
      //   text-align:center 효과를 transform으로 — (headW - 줄폭)/2 만큼 우측 이동, 시퀀스 02(left)에선 0.
      const lineOffsets = lineRefs.current.map((el) =>
        el ? (headW - el.offsetWidth) / 2 : 0,
      );
      // Partner Frame은 viewport 하단 (sticky pin 동안 보이는 100vh 안)
      // partnerTop = vh - FB_TOP_PAD - partnerH (좌측 컬럼의 viewport bottom 정렬)
      const partnerH = partnerEl ? partnerEl.offsetHeight : 0;
      const partnerTop = Math.max(FB_TOP_PAD, vh - FB_TOP_PAD - partnerH);
      if (partnerEl) partnerEl.style.top = `${partnerTop}px`;
      // 좌우 정렬(시퀀스 07): DATA를 [슬로건 상단 ~ 로고슬라이더 하단] 범위에 stretch + justify-between.
      //   → 첫 항목(설립일) 상단 = 슬로건 상단, 마지막 항목(경조사) 하단 = 로고슬라이더 하단.
      //   sloganOffset = headRef 안 h2(슬로건)의 offsetTop(라벨+간격) → "For Business" 라벨은 그 위로 남음.
      const h2El = headEl ? headEl.querySelector("h2") : null;
      const sloganOffset = h2El ? h2El.offsetTop : 0;
      const dataTop = FB_TOP_PAD + sloganOffset;
      const dataHeight = Math.max(0, partnerTop + partnerH - dataTop);
      if (dataEl) {
        dataEl.style.top = `${dataTop}px`;
        dataEl.style.height = `${dataHeight}px`;
      }
      geo.current = { vh, centerX, centerY, lineOffsets };
    };

    const update = () => {
      ticking = false;
      const node = trackRef.current;
      if (!node) return;
      if (window.innerHeight !== geo.current.vh) measure();
      const g = geo.current;
      const rect = node.getBoundingClientRect();
      const max = Math.max(1, rect.height - g.vh);
      const p = clamp01(-rect.top / max);

      // ───── Phase 1 [0~0.14] 슬로건 단어 scrub (Figma 100:22) ─────
      const reveal = clamp01(p / FB_TEXT_END);
      const litAmt = clamp01((reveal - 0.05) / 0.9);
      const pos = litAmt * (TOTAL_BUSINESS + 1);
      const acc = accentRGBRef.current;
      const words = wordRefs.current;
      for (let i = 0; i < words.length; i++) {
        const el = words[i];
        if (!el) continue;
        const wf = smoothstep(clamp01((pos - i) / 1.6));
        const t = el.dataset.accent === "1" ? acc : DARK_RGB;
        const r = Math.round(DIM_RGB[0] + (t[0] - DIM_RGB[0]) * wf);
        const gg = Math.round(DIM_RGB[1] + (t[1] - DIM_RGB[1]) * wf);
        const b = Math.round(DIM_RGB[2] + (t[2] - DIM_RGB[2]) * wf);
        const c = `rgb(${r}, ${gg}, ${b})`;
        if (el.dataset.c !== c) {
          el.style.color = c;
          el.dataset.c = c;
        }
      }

      // ───── Phase 2 [0.14~0.22] 텍스트 가로 중앙 → 좌측 (→ Figma 103:664) ─────
      //   tx: centerX → 0  (좌측 컬럼 위치로 이동)
      const sE = easeInOutCubic(
        clamp01((p - FB_TEXT_END) / (FB_SHIFT_END - FB_TEXT_END)),
      );
      // ───── Phase 2.5 [0.22~0.30] 세로 중앙 → 상단 (DATA 등장 전 상단 정렬) ─────
      //   ty: centerY → 0  (이후 DATA가 슬로건 상단에 맞춰 등장하므로 미리 상단 정렬)
      const mE = easeInOutCubic(
        clamp01((p - FB_SHIFT_END) / (FB_RISE_END - FB_SHIFT_END)),
      );
      const tx = lerp(g.centerX, 0, sE).toFixed(1);
      const ty = lerp(g.centerY, 0, mE).toFixed(1);
      if (textWrapRef.current) {
        textWrapRef.current.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
      }
      // 줄별 정렬 보간: 시퀀스 01 center(alignT=1) → 시퀀스 02 left(alignT=0)
      const alignT = 1 - sE;
      const lineOffsets = g.lineOffsets || [];
      const lines = lineRefs.current;
      for (let i = 0; i < lines.length; i++) {
        const el = lines[i];
        if (!el) continue;
        const ox = ((lineOffsets[i] || 0) * alignT).toFixed(1);
        if (el.dataset.ox !== ox) {
          el.style.transform = `translate3d(${ox}px, 0, 0)`;
          el.dataset.ox = ox;
        }
      }

      // ───── Phase 3 DATA frame 등장 + 설립일 count-up ─────
      //   dataRef 컨테이너는 상단 정렬 완료(FB_RISE_END) 직후 페이드인
      const fE = easeInOutCubic(
        clamp01((p - FB_RISE_END) / (FB_DATA_1_END - FB_RISE_END)),
      );
      if (dataRef.current) {
        dataRef.current.style.opacity = fE.toFixed(3);
        dataRef.current.style.transform = `translate3d(0, ${ty}px, 0)`;
      }

      // ───── DATA 항목별 count-up + 등장 (Phase 3,4,5) ─────
      // Attention-grab #1: linear-count.md 패턴 — 스크롤 진행률에 정비례
      const itemThresh = [
        [FB_RISE_END, FB_DATA_1_END], // 설립일
        [FB_DATA_1_END, FB_DATA_2_END], // 누적 주문처리 수
        [FB_DATA_2_END, FB_DATA_3_END], // 오직 생화 매출
        [FB_DATA_3_END, FB_DATA_4_END], // 경조사 제휴기업
      ];
      const items = dataItemRefs.current;
      const valEls = dataValueRefs.current;
      for (let i = 0; i < items.length; i++) {
        const el = items[i];
        if (!el) continue;
        const [s, e] = itemThresh[i];
        const ee = easeInOutCubic(clamp01((p - s) / (e - s)));
        el.style.opacity = ee.toFixed(3);
        el.style.transform = `translate3d(0, ${((1 - ee) * 20).toFixed(1)}px, 0)`;
        // count-up: linear 진행률(이징 X) — md 패턴 그대로
        const lin = clamp01((p - s) / (e - s));
        const v = valEls[i];
        if (v) {
          const stat = FB_STATS[i];
          const next = formatCount(lin, stat.target, stat.suffix, stat.noComma);
          if (v.dataset.v !== next) {
            v.textContent = next;
            v.dataset.v = next;
          }
        }
      }

      // ───── Phase 6 Partner Frame 하단→상단 슬라이드 (→ 103:1022) ─────
      const pE = easeInOutCubic(
        clamp01((p - FB_DATA_4_END) / (FB_PARTNER_END - FB_DATA_4_END)),
      );
      if (partnerRef.current) {
        partnerRef.current.style.opacity = pE.toFixed(3);
        // 하단에서 위로 슬라이드: translateY 80 → 0
        partnerRef.current.style.transform = `translate3d(0, ${((1 - pE) * 80).toFixed(1)}px, 0)`;
      }

      // ───── Phase 7 [0.72~0.86] 경고 버튼 페이드인 + pulse 2회 (→ 103:588) ─────
      // Attention-grab #2: .fb-warn-pulse 클래스 추가 시점 = 페이드 절반 도달
      const wE = easeInOutCubic(
        clamp01((p - FB_PARTNER_END) / (FB_WARN_END - FB_PARTNER_END)),
      );
      if (warnRef.current) {
        warnRef.current.style.opacity = wE.toFixed(3);
        warnRef.current.style.transform = `translate3d(0, ${((1 - wE) * 16).toFixed(1)}px, 0)`;
      }
      if (wE > 0.5 && !warnTriggeredRef.current) {
        warnTriggeredRef.current = true;
        if (warnRef.current) warnRef.current.classList.add("fb-warn-pulse");
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

  return (
    <section ref={sectionRef} aria-label="비즈니스 소개" className="relative bg-white">
      {/* 데스크톱(lg+) — Figma 7단계 sticky 시퀀스 */}
      <div className="hidden lg:block">
        <div ref={trackRef} style={{ height: `${FB_TRACK_VH}vh` }} className="relative">
          <div className="sticky top-0 h-[150vh] w-full overflow-hidden">
            <div className="relative h-full mx-[120px] xl:mx-[260px]">
              {/* 좌측 텍스트(For Business 라벨 + 슬로건 + 경고 버튼) */}
              <div
                ref={textWrapRef}
                className="absolute left-0 w-[calc(50%-50px)] will-change-transform"
                style={{
                  top: `${FB_TOP_PAD}px`,
                  opacity: ready ? 1 : 0,
                  transition: "opacity .5s ease-out",
                }}
              >
                <div ref={headRef} className="inline-block">
                  <p
                    ref={(el) => (lineRefs.current[0] = el)}
                    className="text-[var(--color-brand-red)] font-bold text-[20px] xl:text-[24px] tracking-[-0.01em] inline-flex items-center gap-[8px] will-change-transform"
                  >
                    <span>For Business</span>
                    <span
                      aria-hidden
                      className="inline-block w-[10px] h-[10px] rounded-full bg-[var(--color-brand-red)]"
                    />
                  </p>
                  <h2 className="mt-[26px] xl:mt-[34px] font-bold text-[44px] xl:text-[58px] leading-[1.32] tracking-[-0.018em]">
                    {BUSINESS_FLAT.map((line, li) => (
                      <span
                        key={li}
                        ref={(el) => (lineRefs.current[li + 1] = el)}
                        className="block whitespace-nowrap will-change-transform"
                        style={{ width: "fit-content" }}
                      >
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
                {/* 경고 버튼 — Phase 7 등장 + pulse 2회 attention-grab */}
                <button
                  ref={warnRef}
                  type="button"
                  className="mt-[30px] inline-flex items-center gap-[8px] rounded-[10px] bg-[#ffeff3] px-[18px] py-[16px] text-[#cb0d35] text-[15px] xl:text-[16px] font-medium tracking-[-0.005em] will-change-transform hover:-translate-y-[1px] transition-transform"
                  style={{ opacity: 0, transformOrigin: "left center" }}
                >
                  <span>혹시, 지금 이용하는 곳이 대행사는 아니신가요?</span>
                  <svg
                    aria-hidden
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="shrink-0"
                  >
                    <circle cx="12" cy="12" r="10" stroke="#cb0d35" strokeWidth="1.5" />
                    <path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14" stroke="#cb0d35" strokeWidth="1.5" strokeLinecap="round" />
                    <circle cx="12" cy="16.5" r="0.9" fill="#cb0d35" />
                  </svg>
                </button>
              </div>

              {/* 우측 DATA frame — Phase 3~5: 페이드 + 항목 순차 등장 + count-up */}
              <div
                ref={dataRef}
                className="absolute right-0 w-[calc(50%-50px)] flex flex-col justify-between will-change-transform"
                style={{ top: `${FB_TOP_PAD}px`, opacity: 0 }}
              >
                {FB_STATS.map((s, i) => (
                  <div
                    key={i}
                    ref={(el) => (dataItemRefs.current[i] = el)}
                    className="will-change-transform"
                    style={{ opacity: 0 }}
                  >
                    <div className="flex items-end justify-between gap-4 px-[5px]">
                      <div>
                        <p className="font-semibold text-[#222] text-[21px] xl:text-[24px] leading-[1.3] tracking-[-0.02em]">
                          {s.title}
                        </p>
                        <p className="mt-[10px] font-medium text-[#555] text-[15px] xl:text-[18px] leading-[1.3] tracking-[-0.02em]">
                          {s.sub}
                        </p>
                      </div>
                      <p
                        ref={(el) => (dataValueRefs.current[i] = el)}
                        data-v={`0${s.suffix}`}
                        className="shrink-0 font-bold text-[#222] text-[48px] xl:text-[58px] leading-[1] tracking-[-0.02em] tabular-nums"
                      >
                        {`0${s.suffix}`}
                      </p>
                    </div>
                    <div className="mt-[24px] xl:mt-[32px] h-[7px] xl:h-[8px] w-full bg-[#e2ef5d] rounded-[55px]" />
                  </div>
                ))}
              </div>

              {/* 좌측 하단 Partner Frame — Phase 6: 하단→상단 슬라이드 (Figma 103:1032) */}
              <div
                ref={partnerRef}
                className="absolute left-0 w-[calc(50%-50px)] rounded-[20px] bg-[#f8f8f8] overflow-hidden p-[24px] xl:p-[30px] flex flex-col gap-[24px] xl:gap-[30px] will-change-transform"
                style={{ top: 0, opacity: 0 }}
                aria-label="제휴 기업"
              >
                {FB_PARTNERS.slice(0, 2).map((row, ri) => (
                  <div key={ri} className="overflow-hidden">
                    <div
                      className={`flex w-max gap-[10px] ${
                        ri % 2 === 0 ? "fb-marquee-l" : "fb-marquee-r"
                      }`}
                      style={{ "--fb-marquee-dur": `${34 + ri * 6}s` }}
                    >
                      {[...row, ...row].map((name, ci) => (
                        <span
                          key={ci}
                          aria-hidden={ci >= row.length}
                          className="shrink-0 rounded-[10px] bg-white p-[14px] xl:p-[16px] text-[16px] xl:text-[18px] font-medium text-[#333] whitespace-nowrap tracking-[-0.02em]"
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 모바일(<lg) — 정적 스택 (Figma 103:588 단순화) */}
      <div className="lg:hidden px-6 md:px-12 py-[72px] flex flex-col gap-[36px]">
        <div>
          <p className="text-[var(--color-brand-red)] font-bold text-[18px] tracking-[-0.01em] inline-flex items-center gap-[8px]">
            <span>For Business</span>
            <span
              aria-hidden
              className="inline-block w-[7px] h-[7px] rounded-full bg-[var(--color-brand-red)]"
            />
          </p>
          <h2 className="mt-[18px] font-bold text-[30px] md:text-[40px] leading-[1.34] tracking-[-0.018em]">
            {BUSINESS_FLAT.map((line, li) => (
              <span key={li} className="block">
                {line.map((w, wi) => (
                  <span
                    key={wi}
                    className="inline-block whitespace-pre"
                    style={{
                      color: w.tone === "accent" ? "var(--color-brand-red)" : "#222",
                    }}
                  >
                    {w.text}
                    {wi < line.length - 1 && !w.noSpace ? " " : ""}
                  </span>
                ))}
              </span>
            ))}
          </h2>
          <button
            type="button"
            className="mt-[20px] inline-flex items-center gap-[8px] rounded-[10px] bg-[#ffeff3] px-[16px] py-[12px] text-[#cb0d35] text-[14px] font-medium"
          >
            <span>혹시, 지금 이용하는 곳이 대행사는 아니신가요?</span>
          </button>
        </div>
        <div className="flex flex-col gap-[28px]">
          {FB_STATS.map((s, i) => (
            <div key={i}>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="font-semibold text-[#222] text-[20px] leading-[1.3]">
                    {s.title}
                  </p>
                  <p className="mt-[6px] font-medium text-[#555] text-[13px] leading-[1.3]">
                    {s.sub}
                  </p>
                </div>
                <p className="shrink-0 font-bold text-[#222] text-[32px] leading-[1] tracking-[-0.02em] tabular-nums">
                  {`${s.noComma ? s.target : s.target.toLocaleString("ko-KR")}${s.suffix}`}
                </p>
              </div>
              <div className="mt-[16px] h-[6px] w-full bg-[#e2ef5d] rounded-[55px]" />
            </div>
          ))}
        </div>
        <div
          className="rounded-[18px] bg-[#f8f8f8] overflow-hidden p-[16px] flex flex-col gap-[10px]"
          aria-label="제휴 기업"
        >
          {FB_PARTNERS.slice(0, 2).map((row, ri) => (
            <div key={ri} className="overflow-hidden">
              <div
                className={`flex w-max gap-[10px] ${
                  ri % 2 === 0 ? "fb-marquee-l" : "fb-marquee-r"
                }`}
                style={{ "--fb-marquee-dur": `${30 + ri * 5}s` }}
              >
                {[...row, ...row].map((name, ci) => (
                  <span
                    key={ci}
                    aria-hidden={ci >= row.length}
                    className="shrink-0 rounded-[9px] bg-white px-[14px] py-[10px] text-[14px] font-medium text-[#333] whitespace-nowrap"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function DataSection() {
  return (
    <>
      <AboutScrollStage />
      <ForBusinessStage />
    </>
  );
}
