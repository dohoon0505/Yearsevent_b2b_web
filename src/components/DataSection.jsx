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
  { title: "설립일", sub: "2016년 설립, 2018년 인수합병", target: 2016, suffix: "~" },
  { title: "경조사 제휴기업", sub: "소규모의 기업부터, 관공서까지", target: 200, suffix: "+" },
  { title: "누적 주문처리 수", sub: "일 평균 178건의 주문접수", target: 700000, suffix: "+" },
];

// 카운트업 포맷 — 목표값×진행률을 ko-KR 콤마 포맷 + suffix
const formatCount = (progress, target, suffix) =>
  `${Math.floor(progress * target).toLocaleString("ko-KR")}${suffix}`;

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
const FB_DATA_1_END = 0.32; // 설립일/2016~ count-up 완료 (→ 103:773)
const FB_DATA_2_END = 0.42; // 경조사/200+ count-up 완료 (→ 103:879)
const FB_DATA_3_END = 0.55; // 누적/700,000+ count-up + 세로 중앙→상단 (→ 103:909)
const FB_PARTNER_END = 0.72; // Partner Frame 하단→상단 슬라이드 (→ 103:1022)
const FB_WARN_END = 0.86; // 경고 버튼 페이드인 + pulse 트리거 (→ 103:588)

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

// 반복(loop) 렌더 — 카드를 3벌 이어 붙여 이음새 없는 center-focus 루프 구성.
// focal은 가운데 벌의 첫 카드(A_START_I)부터 한 바퀴(UNIQUE_N step) 이동 →
// 양옆에 항상 이웃 카드가 채워져(빈 공간 없음) 중앙 카드가 Active 되는 캐러셀.
// 마지막 카드 다음에 첫 카드가 다시 중앙으로 들어온다.
const UNIQUE_N = SLIDER_CARDS.length;
const A_START_I = UNIQUE_N; // 시작 시 중앙(Active)에 둘 카드 = 가운데 벌의 첫 카드
// 카드별로 후보 이미지 중 1개를 랜덤 선택(페이지 로드 1회 고정) → 3벌 이어 붙임.
// 3벌 모두 같은 선택을 공유하므로 한 카드는 캐러셀 내내 동일 이미지로 일관됨.
const LOOP_CARDS = (() => {
  const picked = SLIDER_CARDS.map((c) => ({
    ...c,
    img: c.imgs[Math.floor(Math.random() * c.imgs.length)],
  }));
  return [...picked, ...picked, ...picked];
})();

