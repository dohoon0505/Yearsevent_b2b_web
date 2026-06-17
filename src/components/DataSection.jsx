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
import fbCityNight from "../assets/forbusiness-city-night.webp";

/**
 * DataSection — About Us + For Business (Figma 193:80 / 165:121 + 코멘트 #1~#8, #12~#13)
 *
 * ┌─ About Us (TRACK 560vh / sticky 100vh) — Figma 193:80 sequence 01~04
 * │   [메시지 1·2 중앙 순차 등장(#2)] → [메시지 위로 퇴장 + 슬로건 아래에서 등장(#3)]
 * │   → [슬로건 scrub fill(#4)] → [좌상단 이동(3줄 유지, 가운데→좌측 정렬 보간)
 * │      + 우측 카드 롤링 + 하단 메시지 재등장]
 * │   카드 이미지: 마우스 호버 시 스포트라이트 렌즈(#1)
 * └─ For Business (TRACK 710vh / sticky 무대 150vh — 최하단 핀) — Figma 165:121
 *      [흰 배경: 레드 악센트 슬로건 scrub, 줄 안에 야경 칩(#5)]
 *      → [칩이 캡슐(802×369)→풀블리드로 확장되며 배경을 채움(#13)]
 *      → [배경 90% 채워지면 화이트/라임 슬로건 페이드인(#12)] → [좌측 이동(#8)]
 *      → [우측 가로형 카드(600×300) 3장 "세로 스택"이 아래→위로 슬라이드(#7·#8,
 *         Figma 193:247→194:420: 컬럼 top 150→-210, 끝에서 하단 패딩 정렬)
 *         + 배경(높이 142%)은 top 0→-42%로 아래로 스크롤-스루]
 *      → [100%: 배경 좌하단 rounded-bl-120 → #222(Product 섹션)로 연결(#6)]
 *      ⚠ 무대(sticky)는 100vh가 아닌 150vh (h-screen 회귀 금지) — 핀은 최하단 고정.
 *
 * 성능: 스크롤 프레임에서 React state 갱신 없이 ref 직접 DOM(transform/opacity/clip-path)만 기록.
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

// About 슬로건 단어를 전역 인덱스와 함께 평탄화 (ref 직접 색 제어용)
let _gi = 0;
const ABOUT_FLAT = ABOUT_LINES.map((line) =>
  line.map((w) => ({ ...w, gi: _gi++ })),
);
const TOTAL_ABOUT = _gi;

// For Business 슬로건 (Figma 165:121)
//   흰 배경 단계: 레드 악센트 + 줄 안 야경 칩 / 다크 단계: 라임 악센트(칩 없음)
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

// 흰 배경 단계 전용 — 2번째 줄 "하는"과 "기업입니다." 사이에 야경 칩(chip) 삽입 (Figma 193:311)
const FB_WHITE_LINES = [
  [
    { text: "저희는", tone: "dark" },
    { text: "성공적인", tone: "dark" },
    { text: "비즈니스", tone: "accent", noSpace: true },
    { text: "를", tone: "dark" },
  ],
  [
    { text: "서포트", tone: "accent", noSpace: true },
    { text: "하는", tone: "dark" },
    { chip: true },
    { text: "기업입니다.", tone: "dark" },
  ],
];
let _gw = 0;
const FB_WHITE_FLAT = FB_WHITE_LINES.map((line) =>
  line.map((w) => (w.chip ? w : { ...w, gi: _gw++ })),
);
const TOTAL_FB_WHITE = _gw;

// For Business — DATA 통계 (Figma 165:107) — 카드 3(DATA) 내부 count-up
const FB_STATS = [
  { label: "기업 설립년도", target: 2016, suffix: "", noComma: true },
  { label: "경조사 제휴기업", target: 200, suffix: "+" },
  { label: "누적 주문처리", target: 700000, suffix: "+" },
  { label: "연간 생화매출", target: 18, suffix: "억+", noComma: true },
];

const formatCount = (progress, target, suffix, noComma) => {
  const n = Math.floor(progress * target);
  return `${noComma ? n : n.toLocaleString("ko-KR")}${suffix}`;
};

// For Business — Partner 제휴 기업 칩 (행별 마퀴, 좌/우 교차)
const FB_PARTNERS = [
  ["다산중공업", "세종대학교", "우리은행", "DB손해보험", "삼성전자", "LG디스플레이", "현대자동차"],
  ["법무법인 율촌", "김앤장 법률사무소", "교보생명", "한화생명", "법무법인 로고스", "법무법인 바른"],
  ["세종텔레콤", "SK텔레콤", "(주)화현메디칼", "성은실버케어스", "우리은행", "현대자동차"],
];

// 카드 1 — 2026 가톨릭대학교 경조사 화환 납품 낙찰 (※ 문구는 추후 교체 가능)
const FB_BID = {
  badge: "2026 공식 낙찰",
  title: ["가톨릭대학교", "경조사 화환 납품", "낙찰업체"],
  desc: "2026년 가톨릭대학교 경조사 화환 공식 납품 협력사로 선정되었습니다.",
};

// ───────── For Business 무대 임계값 ─────────
//   ⚠ 무대(sticky)는 100vh가 아닌 150vh — 배경 야경이 뷰포트보다 길다. (h-screen 회귀 금지)
//     핀은 최하단 고정(top: 100vh-150vh = -50vh): 진입 시 상단 50vh는 내부
//     스크롤로 통과한 뒤 무대 하단 100vh가 고정되어 연출이 시작된다.
const FB_STAGE_VH = 150;
const FB_TRACK_VH = 710; // 핀 구간 = 710 - 150 = 560vh
// 인터랙션 임계값 (핀 진행률 p ∈ [0, 1])
const FB_TEXT_END = 0.12; // 흰 배경 슬로건 scrub 완료
const FB_EXP1_AT = 0.13; // 칩 → 캡슐(802×369) 확장 시작 (#5)
const FB_EXP1_END = 0.22;
const FB_EXP2_END = 0.3; // 캡슐 → 풀블리드 (#13)
const FB_DARKIN_AT = 0.28; // 배경 ~90% 채움 → 다크 슬로건 페이드인 (#12)
const FB_DARKIN_DUR = 0.08;
const FB_MOVE_AT = 0.36; // 슬로건 center → 좌상단 (#8)
const FB_MOVE_END = 0.46;
const FB_CARDS_AT = 0.46; // 카드 스택 아래→위 슬라이드 (#7·#8)
const FB_CARDS_END = 0.9;
const FB_COUNT_AT = 0.6; // DATA 카드 count-up
const FB_COUNT_DUR = 0.14;
const FB_RADIUS_AT = 0.92; // 좌하단 border-radius → #222 (#6)

// 다크 배경 위 색 — 라임 강조 #e2ef5d
const FB_LIME = "#e2ef5d";

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

const PICKED_CARDS = SLIDER_CARDS.map((c) => ({
  ...c,
  img: c.imgs[Math.floor(Math.random() * c.imgs.length)],
}));
// 좌/우 2개 컬럼 — 반대 방향(좌↑ / 우↓) 무한 루프 수직 롤링. 이미지 교집합 제거(짝/홀 분리).
const LEFT_SET = PICKED_CARDS.filter((_, i) => i % 2 === 0);
const RIGHT_SET = PICKED_CARDS.filter((_, i) => i % 2 === 1);

// About Us 인용 메시지 (Figma 193:130/134) — 故 이병철 회장 어록
const ABOUT_MESSAGES = [
  { quote: "세상에 우연은 없다. 한번 맺은 인연을 소중히 하라.", source: "故이병철 회장 어록 中" },
  { quote: "남이 잘됨을 축복하라. 그 축복이 메아리처럼 나를 향해 돌아온다.", source: "故이병철 회장 어록 中" },
];

// ───────── About Us 무대 임계값 (Figma 193:80 sequence 01~04) ─────────
const A_TRACK_VH = 560;
const A_MSG1_AT = 0.03; // 메시지 01 중앙 등장 (#2)
const A_MSG2_AT = 0.13; // 메시지 02 등장
const A_MSG_DUR = 0.07;
const A_OUT_AT = 0.23; // 메시지 위로 퇴장 + 슬로건 아래에서 등장 (#3)
const A_OUT_DUR = 0.1;
const A_TEXT_AT = 0.34; // 슬로건 scrub 시작 (#4)
const A_TEXT_END = 0.52;
const A_TRANS_END = 0.62; // 좌상단 이동 + 카드·하단 메시지 등장 완료
const A_ROLL_CYCLES = 0.6;

const clamp01 = (v) => Math.max(0, Math.min(1, v));
const lerp = (a, b, t) => a + (b - a) * t;
const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

// 카드 컬럼 1개 — 세트를 2벌 이어붙여 무한 루프 롤링(translateY modulo)
//   컬러 렌즈(#1, miracell.co.kr 히어로 스타일): 기본은 흑백+디밍.
//   렌즈 좌표(--lsx/--lsy)는 "무대 단위" mousemove가 카드별 상대좌표로 기록 —
//   대형 렌즈가 카드 경계를 가로질러 컬러를 드러낸다(opacity는 무대 클래스로 일괄).
function CardColumn({ cards, colRef, stagger = false }) {
  const loop = [...cards, ...cards]; // 2벌 → 이음새 없는 세로 루프
  return (
    <div
      ref={colRef}
      className="absolute left-0 flex flex-col gap-[var(--a-card-gap)] will-change-transform"
      style={{
        width: "var(--a-card-w)",
        top: stagger ? "calc(var(--a-card-w) * -0.65)" : "0px",
      }}
    >
      {loop.map((card, i) => (
        <div
          key={i}
          className="a-card relative w-full overflow-hidden rounded-[var(--a-card-r)] bg-[#e9e9ec]"
          style={{ aspectRatio: "400 / 520" }}
        >
          {/* 베이스 — 흑백+디밍 (렌즈 대비 확보) */}
          <img
            src={card.img}
            alt=""
            loading="eager"
            decoding="async"
            draggable="false"
            className="a-lens-gray absolute inset-0 w-full h-full object-cover select-none"
          />
          {/* 컬러 렌즈 — 무대 렌즈 원 안에만 컬러 노출 */}
          <img
            src={card.img}
            alt=""
            aria-hidden
            loading="eager"
            decoding="async"
            draggable="false"
            className="a-lens-color absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
          />
          <div
            className="absolute inset-x-0 bottom-0 h-[30%] flex flex-col justify-end px-[22px] pb-[22px] pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(to top, color-mix(in srgb, color-mix(in srgb, var(--color-brand-red-dark) 60%, black 40%) 85%, transparent), color-mix(in srgb, var(--color-brand-red-dark) 15%, transparent) 52%, transparent)",
            }}
          >
            <p
              className="text-white font-semibold text-[22px] xl:text-[24px] tracking-[-0.01em] leading-[1.25]"
              style={{ textShadow: "0 1px 6px rgba(0,0,0,0.55)" }}
            >
              {card.title}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// 인용 메시지 박스 — center: 중앙 등장용(큰 버전) / 기본: 좌하단 정적
function QuoteMessage({ msg, msgRef, center = false }) {
  return (
    <div
      ref={msgRef}
      className={`w-fit max-w-[88vw] bg-[#f8f8f8] rounded-[20px] flex flex-col will-change-transform ${
        center
          ? "px-[34px] py-[26px] xl:px-[50px] xl:py-[40px] gap-[12px] xl:gap-[22px] items-start"
          : "px-[28px] py-[22px] xl:px-[42px] xl:py-[30px] gap-[10px] xl:gap-[20px]"
      }`}
      style={{ opacity: 0 }}
    >
      <p
        className={`text-[#222] font-bold leading-[1.4] tracking-[-0.01em] whitespace-nowrap ${
          center ? "text-[17px] md:text-[20px] xl:text-[24px]" : "text-[16px] md:text-[18px] xl:text-[22px]"
        }`}
      >
        {msg.quote}
      </p>
      <p
        className={`text-[#888] font-medium leading-[1.4] tracking-[-0.01em] ${
          center ? "text-[13px] md:text-[15px] xl:text-[19px]" : "text-[12px] md:text-[14px] xl:text-[17px]"
        }`}
      >
        {msg.source}
      </p>
    </div>
  );
}

function AboutScrollStage() {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const contentRef = useRef(null); // 패딩 적용된 flex 컨테이너 (콘텐츠 높이 측정)
  const headWrapRef = useRef(null); // About Us 라벨 + 헤딩 (아래 등장 → 세로 중앙 → 좌상단)
  const labelRef = useRef(null); // About Us 라벨 (가운데→좌측 정렬 보간)
  const wordRefs = useRef([]);
  const lineRefs = useRef([]); // 슬로건 각 줄 (가운데→좌측 정렬 보간)
  const centerMsgRefs = useRef([]); // 중앙 등장 메시지 2개 (#2·#3)
  const cardStageRef = useRef(null); // 카드 무대 (fade-in)
  const leftColRef = useRef(null);
  const rightColRef = useRef(null);
  const msgRefs = useRef([]); // 좌하단 정적 메시지 2개
  const lensRingRef = useRef(null); // 컬러 렌즈 링 (커서 추종)
  const lensStageRef = useRef(null); // 렌즈 무대(sticky 컨테이너)
  const lensPos = useRef(null); // 마지막 커서 위치(viewport) — rAF에서 매 프레임 동기화
  const lensDisp = useRef(null); // 렌즈 표시 위치 — lensPos를 lerp로 추종(부드러운 이동)
  const colWrapLRef = useRef(null); // 좌측 카드 컬럼 래퍼 (렌즈 활성 영역 판정)
  const colWrapRRef = useRef(null); // 우측 카드 컬럼 래퍼
  const aCursorRef = useRef(null); // 여백 스크롤 커서 (카드 영역에서는 렌즈가 대체)
  const aCurDisp = useRef(null); // 스크롤 커서 표시 위치 (lerp 추종)
  const geo = useRef({ vh: 0, centerY: 0, unitL: 1, unitR: 1 });
  const accentRGBRef = useRef([203, 13, 53]); // --color-brand-red (resolve 후 갱신)
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

    const measure = () => {
      const vh = window.innerHeight;
      const content = contentRef.current;
      const head = headWrapRef.current;
      const lc = leftColRef.current;
      const rc = rightColRef.current;
      if (!content || !head) return;

      const cs = getComputedStyle(content);
      const padT = parseFloat(cs.paddingTop) || 0;
      const padB = parseFloat(cs.paddingBottom) || 0;
      const padL = parseFloat(cs.paddingLeft) || 0;
      const innerH = content.clientHeight - padT - padB;
      const headH = head.offsetHeight;
      const centerY = Math.max(0, (innerH - headH) / 2);

      // 슬로건 각 줄/라벨의 가운데정렬 오프셋 — 좌상단 이동(e 0→1)에 맞춰 0으로 보간.
      // centerX: 중앙 단계에서 헤딩 블록을 "화면 전체" 기준 가로 중앙에 두기 위한 이동량.
      const headW = head.offsetWidth;
      const centerX = Math.max(0, (window.innerWidth - headW) / 2 - padL);
      const lineOffsets = lineRefs.current.map((el) => {
        if (!el) return 0;
        const range = document.createRange();
        range.selectNodeContents(el);
        const w = range.getBoundingClientRect().width;
        return Math.max(0, (headW - w) / 2);
      });
      const labelOffset = labelRef.current
        ? Math.max(0, (headW - labelRef.current.offsetWidth) / 2)
        : 0;

      const unitOf = (col, n) => {
        if (!col || !col.firstElementChild) return vh;
        const ch = col.firstElementChild.getBoundingClientRect().height;
        const gap = parseFloat(getComputedStyle(col).rowGap) || 0;
        return n * (ch + gap);
      };
      const unitL = unitOf(lc, LEFT_SET.length);
      const unitR = unitOf(rc, RIGHT_SET.length);

      geo.current = { vh, centerY, centerX, unitL, unitR, lineOffsets, labelOffset };
    };

    let dispSp = -1;
    let rafId = 0;
    let visible = false;

    const frame = () => {
      rafId = 0;
      const node = trackRef.current;
      if (!node) return;
      if (window.innerHeight !== geo.current.vh) measure();
      const g = geo.current;
      const rect = node.getBoundingClientRect();
      const vh = window.innerHeight;
      const max = Math.max(1, rect.height - vh);
      const p = clamp01(-rect.top / max);

      // 1) 메시지 01·02 중앙 순차 등장(#2) → 위로 퇴장(#3)
      const out = smoothstep(clamp01((p - A_OUT_AT) / A_OUT_DUR));
      const cms = centerMsgRefs.current;
      for (let i = 0; i < cms.length; i++) {
        const el = cms[i];
        if (!el) continue;
        const at = i === 0 ? A_MSG1_AT : A_MSG2_AT;
        const m = smoothstep(clamp01((p - at) / A_MSG_DUR));
        el.style.opacity = (m * (1 - out)).toFixed(3);
        el.style.transform = `translate3d(0, ${((1 - m) * 44 - out * 140).toFixed(1)}px, 0)`;
      }

      // 2) 슬로건 아래에서 등장(#3) → scrub(#4) → 좌상단 이동
      const rise = smoothstep(clamp01((p - A_OUT_AT) / A_OUT_DUR));
      const e = easeInOutCubic(clamp01((p - A_TEXT_END) / (A_TRANS_END - A_TEXT_END)));
      if (headWrapRef.current) {
        headWrapRef.current.style.opacity = rise.toFixed(3);
        headWrapRef.current.style.transform = `translate3d(${(lerp(g.centerX || 0, 0, e)).toFixed(1)}px, ${(lerp(g.centerY, 0, e) + (1 - rise) * 90).toFixed(1)}px, 0)`;
      }
      // 줄/라벨 가운데→좌측 정렬 보간
      const lo = g.lineOffsets;
      if (lo) {
        const lines = lineRefs.current;
        for (let i = 0; i < lines.length; i++) {
          if (lines[i])
            lines[i].style.transform = `translate3d(${(lo[i] * (1 - e)).toFixed(1)}px, 0, 0)`;
        }
      }
      if (labelRef.current)
        labelRef.current.style.transform = `translate3d(${((g.labelOffset || 0) * (1 - e)).toFixed(1)}px, 0, 0)`;

      // 3) 슬로건 단어 색칠(scrub)
      const reveal = clamp01((p - A_TEXT_AT) / (A_TEXT_END - A_TEXT_AT));
      const litAmt = clamp01((reveal - 0.05) / 0.9);
      const pos = litAmt * (TOTAL_ABOUT + 1);
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

      // 4) 카드 무대 + 하단 메시지 — 좌상단 이동과 동기 등장
      if (cardStageRef.current) cardStageRef.current.style.opacity = e.toFixed(3);
      const ms = msgRefs.current;
      for (let i = 0; i < ms.length; i++) {
        const el = ms[i];
        if (!el) continue;
        const m = smoothstep(clamp01((e - i * 0.18) / 0.8));
        el.style.opacity = m.toFixed(3);
        el.style.transform = `translate3d(0, ${((1 - m) * 36).toFixed(1)}px, 0)`;
      }

      // 5) 좌↑ / 우↓ 반대 방향 무한 루프 롤링 — 스크롤 직결 target을 lerp로 추종.
      const targetSp = clamp01((p - A_TRANS_END) / (1 - A_TRANS_END));
      dispSp = dispSp < 0 || Math.abs(targetSp - dispSp) > 0.25 ? targetSp : dispSp + (targetSp - dispSp) * 0.1;
      if (leftColRef.current) {
        const tyL = -((dispSp * g.unitL * A_ROLL_CYCLES) % g.unitL); // 위로
        leftColRef.current.style.transform = `translate3d(0, ${tyL.toFixed(2)}px, 0)`;
      }
      if (rightColRef.current) {
        const tyR = ((dispSp * g.unitR * A_ROLL_CYCLES) % g.unitR) - g.unitR; // 아래로
        rightColRef.current.style.transform = `translate3d(0, ${tyR.toFixed(2)}px, 0)`;
      }

      // 6) 컬러 렌즈 — 커서가 "카드 컬럼 영역 안"일 때만 활성. 표시 위치는
      //    lerp(0.16)로 부드럽게 추종, 카드 롤링 중에도 매 프레임 좌표 동기화.
      const lp = lensPos.current;
      const ls = lensStageRef.current;
      if (ls) {
        let lensOn = false;
        // 카드가 등장(e>0.5)한 뒤에만 렌즈 활성 — 도입 단계(메시지·슬로건)에서는
        // 카드가 보이지 않으므로 렌즈 대신 여백 스크롤 커서를 유지한다.
        if (lp && e > 0.5 && colWrapLRef.current && colWrapRRef.current) {
          const rl = colWrapLRef.current.getBoundingClientRect();
          const rr = colWrapRRef.current.getBoundingClientRect();
          const x0 = Math.min(rl.left, rr.left) - 24;
          const x1 = Math.max(rl.right, rr.right) + 24;
          lensOn = lp.x >= x0 && lp.x <= x1;
        }
        if (lensOn) {
          ls.classList.add("a-lens-on");
          // 첫 진입은 snap, 이후 lerp 추종
          const d = lensDisp.current || (lensDisp.current = { x: lp.x, y: lp.y });
          d.x = lerp(d.x, lp.x, 0.16);
          d.y = lerp(d.y, lp.y, 0.16);
          const sr = ls.getBoundingClientRect();
          if (lensRingRef.current)
            lensRingRef.current.style.transform = `translate3d(${(d.x - sr.left).toFixed(1)}px, ${(d.y - sr.top).toFixed(1)}px, 0) translate(-50%, -50%)`;
          const cardEls = ls.querySelectorAll(".a-card");
          const cardRects = Array.from(cardEls, (c) => c.getBoundingClientRect());
          cardEls.forEach((c, i) => {
            c.style.setProperty("--lsx", `${(d.x - cardRects[i].left).toFixed(1)}px`);
            c.style.setProperty("--lsy", `${(d.y - cardRects[i].top).toFixed(1)}px`);
          });
        } else {
          ls.classList.remove("a-lens-on");
          lensDisp.current = null;
        }
        // 여백 스크롤 커서 — 카드 영역(lensOn)에서는 렌즈가 커서를 대체
        const showCur = !!lp && !lensOn;
        ls.classList.toggle("is-on", showCur);
        if (showCur && aCursorRef.current) {
          const d = aCurDisp.current || (aCurDisp.current = { x: lp.x, y: lp.y });
          d.x = lerp(d.x, lp.x, 0.18);
          d.y = lerp(d.y, lp.y, 0.18);
          const sr = ls.getBoundingClientRect();
          aCursorRef.current.style.transform = `translate3d(${(d.x - sr.left).toFixed(1)}px, ${(d.y - sr.top).toFixed(1)}px, 0)`;
        } else if (!showCur) {
          aCurDisp.current = null;
        }
      }

      if (visible) rafId = requestAnimationFrame(frame);
    };

    const ensure = () => {
      if (!rafId) rafId = requestAnimationFrame(frame);
    };
    const onResize = () => {
      measure();
      ensure();
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) ensure();
      },
      { threshold: 0 },
    );
    if (sectionRef.current) io.observe(sectionRef.current);

    measure();
    ensure();
    window.addEventListener("scroll", ensure, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        measure();
        ensure();
      });
    }

    return () => {
      io.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", ensure);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // 컬러 렌즈(miracell) — mousemove는 커서 위치만 기록. 활성 판정(카드 영역 한정)·
  // lerp 추종·좌표 동기화는 모두 메인 rAF 루프(frame)에서 수행(단일 기록자).
  const onLensMove = (e) => {
    lensPos.current = { x: e.clientX, y: e.clientY };
  };
  const onLensLeave = (e) => {
    lensPos.current = null;
    e.currentTarget.classList.remove("a-lens-on");
    e.currentTarget.classList.remove("is-on");
  };

  return (
    <section ref={sectionRef} aria-label="회사 소개" className="relative bg-white">
      <div ref={trackRef} style={{ height: `${A_TRACK_VH}vh` }} className="relative">
        <div
          ref={lensStageRef}
          className="a-lens-stage pd-cursor-stage sticky top-0 h-screen w-full overflow-hidden"
          onMouseMove={onLensMove}
          onMouseLeave={onLensLeave}
          style={{
            "--a-pad": "clamp(28px, 7.8vw, 150px)",
            "--a-card-w": "clamp(166px, 19.14vw, 368px)",
            "--a-card-gap": "clamp(16px, 1.61vw, 30px)",
            "--a-card-r": "clamp(21px, 2.07vw, 41px)",
            "--lens-r": "clamp(120px, 9vw, 175px)",
          }}
        >
          {/* 컬러 렌즈 링 — 커서 추종, 렌즈임을 명시 (카드 위 z, 텍스트 아래) */}
          <div ref={lensRingRef} aria-hidden className="a-lens-ring" />

          {/* 여백 스크롤 커서 — 카드 영역 밖에서만 표시 (렌즈와 상호 배타) */}
          <div ref={aCursorRef} aria-hidden className="pd-cursor has-mode mode-scroll">
            <span className="pd-cur-core">
              <svg
                className="pd-cur-ic pd-ic-scroll"
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="#1c1e0d"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 4 v14 M6 12 l6 6 6 -6" />
              </svg>
            </span>
          </div>
          {/* 카드 무대 — 우측, 상하 full-bleed (sticky overflow로 클립). 호버 스포트라이트용 포인터 허용 */}
          <div
            ref={cardStageRef}
            aria-hidden
            className="absolute inset-0 z-0 overflow-hidden"
            style={{ opacity: 0 }}
          >
            <div
              ref={colWrapRRef}
              className="absolute top-0 bottom-0"
              style={{ right: "clamp(20px, 2.6vw, 50px)", width: "var(--a-card-w)" }}
            >
              <CardColumn cards={RIGHT_SET} colRef={rightColRef} stagger />
            </div>
            <div
              ref={colWrapLRef}
              className="absolute top-0 bottom-0"
              style={{
                right: "calc(clamp(20px, 2.6vw, 50px) + var(--a-card-w) + clamp(16px, 1.6vw, 30px))",
                width: "var(--a-card-w)",
              }}
            >
              <CardColumn cards={LEFT_SET} colRef={leftColRef} />
            </div>
          </div>

          {/* 중앙 메시지 01·02 — 시퀀스 도입부(#2), 슬로건 등장 시 위로 퇴장(#3) */}
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-[18px] xl:gap-[26px] pointer-events-none">
            {ABOUT_MESSAGES.map((msg, i) => (
              <QuoteMessage
                key={i}
                msg={msg}
                center
                msgRef={(el) => (centerMsgRefs.current[i] = el)}
              />
            ))}
          </div>

          {/* 텍스트 컬럼 — 좌측. 메시지는 헤딩 "바로 아래" 고정 간격(Figma 193:196)
              — justify-between 금지: 세로가 큰 화면에서 100vh 전체로 벌어져 깨짐 */}
          <div
            ref={contentRef}
            className="relative z-20 h-full flex flex-col pointer-events-none"
            style={{
              padding: "var(--a-pad)",
              maxWidth: "min(62%, 900px)",
              opacity: ready ? 1 : 0,
              transition: "opacity 0.5s ease-out",
            }}
          >
            {/* 상단: About Us 라벨 + 3줄 헤딩 (아래 등장 → 중앙 → 좌상단, 정렬 보간) */}
            <div ref={headWrapRef} className="will-change-transform" style={{ opacity: 0 }}>
              <p
                ref={labelRef}
                className="text-[var(--color-brand-red)] font-bold text-[15px] md:text-[19px] xl:text-[20px] tracking-[-0.01em] inline-flex items-center gap-[8px] will-change-transform"
              >
                <span>About Us</span>
                <span
                  aria-hidden
                  className="inline-block w-[10px] h-[10px] rounded-full bg-[var(--color-brand-red)]"
                />
              </p>
              <h2
                className="mt-[20px] xl:mt-[24px] font-bold leading-[1.4] tracking-[-0.018em] text-left"
                style={{ fontSize: "clamp(34px, 3.02vw, 58px)" }}
              >
                {ABOUT_FLAT.map((line, li) => (
                  <span
                    key={li}
                    ref={(el) => (lineRefs.current[li] = el)}
                    className="block whitespace-nowrap will-change-transform"
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

            {/* 인용 메시지 01 / 02 — 헤딩 아래 고정 간격으로 재등장 */}
            <div className="flex flex-col gap-[16px] xl:gap-[20px] mt-[clamp(36px,5.5vh,64px)]">
              {ABOUT_MESSAGES.map((msg, i) => (
                <QuoteMessage
                  key={i}
                  msg={msg}
                  msgRef={(el) => (msgRefs.current[i] = el)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * ForBusinessStage — Figma 165:121 (sequence 1~6) + 코멘트 #5·#6·#7·#8·#12·#13
 *   흰 배경 슬로건(레드 악센트 + 인라인 야경 칩) scrub → 칩 확장(캡슐→풀블리드)
 *   → 다크 슬로건(화이트/라임) 등장 → 좌측 이동 → 우측 카드 3장 슬라이드 + 배경 패럴랙스
 *   → 100%: 배경 좌하단 radius로 #222(Product) 연결
 */
function ForBusinessStage() {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const whiteLayerRef = useRef(null); // 흰 배경 레이어 (확장 완료 후 페이드아웃 → 출구 #222 노출)
  const whiteWordRefs = useRef([]); // 흰 배경 슬로건 단어 (scrub)
  const chipRef = useRef(null); // 슬로건 줄 안 야경 칩 (clip 시작 rect)
  const bgLayerRef = useRef(null); // 야경 레이어 (clip-path 확장/출구 radius)
  const bgImgRef = useRef(null); // 야경 img (패럴랙스 슬라이드)
  const darkHeadRef = useRef(null); // 다크 슬로건 + 라벨 (center → 좌상단)
  const darkLabelRef = useRef(null);
  const darkLineRefs = useRef([]);
  const fbColRef = useRef(null); // 우측 카드 세로 스택 (아래→위 슬라이드)
  const fbStageRef = useRef(null); // sticky 무대 (커스텀 스크롤 커서)
  const fbCursorRef = useRef(null); // 여백 스크롤 커서
  const statValRefs = useRef([]); // DATA 카드 통계 값 (count-up)
  const geo = useRef({ vw: 0, vh: 0 });
  const accentRGBRef = useRef([203, 13, 53]);
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

    const measure = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const stageH = vh * (FB_STAGE_VH / 100);
      const pad = Math.max(28, Math.min(150, vw * 0.078));

      // 칩 rect — bgLayer(무대 전체) 좌표계 기준. clip-path 시작 사각형.
      let chip = { x: vw / 2 - 60, y: stageH - vh / 2, w: 120, h: 56 };
      if (chipRef.current && bgLayerRef.current) {
        const cr = chipRef.current.getBoundingClientRect();
        const br = bgLayerRef.current.getBoundingClientRect();
        chip = { x: cr.left - br.left, y: cr.top - br.top, w: cr.width, h: cr.height };
      }
      // 캡슐(802×369 @1920) — 핀 시 보이는 하단 100vh의 정중앙.
      const capW = Math.min(vw * 0.8, Math.max(520, vw * 0.418));
      const capH = capW * (369 / 802);
      const cap = {
        x: (vw - capW) / 2,
        y: stageH - vh + (vh - capH) / 2,
        w: capW,
        h: capH,
      };

      // 다크 슬로건 center 오프셋 + 줄/라벨 가운데→좌측 정렬 보간량
      const head = darkHeadRef.current;
      let centerX = 0;
      let centerY = 0;
      let lineOffsets = [];
      let labelOffset = 0;
      if (head) {
        const headW = head.offsetWidth;
        const headH = head.offsetHeight;
        centerX = Math.max(0, (vw - 2 * pad - headW) / 2);
        centerY = Math.max(0, (vh - 2 * pad - headH) / 2);
        lineOffsets = darkLineRefs.current.map((el) => {
          if (!el) return 0;
          const range = document.createRange();
          range.selectNodeContents(el);
          const w = range.getBoundingClientRect().width;
          return Math.max(0, (headW - w) / 2);
        });
        if (darkLabelRef.current)
          labelOffset = Math.max(0, (headW - darkLabelRef.current.offsetWidth) / 2);
      }

      // 카드 스택 슬라이드 종점 — 컬럼 하단이 하단 패딩에 정렬 (Figma 194:420: top -210)
      const colH = fbColRef.current ? fbColRef.current.offsetHeight : vh;

      geo.current = { vw, vh, stageH, chip, cap, centerX, centerY, lineOffsets, labelOffset, pad, colH };
    };

    const insetClip = (r, stageW, stageH, rad) =>
      `inset(${r.y.toFixed(1)}px ${(stageW - r.x - r.w).toFixed(1)}px ${(stageH - r.y - r.h).toFixed(1)}px ${r.x.toFixed(1)}px round ${rad.toFixed(1)}px)`;
    const lerpRect = (a, b, t) => ({
      x: lerp(a.x, b.x, t),
      y: lerp(a.y, b.y, t),
      w: lerp(a.w, b.w, t),
      h: lerp(a.h, b.h, t),
    });

    const update = () => {
      ticking = false;
      const node = trackRef.current;
      if (!node) return;
      if (window.innerWidth !== geo.current.vw || window.innerHeight !== geo.current.vh)
        measure();
      const g = geo.current;
      const rect = node.getBoundingClientRect();
      // 최하단 고정: 진입 구간(무대-뷰포트 = 50vh)은 내부 스크롤로 통과(p=0 유지)
      const max = Math.max(1, rect.height - g.stageH);
      const p = clamp01((-rect.top - (g.stageH - g.vh)) / max);

      // 1) 흰 배경 슬로건 scrub — DIM → #222 / 브랜드 레드
      const reveal = clamp01(p / FB_TEXT_END);
      const litAmt = clamp01((reveal - 0.05) / 0.9);
      const pos = litAmt * (TOTAL_FB_WHITE + 1);
      const acc = accentRGBRef.current;
      const words = whiteWordRefs.current;
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

      // 2) 야경 clip-path — 칩 → 캡슐(#5·#13) → 풀블리드 → 출구 좌하단 radius(#6)
      const stageW = g.vw;
      const stageH = g.stageH;
      let clip;
      if (p < FB_EXP1_AT) {
        clip = insetClip(g.chip, stageW, stageH, g.chip.h / 2);
      } else if (p < FB_EXP1_END) {
        const t = smoothstep(clamp01((p - FB_EXP1_AT) / (FB_EXP1_END - FB_EXP1_AT)));
        const r = lerpRect(g.chip, g.cap, t);
        clip = insetClip(r, stageW, stageH, lerp(g.chip.h / 2, g.cap.h / 2, t));
      } else if (p < FB_EXP2_END) {
        const t = smoothstep(clamp01((p - FB_EXP1_END) / (FB_EXP2_END - FB_EXP1_END)));
        const full = { x: 0, y: 0, w: stageW, h: stageH };
        const r = lerpRect(g.cap, full, t);
        clip = insetClip(r, stageW, stageH, lerp(g.cap.h / 2, 0, t));
      } else {
        // 풀블리드 구간은 clip 해제(none) — inset(0) 안티앨리어싱 경계로
        // 아래 레이어가 1px 비치는 헤어라인 방지. 출구 radius 때만 clip 적용.
        const exitT = smoothstep(clamp01((p - FB_RADIUS_AT) / (1 - FB_RADIUS_AT)));
        const R = lerp(0, Math.max(100, Math.min(140, g.vw * 0.0625)), exitT); // Figma rounded-bl-120
        clip = exitT > 0 ? `inset(0px round 0px 0px 0px ${R.toFixed(1)}px)` : "none";
      }
      if (bgLayerRef.current && bgLayerRef.current.dataset.clip !== clip) {
        bgLayerRef.current.style.clipPath = clip;
        bgLayerRef.current.dataset.clip = clip;
      }
      // 흰 배경 레이어 — 풀블리드 직후 페이드아웃(출구 radius에서 #222가 보이도록)
      if (whiteLayerRef.current)
        whiteLayerRef.current.style.opacity = (1 - clamp01((p - FB_EXP2_END) / 0.05)).toFixed(3);

      // 3) 다크 슬로건 — 배경 ~90% 시 페이드인(#12) → 좌상단 이동(#8)
      const dIn = smoothstep(clamp01((p - FB_DARKIN_AT) / FB_DARKIN_DUR));
      const mE = easeInOutCubic(clamp01((p - FB_MOVE_AT) / (FB_MOVE_END - FB_MOVE_AT)));
      if (darkHeadRef.current) {
        darkHeadRef.current.style.opacity = dIn.toFixed(3);
        darkHeadRef.current.style.transform = `translate3d(${lerp(g.centerX, 0, mE).toFixed(1)}px, ${(lerp(g.centerY, 0, mE) + (1 - dIn) * 28).toFixed(1)}px, 0)`;
      }
      const lo = g.lineOffsets;
      if (lo) {
        const lines = darkLineRefs.current;
        for (let i = 0; i < lines.length; i++) {
          if (lines[i])
            lines[i].style.transform = `translate3d(${(lo[i] * (1 - mE)).toFixed(1)}px, 0, 0)`;
        }
      }
      if (darkLabelRef.current)
        darkLabelRef.current.style.transform = `translate3d(${((g.labelOffset || 0) * (1 - mE)).toFixed(1)}px, 0, 0)`;

      // 4) 카드 세로 스택 — 화면 아래에서 위로 슬라이드(#7·#8). 종점 = 하단 패딩 정렬.
      //    배경(높이 142%)은 top 0 → -42%로 함께 스크롤-스루 (Figma 193:247→194:420)
      const cT = easeInOutCubic(clamp01((p - FB_CARDS_AT) / (FB_CARDS_END - FB_CARDS_AT)));
      if (fbColRef.current) {
        const endTy = g.vh - g.pad - g.colH; // 컬럼 하단 = 뷰포트 하단 - 패딩
        const ty = lerp(g.vh + 60, endTy, cT);
        fbColRef.current.style.transform = `translate3d(0, ${ty.toFixed(1)}px, 0)`;
      }
      if (bgImgRef.current)
        bgImgRef.current.style.transform = `translate3d(0, ${(-0.42 * g.stageH * cT).toFixed(1)}px, 0)`;

      // 5) DATA 카드 count-up
      const vals = statValRefs.current;
      for (let i = 0; i < vals.length; i++) {
        const v = vals[i];
        if (!v) continue;
        const lin = clamp01((p - FB_COUNT_AT - i * 0.025) / FB_COUNT_DUR);
        const s = FB_STATS[i];
        const next = formatCount(lin, s.target, s.suffix, s.noComma);
        if (v.dataset.v !== next) {
          v.textContent = next;
          v.dataset.v = next;
        }
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

  // 여백 스크롤 커서 — Product와 동일 패턴(icon-swap md). 카드(cursor-native) 위는 기본 커서.
  useEffect(() => {
    const stage = fbStageRef.current;
    const cur = fbCursorRef.current;
    if (!stage || !cur) return;
    if (window.matchMedia("(hover: none), (pointer: coarse)").matches) return;
    stage.classList.add("pd-cursor-stage");
    let mx = 0;
    let my = 0;
    let cx = 0;
    let cy = 0;
    let raf = 0;
    let on = false;
    const frame = () => {
      raf = 0;
      cx = lerp(cx, mx, 0.18);
      cy = lerp(cy, my, 0.18);
      cur.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0)`;
      if (on) raf = requestAnimationFrame(frame);
    };
    const onMove = (e) => {
      const r = stage.getBoundingClientRect();
      mx = e.clientX - r.left;
      my = e.clientY - r.top;
      if (!on) {
        on = true;
        cx = mx;
        cy = my;
        if (!raf) raf = requestAnimationFrame(frame);
      }
      // 콘텐츠 카드 위에서는 커스텀 커서를 숨기고 기본 커서로 복귀
      stage.classList.toggle("is-on", !e.target.closest(".cursor-native"));
    };
    const onLeave = () => {
      on = false;
      stage.classList.remove("is-on");
    };
    stage.addEventListener("mousemove", onMove, { passive: true });
    stage.addEventListener("mouseleave", onLeave);
    return () => {
      stage.removeEventListener("mousemove", onMove);
      stage.removeEventListener("mouseleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // 가로형 카드 공통 (Figma 193:400 — 600×300, #f3f3f3, r20) — 세로 스택, 컬럼째로 슬라이드
  const cardBase =
    "relative w-full shrink-0 bg-[#f3f3f3] rounded-[20px] overflow-hidden flex flex-col";
  const cardStyle = {
    height: "clamp(210px, 15.63vw, 300px)",
    padding: "clamp(20px, 1.7vw, 32px)",
    boxShadow: "0 24px 50px -30px rgba(0,0,0,0.5)",
  };

  return (
    <section ref={sectionRef} aria-label="비즈니스 소개" className="relative bg-[#222]">
      {/* 데스크톱(lg+) — Figma 165:121 시퀀스 */}
      <div className="hidden lg:block">
        <div ref={trackRef} style={{ height: `${FB_TRACK_VH}vh` }} className="relative">
          {/* 무대 150vh — h-screen(100vh) 회귀 금지: 배경·섹션이 뷰포트보다 길어야 함.
              top 음수(-50vh) = 최하단 고정: 상단 50vh는 진입 스크롤로 통과 후 핀 */}
          <div
            ref={fbStageRef}
            className="sticky w-full overflow-hidden bg-[#222]"
            style={{
              top: `calc(100vh - ${FB_STAGE_VH}vh)`,
              height: `${FB_STAGE_VH}vh`,
              "--fb-pad": "clamp(28px, 7.8vw, 150px)",
            }}
          >
            {/* 0) 흰 배경 레이어 — 확장 완료 후 페이드아웃 → 출구 radius에서 #222 노출 */}
            <div ref={whiteLayerRef} aria-hidden className="absolute inset-0 bg-white" />

            {/* 여백 스크롤 커서 — 카드 위에서는 기본 커서로 복귀(cursor-native) */}
            <div ref={fbCursorRef} aria-hidden className="pd-cursor has-mode mode-scroll">
              <span className="pd-cur-core">
                <svg
                  className="pd-cur-ic pd-ic-scroll"
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="#1c1e0d"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 4 v14 M6 12 l6 6 6 -6" />
                </svg>
              </span>
            </div>

            {/* 1) 흰 배경 슬로건 — 핀 시 보이는 하단 100vh 중앙. 레드 라벨 + 인라인 칩 */}
            <div
              className="absolute inset-x-0 bottom-0 h-screen z-10 flex flex-col items-center justify-center"
              style={{ opacity: ready ? 1 : 0, transition: "opacity .6s ease-out" }}
            >
              <p className="text-[var(--color-brand-red)] font-bold tracking-[-0.01em] inline-flex items-center gap-[8px] mb-[18px] xl:mb-[24px]"
                style={{ fontSize: "clamp(16px, 1.15vw, 22px)" }}
              >
                <span>For Business</span>
                <span aria-hidden className="inline-block w-[10px] h-[10px] rounded-full bg-[var(--color-brand-red)]" />
              </p>
              <h2
                className="font-bold leading-[1.4] tracking-[-0.018em] text-center"
                style={{ fontSize: "clamp(34px, 3.125vw, 60px)" }}
              >
                {FB_WHITE_FLAT.map((line, li) => (
                  <span key={li} className="block whitespace-nowrap">
                    {line.map((w, wi) =>
                      w.chip ? (
                        <span
                          key={wi}
                          ref={chipRef}
                          aria-hidden
                          className="inline-block align-middle rounded-full bg-[#222] mx-[0.18em] mb-[0.12em]"
                          style={{
                            width: "clamp(72px, 6.8vw, 130px)",
                            height: "clamp(34px, 3.1vw, 60px)",
                          }}
                        />
                      ) : (
                        <span
                          key={wi}
                          ref={(el) => (whiteWordRefs.current[w.gi] = el)}
                          data-accent={w.tone === "accent" ? "1" : "0"}
                          className="inline-block whitespace-pre"
                          style={{ color: DIM }}
                        >
                          {w.text}
                          {wi < line.length - 1 && !w.noSpace ? " " : ""}
                        </span>
                      ),
                    )}
                  </span>
                ))}
              </h2>
            </div>

            {/* 2) 야경 레이어 — 칩 rect에서 시작해 캡슐→풀블리드로 확장 (clip-path) */}
            <div
              ref={bgLayerRef}
              aria-hidden
              className="absolute inset-0 z-20 will-change-[clip-path] overflow-hidden"
              style={{ clipPath: "inset(45% 48% 45% 48% round 999px)" }}
            >
              {/* 높이 142% (Figma) — 카드 단계에서 top 0 → -42%로 스크롤-스루 */}
              <img
                ref={bgImgRef}
                src={fbCityNight}
                alt=""
                draggable="false"
                className="absolute left-0 top-0 w-full object-cover select-none will-change-transform"
                style={{ height: "142%" }}
              />
              <div className="absolute inset-0 bg-black/40" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/20" />
            </div>

            {/* 3) 다크 콘텐츠 — 핀 시 보이는 하단 100vh */}
            <div className="absolute inset-x-0 bottom-0 h-screen z-30 overflow-hidden">
              {/* 다크 슬로건 + 라벨 (center → 좌상단) */}
              <div
                ref={darkHeadRef}
                className="absolute will-change-transform"
                style={{ top: "var(--fb-pad)", left: "var(--fb-pad)", opacity: 0 }}
              >
                <p
                  ref={darkLabelRef}
                  className="text-white font-bold tracking-[-0.01em] inline-flex items-center gap-[8px] mb-[16px] xl:mb-[22px] will-change-transform"
                  style={{ fontSize: "clamp(17px, 1.46vw, 28px)" }}
                >
                  <span>For Business</span>
                  <span aria-hidden className="inline-block w-[10px] h-[10px] rounded-full bg-white" />
                </p>
                <h2
                  className="font-bold leading-[1.4] tracking-[-0.018em] text-left"
                  style={{ fontSize: "clamp(34px, 3.125vw, 60px)" }}
                >
                  {BUSINESS_LINES.map((line, li) => (
                    <span
                      key={li}
                      ref={(el) => (darkLineRefs.current[li] = el)}
                      className="block whitespace-nowrap will-change-transform"
                    >
                      {line.map((w, wi) => (
                        <span
                          key={wi}
                          className="inline-block whitespace-pre"
                          style={{ color: w.tone === "accent" ? FB_LIME : "#fff" }}
                        >
                          {w.text}
                          {wi < line.length - 1 && !w.noSpace ? " " : ""}
                        </span>
                      ))}
                    </span>
                  ))}
                </h2>
              </div>

              {/* 우측 카드 트랙 — 화면 밖(우측)에서 좌측으로 슬라이드.
                  외부 div = 가로 슬라이드(update가 transform 기록) / 내부 div = 세로 중앙 정렬 */}
              {/* 우측 카드 세로 스택 (Figma 193:400 — 가로형 600×300 ×3, gap 30)
                  컬럼 전체가 화면 아래에서 위로 슬라이드 → 끝에서 하단 패딩 정렬 */}
              <div
                className="absolute inset-y-0"
                style={{ right: "var(--fb-pad)", width: "clamp(420px, 31.3vw, 600px)" }}
              >
                <div
                  ref={fbColRef}
                  className="cursor-native absolute left-0 top-0 w-full flex flex-col gap-[clamp(20px,1.6vw,30px)] will-change-transform"
                  style={{ transform: "translate3d(0, 120vh, 0)" }}
                >
                  {/* card 1 — 2026 가톨릭대 낙찰 */}
                  <article
                    className={cardBase}
                    style={cardStyle}
                    aria-label="2026 가톨릭대학교 경조사 화환 납품 낙찰업체"
                  >
                    <div className="flex items-start justify-between">
                      <span className="rounded-full bg-[var(--color-brand-red)] px-[14px] py-[8px] text-[12px] xl:text-[13px] font-bold text-white whitespace-nowrap">
                        {FB_BID.badge}
                      </span>
                      <span className="text-[11px] xl:text-[12px] font-bold tracking-[0.18em] text-[#999] uppercase">
                        Official
                      </span>
                    </div>
                    <div className="mt-auto flex flex-col gap-[8px]">
                      <p
                        className="text-[#222] font-bold leading-[1.3] tracking-[-0.02em]"
                        style={{ fontSize: "clamp(19px, 1.35vw, 26px)" }}
                      >
                        가톨릭대학교
                        <br />
                        경조사 화환 납품 낙찰업체
                      </p>
                      <p className="text-[#888] leading-[1.5]" style={{ fontSize: "clamp(12px, 0.8vw, 15px)" }}>
                        {FB_BID.desc}
                      </p>
                    </div>
                  </article>

                  {/* card 2 — 함께하는 파트너사 (마퀴 2행) */}
                  <article className={cardBase} style={cardStyle} aria-label="함께하는 파트너사">
                    <div className="flex items-center justify-between gap-[12px]">
                      <p
                        className="text-[#222] font-bold leading-[1.3] tracking-[-0.01em] whitespace-nowrap"
                        style={{ fontSize: "clamp(19px, 1.35vw, 26px)" }}
                      >
                        함께하는 파트너사
                      </p>
                      <p
                        className="text-[var(--color-brand-red)] font-bold whitespace-nowrap"
                        style={{ fontSize: "clamp(14px, 1vw, 18px)" }}
                      >
                        200+ 제휴 기업
                      </p>
                    </div>
                    <div className="mt-auto flex flex-col gap-[10px]">
                      {FB_PARTNERS.slice(0, 2).map((row, ri) => (
                        <div key={ri} className="overflow-hidden">
                          <div
                            className={`flex w-max gap-[8px] ${ri % 2 === 0 ? "fb-marquee-l" : "fb-marquee-r"}`}
                            style={{ "--fb-marquee-dur": `${30 + ri * 6}s` }}
                          >
                            {[...row, ...row].map((name, ci) => (
                              <span
                                key={ci}
                                aria-hidden={ci >= row.length}
                                className="shrink-0 rounded-[8px] bg-[#222]/[0.05] border border-[#222]/10 px-[12px] py-[8px] text-[13px] font-semibold text-[#222] whitespace-nowrap"
                              >
                                {name}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </article>

                  {/* card 3 — DATA 통계 2×2 그리드 (count-up) */}
                  <article className={cardBase} style={cardStyle} aria-label="올해의경조사 주요 지표">
                    <p className="text-[12px] xl:text-[13px] font-bold tracking-[0.18em] text-[#888] uppercase">
                      Data
                    </p>
                    <div className="mt-auto grid grid-cols-2 gap-x-[clamp(18px,1.6vw,30px)] gap-y-[clamp(10px,1.3vh,16px)]">
                      {FB_STATS.map((s, i) => (
                        <div key={i} className="flex flex-col gap-[4px] border-t border-[#222]/10 pt-[10px]">
                          <p className="text-[#888] font-medium whitespace-nowrap" style={{ fontSize: "clamp(12px, 0.8vw, 14px)" }}>
                            {s.label}
                          </p>
                          <p
                            ref={(el) => (statValRefs.current[i] = el)}
                            data-v={`0${s.suffix}`}
                            className="text-[#222] font-bold tabular-nums tracking-[-0.01em]"
                            style={{ fontSize: "clamp(19px, 1.45vw, 28px)" }}
                          >
                            {`0${s.suffix}`}
                          </p>
                        </div>
                      ))}
                    </div>
                  </article>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 모바일(<lg) — 정적 스택 (흰 도입 + 다크 야경 카드) */}
      <div className="lg:hidden relative overflow-hidden bg-white">
        <div className="px-6 md:px-12 pt-[64px] pb-[40px]">
          <p className="text-[var(--color-brand-red)] font-bold text-[15px] inline-flex items-center gap-[8px]">
            <span>For Business</span>
            <span aria-hidden className="inline-block w-[8px] h-[8px] rounded-full bg-[var(--color-brand-red)]" />
          </p>
          <h2 className="mt-[14px] font-bold text-[30px] md:text-[40px] leading-[1.4] tracking-[-0.018em] text-[#222]">
            {BUSINESS_LINES.map((line, li) => (
              <span key={li} className="block">
                {line.map((w, wi) => (
                  <span
                    key={wi}
                    className="inline-block whitespace-pre"
                    style={{ color: w.tone === "accent" ? "var(--color-brand-red)" : "#222" }}
                  >
                    {w.text}
                    {wi < line.length - 1 && !w.noSpace ? " " : ""}
                  </span>
                ))}
              </span>
            ))}
          </h2>
        </div>
        <div className="relative mx-6 md:mx-12 mb-[64px] rounded-[20px] overflow-hidden">
          <img src={fbCityNight} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/55" />
          <div className="relative flex flex-col gap-[14px] p-[22px]">
            {FB_STATS.map((s, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-[12px] border border-white/15 px-[20px] py-[18px]"
                style={{
                  background: "rgba(14,14,14,0.35)",
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                }}
              >
                <p className="text-white/85 font-medium text-[15px]">{s.label}</p>
                <p className="text-white font-bold text-[24px] tabular-nums">
                  {`${s.noComma ? s.target : s.target.toLocaleString("ko-KR")}${s.suffix}`}
                </p>
              </div>
            ))}
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
      <ForBusinessStage />
    </>
  );
}