// ───────── About Us 다단계 무대 ─────────
const A_TRACK_VH = 460;
const A_TEXT_END = 0.32; // 텍스트 scrub 완료 (~1화면)
const A_TRANS_END = 0.52; // 텍스트 상단 이동 + 슬라이더 등장 완료 (전환 구간 ↑ 매끄럽게)
const A_TOP_PAD = 120; // 상단 padding 120 (요구사항)
const A_GAP = 36; // 텍스트 ↔ 슬라이더 간격
const A_BOTTOM_PAD = 48; // 카드 +15% 확대에 따라 하단 여백 축소 (72 → 48)
const A_CARD_MAXH = 530; // 460 → 530 (+15% 확대)

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

          {/* 이미지 슬라이더 — center-focus (top/height JS 제어), 좌우 패딩 0 (full-bleed) */}
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
                      <p className="mt-[7px] text-[12.5px] md:text-[14px] leading-[1.55] text-[#52525b] tracking-[-0.003em]">
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
      const textH = tw.offsetHeight;
      const dataH = dataEl.offsetHeight;
      // 세로 중앙: text+DATA row 둘 중 큰 높이를 기준으로 viewport 정중앙 배치
      const rowH = Math.max(textH, dataH);
      const centerY = Math.max(0, (vh - rowH) / 2 - FB_TOP_PAD);
      // 가로 중앙: 텍스트 wrapper를 inner 영역 정중앙으로 이동
      // centerX = (innerW - wrapperW) / 2 → wrapper.left=0 기준 우측 shift량
      const wrapperW = tw.offsetWidth;
      const innerW = tw.parentElement ? tw.parentElement.clientWidth : 0;
      const centerX = Math.max(0, (innerW - wrapperW) / 2);
      // Partner Frame은 viewport 하단 (sticky pin 동안 보이는 100vh 안)
      // partnerTop = vh - FB_TOP_PAD - partnerH (좌측 컬럼의 viewport bottom 정렬)
      const partnerH = partnerEl ? partnerEl.offsetHeight : 0;
      const partnerTop = Math.max(FB_TOP_PAD, vh - FB_TOP_PAD - partnerH);
      if (partnerEl) partnerEl.style.top = `${partnerTop}px`;
      geo.current = { vh, centerX, centerY };
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
      // ───── Phase 5 [0.42~0.55] 세로 중앙 → 상단 (→ Figma 103:909) ─────
      //   ty: centerY → 0  (3rd DATA 항목 등장 직후 컨텐츠 상단 정렬)
      const mE = easeInOutCubic(
        clamp01((p - FB_DATA_2_END) / (FB_DATA_3_END - FB_DATA_2_END)),
      );
      const tx = lerp(g.centerX, 0, sE).toFixed(1);
      const ty = lerp(g.centerY, 0, mE).toFixed(1);
      if (textWrapRef.current) {
        textWrapRef.current.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
      }

      // ───── Phase 3 [0.22~0.32] DATA frame 등장 + 설립일 count-up (→ 103:773) ─────
      //   dataRef 컨테이너는 텍스트 좌측 이동 완료 시점부터 페이드인
      const fE = easeInOutCubic(
        clamp01((p - FB_SHIFT_END) / (FB_DATA_1_END - FB_SHIFT_END)),
      );
      if (dataRef.current) {
        dataRef.current.style.opacity = fE.toFixed(3);
        dataRef.current.style.transform = `translate3d(0, ${ty}px, 0)`;
      }

      // ───── DATA 항목별 count-up + 등장 (Phase 3,4,5) ─────
      // Attention-grab #1: linear-count.md 패턴 — 스크롤 진행률에 정비례
      const itemThresh = [
        [FB_SHIFT_END, FB_DATA_1_END], // 설립일 0.22~0.32
        [FB_DATA_1_END, FB_DATA_2_END], // 경조사 0.32~0.42
        [FB_DATA_2_END, FB_DATA_3_END], // 누적 0.42~0.55
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
          const next = formatCount(lin, stat.target, stat.suffix);
          if (v.dataset.v !== next) {
            v.textContent = next;
            v.dataset.v = next;
          }
        }
      }

      // ───── Phase 6 [0.55~0.72] Partner Frame 하단→상단 슬라이드 (→ 103:1022) ─────
      const pE = easeInOutCubic(
        clamp01((p - FB_DATA_3_END) / (FB_PARTNER_END - FB_DATA_3_END)),
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
                <p className="text-[var(--color-brand-red)] font-bold text-[22px] xl:text-[24px] tracking-[-0.01em] inline-flex items-center gap-[8px]">
                  <span>For Business</span>
                  <span
                    aria-hidden
                    className="inline-block w-[10px] h-[10px] rounded-full bg-[var(--color-brand-red)]"
                  />
                </p>
                <h2 className="mt-[26px] xl:mt-[30px] font-bold text-[36px] xl:text-[44px] leading-[1.32] tracking-[-0.018em] text-left">
                  {BUSINESS_FLAT.map((line, li) => (
                    <span key={li} className="block whitespace-nowrap">
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
                className="absolute right-0 w-[calc(50%-50px)] flex flex-col gap-[40px] xl:gap-[52px] will-change-transform"
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
                        <p className="font-semibold text-[#222] text-[24px] xl:text-[28px] leading-[1.3]">
                          {s.title}
                        </p>
                        <p className="mt-[10px] font-medium text-[#555] text-[16px] xl:text-[20px] leading-[1.3]">
                          {s.sub}
                        </p>
                      </div>
                      <p
                        ref={(el) => (dataValueRefs.current[i] = el)}
                        data-v={`0${s.suffix}`}
                        className="shrink-0 font-bold text-[#222] text-[42px] xl:text-[54px] leading-[1] tracking-[-0.02em] tabular-nums"
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
                          className="shrink-0 rounded-[10px] bg-white p-[14px] xl:p-[16px] text-[18px] xl:text-[20px] font-medium text-[#333] whitespace-nowrap"
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
                  {`${s.target.toLocaleString("ko-KR")}${s.suffix}`}
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
