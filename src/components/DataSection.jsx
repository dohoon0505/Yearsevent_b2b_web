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

// 위로 이동 단계에서 전환되는 2줄 레이아웃 (색칠 완료 후 정적 표시):
//   "모든 위대한 비즈니스는 작은 축하와" / "깊은 위로 에서 시작되는 것을 아시나요?"
const ABOUT_2LINES = [
  [
    { text: "모든", tone: "dark" },
    { text: "위대한", tone: "dark" },
    { text: "비즈니스는", tone: "dark" },
    { text: "작은", tone: "accent" },
    { text: "축하", tone: "accent", noSpace: true },
    { text: "와", tone: "dark" },
  ],
  [
    { text: "깊은", tone: "accent" },
    { text: "위로", tone: "accent" },
    { text: "에서", tone: "dark" },
    { text: "시작되는", tone: "dark" },
    { text: "것을", tone: "dark" },
    { text: "아시나요?", tone: "dark" },
  ],
];

// For Business 슬로건 평탄화(연속 스크럽용)
let _gb = 0;
const BUSINESS_FLAT = BUSINESS_LINES.map((line) =>
  line.map((w) => ({ ...w, gi: _gb++ })),
);
const TOTAL_BUSINESS = _gb;

// For Business — DATA 통계 (Figma 165:107) — 하단 글래스 칩 3종 count-up
//   target: count-up 목표값, suffix: 값 뒤 문자 (200+ / 700,000+), noComma: 천단위 콤마 제외(연도)
const FB_STATS = [
  { label: "설립일", target: 2016, suffix: "", noComma: true },
  { label: "경조사 제휴기업", target: 200, suffix: "+" },
  { label: "누적 주문처리", target: 700000, suffix: "+" },
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

// 우상단 카드 A — 2026 가톨릭대학교 경조사 화환 납품 낙찰 (※ 문구는 추후 교체 가능)
const FB_BID = {
  badge: "2026 공식 낙찰",
  title: ["가톨릭대학교", "경조사 화환 납품", "낙찰업체"],
  desc: "2026년 가톨릭대학교 경조사 화환 공식 납품 협력사로 선정되었습니다.",
};

// For Business 다단계 무대 — Figma 165:121 (sequence 1~6)
//   1) 배경  2) 슬로건 scrub  3) 상단 이동+라벨+칩1  4) 칩2  5) 칩3  6) 글래스 패널
const FB_TRACK_VH = 560;
// 인터랙션 임계값 (스크롤 진행률 p ∈ [0, 1])
const FB_TEXT_END = 0.15; // 슬로건 단어 scrub 완료 (seq2)
const FB_MOVE_END = 0.27; // 텍스트 세로중앙→상단 이동 + For Business 라벨 등장 (seq3)
const FB_STAT_AT = [0.34, 0.47, 0.6]; // 통계 칩 등장/카운트업 시작 (seq3,4,5)
const FB_STAT_DUR = 0.12; // 칩 등장+카운트업 구간
// 우상단 2-카드 (md 05 wave-blob): 글래스 프론트 → 스크롤 시 물결 블롭으로 내부 데이터 reveal
const FB_CARD_AT = 0.4; // 글래스 카드 페이드인(등장) → 0.5 완료
const FB_CARD_DUR = 0.1;
const FB_WAVE_AT = 0.58; // 물결 블롭 reveal 시작(글래스 0.5~0.58 노출 후)
const FB_WAVE_DUR = 0.26; // reveal 진행 구간 → 카드A 0.84, 카드B 0.89 완료
const FB_WAVE_STAGGER = 0.05; // 2번째 카드 약간 늦게

// 다크 배경 위 scrub 색 — DIM(반투명 회색) → WHITE(본문) / → LIME(강조 #e2ef5d)
const FB_DIM_RGB = [108, 114, 130];
const FB_WHITE_RGB = [255, 255, 255];
const FB_LIME_RGB = [226, 239, 93]; // #e2ef5d

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

// 카드별 후보 이미지 중 1개를 랜덤 선택(페이지 로드 1회 고정).
const PICKED_CARDS = SLIDER_CARDS.map((c) => ({
  ...c,
  img: c.imgs[Math.floor(Math.random() * c.imgs.length)],
}));
// 좌/우 2개 컬럼 — 반대 방향(좌↑ / 우↓) 무한 루프 수직 롤링.
// 각 세트(아래 배열)를 2벌 이어붙여 렌더하고 translateY를 세트 높이로 modulo →
// 이음새 없이 같은 카드가 반복 등장.
// ⚠ 두 컬럼이 같은 이미지를 공유하면 반대 방향 드리프트로 어느 순간 같은 줄에
//    동일 카드가 정렬된다 → 좌(짝수)/우(홀수)로 이미지를 분리해 교집합을 없앤다.
const LEFT_SET = PICKED_CARDS.filter((_, i) => i % 2 === 0);
const RIGHT_SET = PICKED_CARDS.filter((_, i) => i % 2 === 1);

// About Us 인용 메시지 (Figma 155:35 / 155:58) — 故 이병철 회장 어록
const ABOUT_MESSAGES = [
  { quote: "세상에 우연은 없다. 한번 맺은 인연을 소중히 하라.", source: "故이병철 회장 어록 中" },
  { quote: "남이 잘됨을 축복하라. 그 축복이 메아리처럼 나를 향해 돌아온다.", source: "故이병철 회장 어록 中" },
];

// ───────── About Us 다단계 무대 (Figma 155:89 sequence 01~03) ─────────
const A_TRACK_VH = 460;
const A_TEXT_END = 0.2; // 텍스트 색칠(scrub) 완료
const A_TRANS_END = 0.28; // 텍스트 상단 이동 + 카드 패럴랙스 등장 완료
const A_MSG1_AT = 0.3; // 전체 스크롤 30% — Message 01 아래→위 등장
const A_MSG2_AT = 0.6; // 전체 스크롤 60% — Message 02 아래→위 등장
const A_MSG_DUR = 0.08; // 메시지 등장 구간 길이
const A_ROLL_CYCLES = 0.6; // 등장 후 전체 구간 동안 카드가 도는 바퀴 수(롤링량↓ — 느리게)

const clamp01 = (v) => Math.max(0, Math.min(1, v));
const lerp = (a, b, t) => a + (b - a) * t;
// 시작·끝 속도 0 → 전환(텍스트 이동/슬라이더 등장)이 툭 튀지 않고 매끄럽게 가감속
const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

// ───────── 물결 블롭 clip-path (card-wavy-swap / wave-blob, md 05 그대로 이식) ─────────
// coverage c(0~1)에 따라 중앙에서 5-로브 물결 블롭이 바깥으로 확장 → 내부 데이터 reveal.
const __r = (n) => Math.round(n * 10) / 10;
const CLIP_ZERO = 'path("M0 0Z")';
const clipFull = (w, h) => `path("M0 0H${__r(w)}V${__r(h)}H0Z")`;
// 닫힌 매끄러운 2차 베지어(블롭) — 점들을 중점 보간해 둥글게 잇는다.
function smoothClosed(pts) {
  const n = pts.length;
  const sx = (pts[n - 1][0] + pts[0][0]) / 2;
  const sy = (pts[n - 1][1] + pts[0][1]) / 2;
  let d = "M" + __r(sx) + " " + __r(sy);
  for (let i = 0; i < n; i++) {
    const q = pts[(i + 1) % n];
    const xc = (pts[i][0] + q[0]) / 2;
    const yc = (pts[i][1] + q[1]) / 2;
    d += " Q" + __r(pts[i][0]) + " " + __r(pts[i][1]) + " " + __r(xc) + " " + __r(yc);
  }
  return d + "Z";
}
// 반지름 R=c·maxR, 각도별 r=R(1+af·sin(a·lobes)) 로 lobes개 로브의 물결 블롭.
function waveBlobClip(c, w, h, lobes = 5, af = 0.12) {
  if (c <= 0) return CLIP_ZERO;
  if (c >= 1) return clipFull(w, h);
  const cx = w / 2;
  const cy = h / 2;
  const maxR = (Math.hypot(w, h) / 2) * 1.18;
  const R = c * maxR;
  const s = Math.max(28, lobes * 6);
  const p = [];
  for (let i = 0; i < s; i++) {
    const a = (i / s) * Math.PI * 2;
    const r = R * (1 + af * Math.sin(a * lobes));
    p.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return 'path("' + smoothClosed(p) + '")';
}

// 글래스 카드 공통 머티리얼 (밝은 반투명 + blur + saturate + 상단 림 하이라이트)
const FB_GLASS_CARD = {
  background:
    "linear-gradient(135deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.045) 55%, rgba(255,255,255,0.02) 100%)",
  backdropFilter: "blur(26px) saturate(160%)",
  WebkitBackdropFilter: "blur(26px) saturate(160%)",
  boxShadow:
    "0 24px 60px -26px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.4)",
};

// 카드 컬럼 1개 — 세트를 2벌 이어붙여 무한 루프 롤링(translateY modulo)
//   stagger=true → 반 카드만큼 위로 시작 오프셋(우측 컬럼 마소너리: 같은 줄 정렬 방지)
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
          className="relative w-full overflow-hidden rounded-[var(--a-card-r)] bg-[#e9e9ec]"
          style={{ aspectRatio: "400 / 520" }}
        >
          <img
            src={card.img}
            alt=""
            loading="eager"
            decoding="async"
            draggable="false"
            className="absolute inset-0 w-full h-full object-cover select-none"
          />
          <div
            className="absolute inset-x-0 bottom-0 h-[30%] flex flex-col justify-end px-[22px] pb-[22px]"
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

// 인용 메시지 박스 (Figma Message 01/02) — 아래에서 위로 등장
function QuoteMessage({ msg, msgRef }) {
  return (
    <div
      ref={msgRef}
      className="w-fit max-w-[88vw] bg-[#f8f8f8] rounded-[20px] px-[28px] py-[22px] xl:px-[42px] xl:py-[30px] flex flex-col gap-[10px] xl:gap-[20px] will-change-transform"
      style={{ opacity: 0 }}
    >
      <p className="text-[#222] font-bold text-[16px] md:text-[18px] xl:text-[22px] leading-[1.4] tracking-[-0.01em] whitespace-nowrap">
        {msg.quote}
      </p>
      <p className="text-[#888] font-medium text-[12px] md:text-[14px] xl:text-[17px] leading-[1.4] tracking-[-0.01em]">
        {msg.source}
      </p>
    </div>
  );
}

function AboutScrollStage() {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const contentRef = useRef(null); // 패딩 적용된 flex 컨테이너 (콘텐츠 높이 측정)
  const headWrapRef = useRef(null); // About Us 라벨 + 헤딩 (색칠 단계 세로 중앙 이동)
  const headARef = useRef(null); // 3줄 헤딩(색칠) — 이동 시 축소+페이드아웃
  const headBRef = useRef(null); // 2줄 헤딩(정적) — 이동 시 페이드인
  const wordRefs = useRef([]);
  const cardStageRef = useRef(null); // 카드 무대 (fade-in)
  const leftColRef = useRef(null);
  const rightColRef = useRef(null);
  const msgRefs = useRef([]);
  const geo = useRef({ vh: 0, centerY: 0, unitL: 1, unitR: 1 });
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
      const content = contentRef.current;
      const head = headWrapRef.current;
      const lc = leftColRef.current;
      const rc = rightColRef.current;
      if (!content || !head) return;

      // 색칠 단계: 헤딩을 콘텐츠(패딩 제외) 영역 세로 중앙에 두기 위한 이동량.
      const cs = getComputedStyle(content);
      const padT = parseFloat(cs.paddingTop) || 0;
      const padB = parseFloat(cs.paddingBottom) || 0;
      const innerH = content.clientHeight - padT - padB;
      const headH = head.offsetHeight;
      const centerY = Math.max(0, (innerH - headH) / 2);

      // 무한 루프 단위 높이 = 세트 1벌 높이 = n*(카드높이+gap).
      //   컬럼은 세트 2벌 렌더 → translateY를 unit으로 modulo 하면 이음새 없이 반복.
      const unitOf = (col, n) => {
        if (!col || !col.firstElementChild) return vh;
        const ch = col.firstElementChild.getBoundingClientRect().height;
        const gap = parseFloat(getComputedStyle(col).rowGap) || 0;
        return n * (ch + gap);
      };
      const unitL = unitOf(lc, LEFT_SET.length);
      const unitR = unitOf(rc, RIGHT_SET.length);

      geo.current = { vh, centerY, unitL, unitR };
    };

    // 카드 롤 스무딩용 — 스크롤 직결 sp(target)을 매 프레임 lerp로 추종 → 부드러운 롤링.
    let dispSp = -1; // -1 = 미초기화(첫 프레임 snap)
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

      // 1) 텍스트 단어 색칠(scrub) — 스크롤 위치에 직결된 연속 보간.
      const reveal = clamp01(p / A_TEXT_END);
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
        const g = Math.round(DIM_RGB[1] + (t[1] - DIM_RGB[1]) * wf);
        const b = Math.round(DIM_RGB[2] + (t[2] - DIM_RGB[2]) * wf);
        const c = `rgb(${r}, ${g}, ${b})`;
        if (el.dataset.c !== c) {
          el.style.color = c;
          el.dataset.c = c;
        }
      }

      // 2) 헤딩 세로 중앙 → 상단 이동 + 3) 카드 무대 패럴랙스 등장 (동일 eased 동기화)
      const e = easeInOutCubic(clamp01((p - A_TEXT_END) / (A_TRANS_END - A_TEXT_END)));
      if (headWrapRef.current)
        headWrapRef.current.style.transform = `translate3d(0, ${lerp(g.centerY, 0, e).toFixed(1)}px, 0)`;
      if (cardStageRef.current) cardStageRef.current.style.opacity = e.toFixed(3);

      // 헤딩 3줄(A)→2줄(B) 전환 — A는 50/58 비율로 부드럽게 축소+페이드아웃, B는 페이드인.
      const cf = smoothstep(clamp01((e - 0.15) / 0.7)); // 크로스페이드 진행
      if (headARef.current) {
        headARef.current.style.transform = `scale(${lerp(1, 50 / 58, e).toFixed(4)})`;
        headARef.current.style.opacity = (1 - cf).toFixed(3);
      }
      if (headBRef.current) headBRef.current.style.opacity = cf.toFixed(3);

      // 4) 좌↑ / 우↓ 반대 방향 무한 루프 롤링 — 스크롤 직결 target을 lerp로 추종(부드럽게).
      //    move = sp * unit * CYCLES → unit으로 modulo 해 이음새 없이 반복.
      //    세트 2벌 렌더라 translateY ∈ [-unit, 0] 에서 항상 뷰포트가 채워짐.
      const targetSp = clamp01((p - A_TRANS_END) / (1 - A_TRANS_END));
      // 첫 프레임/큰 점프는 snap, 그 외엔 부드럽게 보간(관성감).
      dispSp = dispSp < 0 || Math.abs(targetSp - dispSp) > 0.25 ? targetSp : dispSp + (targetSp - dispSp) * 0.1;
      if (leftColRef.current) {
        const tyL = -((dispSp * g.unitL * A_ROLL_CYCLES) % g.unitL); // 위로
        leftColRef.current.style.transform = `translate3d(0, ${tyL.toFixed(2)}px, 0)`;
      }
      if (rightColRef.current) {
        const tyR = ((dispSp * g.unitR * A_ROLL_CYCLES) % g.unitR) - g.unitR; // 아래로
        rightColRef.current.style.transform = `translate3d(0, ${tyR.toFixed(2)}px, 0)`;
      }

      // 5) Message 01 @30% / Message 02 @60% — 아래에서 위로 등장
      const ms = msgRefs.current;
      for (let i = 0; i < ms.length; i++) {
        const el = ms[i];
        if (!el) continue;
        const at = i === 0 ? A_MSG1_AT : A_MSG2_AT;
        const m = smoothstep(clamp01((p - at) / A_MSG_DUR));
        el.style.opacity = m.toFixed(3);
        el.style.transform = `translate3d(0, ${((1 - m) * 36).toFixed(1)}px, 0)`;
      }

      // 섹션이 화면에 있는 동안 매 프레임 자가 반복 → 스크롤이 멈춰도 dispSp가
      // target까지 부드럽게 수렴(관성). 화면 밖이면 루프 중단(성능).
      if (visible) rafId = requestAnimationFrame(frame);
    };

    const ensure = () => {
      if (!rafId) rafId = requestAnimationFrame(frame);
    };
    const onResize = () => {
      measure();
      ensure();
    };

    // 섹션 가시성에 따라 rAF 루프 on/off
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

  return (
    <section ref={sectionRef} aria-label="회사 소개" className="relative bg-white">
      <div ref={trackRef} style={{ height: `${A_TRACK_VH}vh` }} className="relative">
        <div
          className="sticky top-0 h-screen w-full overflow-hidden"
          style={{
            // 카드 사이즈 토큰 — 반응형(좌우상하 패딩 150px @1920 기준)
            "--a-pad": "clamp(28px, 7.8vw, 150px)",
            "--a-card-w": "clamp(166px, 19.14vw, 368px)",
            "--a-card-gap": "clamp(16px, 1.61vw, 30px)",
            "--a-card-r": "clamp(21px, 2.07vw, 41px)",
          }}
        >
          {/* 카드 무대 — 우측, 상하 full-bleed (sticky overflow로 클립) */}
          <div
            ref={cardStageRef}
            aria-hidden
            className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
            style={{ opacity: 0 }}
          >
            {/* 우측 컬럼 (아래로 스크롤) */}
            <div
              className="absolute top-0 bottom-0"
              style={{ right: "clamp(20px, 2.6vw, 50px)", width: "var(--a-card-w)" }}
            >
              <CardColumn cards={RIGHT_SET} colRef={rightColRef} stagger />
            </div>
            {/* 좌측 컬럼 (위로 스크롤) — 우측 컬럼 왼쪽에 30px 간격 */}
            <div
              className="absolute top-0 bottom-0"
              style={{
                right: "calc(clamp(20px, 2.6vw, 50px) + var(--a-card-w) + clamp(16px, 1.6vw, 30px))",
                width: "var(--a-card-w)",
              }}
            >
              <CardColumn cards={LEFT_SET} colRef={leftColRef} />
            </div>
          </div>

          {/* 텍스트 컬럼 — 좌측, 헤딩 상단 / 메시지 하단 (justify-between) */}
          <div
            ref={contentRef}
            className="relative z-10 h-full flex flex-col justify-between pointer-events-none"
            style={{
              padding: "var(--a-pad)",
              maxWidth: "min(62%, 900px)",
              opacity: ready ? 1 : 0,
              transition: "opacity 0.5s ease-out",
            }}
          >
            {/* 상단: About Us 라벨 + 헤딩 (색칠 단계 세로 중앙 이동) */}
            <div ref={headWrapRef} className="will-change-transform">
              <p className="text-[var(--color-brand-red)] font-bold text-[15px] md:text-[19px] xl:text-[20px] tracking-[-0.01em] inline-flex items-center gap-[8px]">
                <span>About Us</span>
                <span
                  aria-hidden
                  className="inline-block w-[10px] h-[10px] rounded-full bg-[var(--color-brand-red)]"
                />
              </p>
              {/* 헤딩 스택 — A(3줄,색칠) 위에 B(2줄,정적) 오버레이. 이동 시 크로스페이드 */}
              <div className="relative mt-[20px] xl:mt-[24px]">
                {/* A: 3줄 58px — 색칠 인터랙션. 이동 시 50/58 비율로 축소 + 페이드아웃 */}
                <h2
                  ref={headARef}
                  className="font-bold leading-[1.4] tracking-[-0.018em] text-left origin-top-left will-change-transform"
                  style={{ fontSize: "clamp(34px, 3.02vw, 58px)" }}
                >
                  {ABOUT_FLAT.map((line, li) => (
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
                {/* B: 2줄 50px — 색칠 완료된 정적 헤딩. 초기 opacity 0 */}
                <h2
                  ref={headBRef}
                  aria-hidden
                  className="absolute top-0 left-0 font-bold leading-[1.4] tracking-[-0.018em] text-left will-change-[opacity]"
                  style={{ fontSize: "clamp(29px, 2.6vw, 50px)", opacity: 0 }}
                >
                  {ABOUT_2LINES.map((line, li) => (
                    <span key={li} className="block whitespace-nowrap">
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
            </div>

            {/* 하단: 인용 메시지 01 / 02 */}
            <div className="flex flex-col gap-[16px] xl:gap-[20px]">
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
 * ForBusinessStage — Figma 165:121 (sequence 1~6) · 다크 야경 + 글래스모피즘
 *   1) 배경(야경) 고정 + 오버레이
 *   2) [0~0.15] 슬로건 단어 scrub (화면 정중앙, dim→white / →lime)
 *   3) [0.15~0.27] 슬로건 좌상단 이동 + For Business 라벨 등장
 *   4~6) 하단 글래스 통계 칩 3종 순차 등장 + count-up (설립일/경조사/누적 주문처리)
 *   7) [0.74~] 우상단 글래스 패널(파트너) 등장
 */
function ForBusinessStage() {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const headWrapRef = useRef(null); // 슬로건 + 라벨 (center → 좌상단 이동)
  const labelRef = useRef(null); // For Business 라벨 (이동 후 페이드인)
  const wordRefs = useRef([]); // 슬로건 단어 (scrub)
  const lineRefs = useRef([]); // 슬로건 각 줄 (가운데정렬→좌측정렬 보간)
  const chipRefs = useRef([]); // 하단 통계 칩 (등장)
  const chipValRefs = useRef([]); // 통계 값 (count-up)
  const cardsWrapRef = useRef(null); // 우상단 2-카드 컨테이너(등장)
  const cardFrameRefs = useRef([]); // 카드 프레임(물결 블롭 dims 측정)
  const cardDataRefs = useRef([]); // 카드 내부 데이터 레이어(clip-path reveal)
  const geo = useRef({ vw: 0, vh: 0, centerX: 0, centerY: 0 });
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

    // 슬로건 헤드를 화면 정중앙에 두기 위한 이동량(centerX/Y) 측정.
    const measure = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const head = headWrapRef.current;
      if (!head) return;
      const pad = Math.max(28, Math.min(150, vw * 0.078));
      const headW = head.offsetWidth;
      const headH = head.offsetHeight;
      // 슬로건 각 줄의 실제 텍스트 폭 측정(Range) → (블록폭 - 줄폭)/2 = 가운데정렬 오프셋.
      // 좌상단 이동(mE 0→1)에 맞춰 이 오프셋을 0으로 보간하면 center→left 정렬이 매끄럽게 전환된다.
      const lineOffsets = lineRefs.current.map((el) => {
        if (!el) return 0;
        const range = document.createRange();
        range.selectNodeContents(el);
        const w = range.getBoundingClientRect().width;
        return Math.max(0, (headW - w) / 2);
      });
      // 카드 프레임 픽셀 치수(물결 블롭 path 좌표용) 캐시
      const cards = cardFrameRefs.current.map((el) =>
        el ? { w: el.clientWidth, h: el.clientHeight } : { w: 1, h: 1 },
      );
      geo.current = {
        vw,
        vh,
        centerX: Math.max(0, (vw - 2 * pad - headW) / 2),
        centerY: Math.max(0, (vh - 2 * pad - headH) / 2),
        lineOffsets,
        cards,
      };
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

      // 1) 슬로건 단어 scrub — DIM → WHITE(본문) / → LIME(강조)
      const reveal = clamp01(p / FB_TEXT_END);
      const litAmt = clamp01((reveal - 0.05) / 0.9);
      const pos = litAmt * (TOTAL_BUSINESS + 1);
      const words = wordRefs.current;
      for (let i = 0; i < words.length; i++) {
        const el = words[i];
        if (!el) continue;
        const wf = smoothstep(clamp01((pos - i) / 1.6));
        const t = el.dataset.accent === "1" ? FB_LIME_RGB : FB_WHITE_RGB;
        const r = Math.round(FB_DIM_RGB[0] + (t[0] - FB_DIM_RGB[0]) * wf);
        const gg = Math.round(FB_DIM_RGB[1] + (t[1] - FB_DIM_RGB[1]) * wf);
        const b = Math.round(FB_DIM_RGB[2] + (t[2] - FB_DIM_RGB[2]) * wf);
        const c = `rgb(${r}, ${gg}, ${b})`;
        if (el.dataset.c !== c) {
          el.style.color = c;
          el.dataset.c = c;
        }
      }

      // 2) 슬로건 center → 좌상단 이동 + 각 줄 가운데정렬→좌측정렬 보간 + For Business 라벨 페이드인
      const mE = easeInOutCubic(
        clamp01((p - FB_TEXT_END) / (FB_MOVE_END - FB_TEXT_END)),
      );
      if (headWrapRef.current)
        headWrapRef.current.style.transform = `translate3d(${lerp(g.centerX, 0, mE).toFixed(1)}px, ${lerp(g.centerY, 0, mE).toFixed(1)}px, 0)`;
      // 각 줄: (블록폭-줄폭)/2 → 0 으로 이동에 맞춰 보간. mE=0 가운데정렬, mE=1 좌측정렬.
      const lo = g.lineOffsets;
      if (lo) {
        const lines = lineRefs.current;
        for (let i = 0; i < lines.length; i++) {
          if (lines[i])
            lines[i].style.transform = `translate3d(${(lo[i] * (1 - mE)).toFixed(1)}px, 0, 0)`;
        }
      }
      if (labelRef.current)
        labelRef.current.style.opacity = clamp01((mE - 0.45) / 0.55).toFixed(3);

      // 3~5) 하단 통계 칩 순차 등장(아래→위) + count-up (스크롤 직결 linear)
      const chips = chipRefs.current;
      const vals = chipValRefs.current;
      for (let i = 0; i < chips.length; i++) {
        const at = FB_STAT_AT[i];
        const lin = clamp01((p - at) / FB_STAT_DUR);
        const ee = easeInOutCubic(lin);
        if (chips[i]) {
          chips[i].style.opacity = ee.toFixed(3);
          chips[i].style.transform = `translate3d(0, ${((1 - ee) * 40).toFixed(1)}px, 0)`;
        }
        const v = vals[i];
        if (v) {
          const s = FB_STATS[i];
          const next = formatCount(lin, s.target, s.suffix, s.noComma);
          if (v.dataset.v !== next) {
            v.textContent = next;
            v.dataset.v = next;
          }
        }
      }

      // 6) 우상단 2-카드: 글래스로 등장(페이드업) → 물결 블롭으로 내부 데이터 reveal
      const cAppear = easeInOutCubic(clamp01((p - FB_CARD_AT) / FB_CARD_DUR));
      if (cardsWrapRef.current) {
        cardsWrapRef.current.style.opacity = cAppear.toFixed(3);
        cardsWrapRef.current.style.transform = `translate3d(0, ${((1 - cAppear) * 44).toFixed(1)}px, 0)`;
      }
      const cdims = g.cards || [];
      const datas = cardDataRefs.current;
      for (let i = 0; i < datas.length; i++) {
        const el = datas[i];
        if (!el) continue;
        const dim = cdims[i] || { w: el.clientWidth, h: el.clientHeight };
        const cov = clamp01((p - (FB_WAVE_AT + i * FB_WAVE_STAGGER)) / FB_WAVE_DUR);
        const clip = waveBlobClip(cov, dim.w, dim.h, 5, 0.12);
        if (el.dataset.clip !== clip) {
          el.style.clipPath = clip;
          el.dataset.clip = clip;
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

  return (
    <section ref={sectionRef} aria-label="비즈니스 소개" className="relative bg-[#0b0d12]">
      {/* 데스크톱(lg+) — Figma 165:121 다크 sticky 시퀀스 */}
      <div className="hidden lg:block">
        <div ref={trackRef} style={{ height: `${FB_TRACK_VH}vh` }} className="relative">
          <div
            className="sticky top-0 h-screen w-full overflow-hidden"
            style={{ "--fb-pad": "clamp(28px, 7.8vw, 150px)" }}
          >
            {/* 배경 야경 + 오버레이 */}
            <div aria-hidden className="absolute inset-0">
              <img
                src={fbCityNight}
                alt=""
                draggable="false"
                className="absolute inset-0 w-full h-full object-cover select-none"
              />
              <div className="absolute inset-0 bg-black/45" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/20" />
            </div>

            {/* 콘텐츠 */}
            <div
              className="relative h-full"
              style={{ opacity: ready ? 1 : 0, transition: "opacity .6s ease-out" }}
            >
              {/* 슬로건 + For Business 라벨 (center → 좌상단) */}
              <div
                ref={headWrapRef}
                className="absolute will-change-transform"
                style={{ top: "var(--fb-pad)", left: "var(--fb-pad)" }}
              >
                <h2
                  className="relative font-bold leading-[1.4] tracking-[-0.018em] text-left"
                  style={{ fontSize: "clamp(34px, 3.02vw, 58px)" }}
                >
                  {BUSINESS_FLAT.map((line, li) => (
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
                          style={{ color: "rgb(108, 114, 130)" }}
                        >
                          {w.text}
                          {wi < line.length - 1 && !w.noSpace ? " " : ""}
                        </span>
                      ))}
                    </span>
                  ))}
                </h2>
                <p
                  ref={labelRef}
                  className="absolute left-0 top-full mt-[20px] xl:mt-[26px] text-white font-bold tracking-[-0.01em] inline-flex items-center gap-[8px]"
                  style={{ fontSize: "clamp(18px, 1.25vw, 24px)", opacity: 0 }}
                >
                  <span>For Business</span>
                  <span aria-hidden className="inline-block w-[10px] h-[10px] rounded-full bg-white" />
                </p>
              </div>

              {/* 우상단 2-카드 — 글래스 프론트 → 스크롤 시 물결 블롭으로 내부 데이터 reveal (md 05) */}
              <div
                ref={cardsWrapRef}
                className="absolute flex gap-[clamp(14px,1.4vw,26px)] will-change-transform"
                style={{ top: "var(--fb-pad)", right: "var(--fb-pad)", opacity: 0 }}
              >
                {/* 카드 A — 2026 가톨릭대학교 경조사 화환 납품 낙찰 */}
                <div
                  ref={(el) => (cardFrameRefs.current[0] = el)}
                  className="relative rounded-[22px] overflow-hidden border border-white/20"
                  style={{ width: "min(360px, 19vw)", aspectRatio: "360 / 460", ...FB_GLASS_CARD }}
                  aria-label="2026 가톨릭대학교 경조사 화환 납품 낙찰업체"
                >
                  {/* 글래스 프론트 커버(티저) */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-[24px] gap-[14px]">
                    <span className="text-[12px] xl:text-[13px] font-bold tracking-[0.18em] text-white/65 uppercase">
                      Official
                    </span>
                    <p className="text-white font-bold text-[23px] xl:text-[27px] leading-[1.28] tracking-[-0.01em]">
                      2026
                      <br />
                      가톨릭대학교
                    </p>
                    <span className="mt-[8px] text-[11px] xl:text-[12px] tracking-[0.22em] text-white/40 uppercase">
                      Scroll ↓
                    </span>
                  </div>
                  {/* 내부 데이터 — 물결 블롭 reveal */}
                  <div
                    ref={(el) => (cardDataRefs.current[0] = el)}
                    className="absolute inset-0 will-change-[clip-path]"
                    style={{ clipPath: 'path("M0 0Z")' }}
                  >
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(158deg, color-mix(in srgb, var(--color-brand-red-dark) 90%, black) 0%, #0c0c11 88%)",
                      }}
                    />
                    <div className="relative h-full flex flex-col justify-between p-[26px] xl:p-[32px]">
                      <span className="self-start rounded-full bg-white/15 border border-white/25 px-[14px] py-[7px] text-[12px] xl:text-[13px] font-bold text-white tracking-[-0.01em] whitespace-nowrap">
                        {FB_BID.badge}
                      </span>
                      <div className="flex flex-col gap-[12px]">
                        <p className="text-white font-bold text-[22px] xl:text-[26px] leading-[1.32] tracking-[-0.02em]">
                          {FB_BID.title.map((t, ti) => (
                            <span key={ti} className="block">
                              {t}
                            </span>
                          ))}
                        </p>
                        <p className="text-white/65 text-[13px] xl:text-[15px] leading-[1.5] tracking-[-0.01em]">
                          {FB_BID.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 카드 B — 함께하는 파트너사 */}
                <div
                  ref={(el) => (cardFrameRefs.current[1] = el)}
                  className="relative rounded-[22px] overflow-hidden border border-white/20"
                  style={{ width: "min(360px, 19vw)", aspectRatio: "360 / 460", ...FB_GLASS_CARD }}
                  aria-label="함께하는 파트너사"
                >
                  {/* 글래스 프론트 커버(티저) */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-[24px] gap-[12px]">
                    <span className="text-[12px] xl:text-[13px] font-bold tracking-[0.18em] text-white/65 uppercase">
                      Partners
                    </span>
                    <p className="text-white font-bold text-[23px] xl:text-[27px] leading-[1.28] tracking-[-0.01em]">
                      함께하는
                      <br />
                      파트너사
                    </p>
                    <span className="text-white/55 text-[14px] xl:text-[15px] font-medium">200+ 제휴 기업</span>
                    <span className="mt-[6px] text-[11px] xl:text-[12px] tracking-[0.22em] text-white/40 uppercase">
                      Scroll ↓
                    </span>
                  </div>
                  {/* 내부 데이터 — 물결 블롭 reveal: 파트너 마퀴 */}
                  <div
                    ref={(el) => (cardDataRefs.current[1] = el)}
                    className="absolute inset-0 will-change-[clip-path]"
                    style={{ clipPath: 'path("M0 0Z")' }}
                  >
                    <div className="absolute inset-0" style={{ background: "rgba(11,12,17,0.92)" }} />
                    <div className="relative h-full flex flex-col justify-center gap-[13px] p-[24px] xl:p-[28px]">
                      <p className="text-white/90 font-bold text-[17px] xl:text-[20px] tracking-[-0.01em]">
                        함께하는 파트너사
                      </p>
                      {FB_PARTNERS.slice(0, 3).map((row, ri) => (
                        <div key={ri} className="overflow-hidden">
                          <div
                            className={`flex w-max gap-[8px] ${ri % 2 === 0 ? "fb-marquee-l" : "fb-marquee-r"}`}
                            style={{ "--fb-marquee-dur": `${30 + ri * 6}s` }}
                          >
                            {[...row, ...row].map((name, ci) => (
                              <span
                                key={ci}
                                aria-hidden={ci >= row.length}
                                className="shrink-0 rounded-[9px] bg-white/10 border border-white/12 px-[12px] py-[9px] text-[13px] xl:text-[14px] font-medium text-white/90 whitespace-nowrap tracking-[-0.01em]"
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

              {/* 하단 글래스 통계 칩 3종 — 순차 등장 + count-up */}
              <div
                className="absolute flex gap-[clamp(16px,2vw,40px)]"
                style={{ left: "var(--fb-pad)", right: "var(--fb-pad)", bottom: "var(--fb-pad)" }}
              >
                {FB_STATS.map((s, i) => (
                  <div
                    key={i}
                    ref={(el) => (chipRefs.current[i] = el)}
                    className="group flex-1 flex items-center justify-between rounded-[16px] border border-white/25 px-[clamp(20px,2.3vw,44px)] py-[clamp(22px,1.9vw,36px)] will-change-transform transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-[3px] hover:border-white/45"
                    style={{
                      opacity: 0,
                      // 글래스모피즘: 밝은 반투명 그라디언트(상단 림 sheen) + 강한 blur + saturate로
                      // 뒤 야경/불빛이 프로스트되어 비치게 한다(어두운 채움이면 '색칠 블럭'처럼 보임).
                      background:
                        "linear-gradient(135deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.055) 52%, rgba(255,255,255,0.025) 100%)",
                      backdropFilter: "blur(26px) saturate(160%)",
                      WebkitBackdropFilter: "blur(26px) saturate(160%)",
                      boxShadow:
                        "0 22px 50px -26px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.45), inset 0 -1px 0 rgba(0,0,0,0.12)",
                    }}
                  >
                    <p
                      className="text-white/85 font-medium tracking-[-0.01em] whitespace-nowrap"
                      style={{ fontSize: "clamp(15px, 1.35vw, 26px)" }}
                    >
                      {s.label}
                    </p>
                    <p
                      ref={(el) => (chipValRefs.current[i] = el)}
                      data-v={`0${s.suffix}`}
                      className="text-white font-bold tabular-nums tracking-[-0.01em]"
                      style={{ fontSize: "clamp(24px, 2.2vw, 42px)" }}
                    >
                      {`0${s.suffix}`}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 모바일(<lg) — 정적 다크 스택 */}
      <div className="lg:hidden relative px-6 md:px-12 py-[64px] overflow-hidden">
        <div aria-hidden className="absolute inset-0">
          <img src={fbCityNight} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="relative flex flex-col gap-[32px]">
          <div>
            <h2 className="font-bold text-[30px] md:text-[40px] leading-[1.4] tracking-[-0.018em] text-white">
              {BUSINESS_FLAT.map((line, li) => (
                <span key={li} className="block">
                  {line.map((w, wi) => (
                    <span
                      key={wi}
                      className="inline-block whitespace-pre"
                      style={{ color: w.tone === "accent" ? "#e2ef5d" : "#fff" }}
                    >
                      {w.text}
                      {wi < line.length - 1 && !w.noSpace ? " " : ""}
                    </span>
                  ))}
                </span>
              ))}
            </h2>
            <p className="mt-[18px] text-white font-bold text-[18px] inline-flex items-center gap-[8px]">
              <span>For Business</span>
              <span aria-hidden className="inline-block w-[8px] h-[8px] rounded-full bg-white" />
            </p>
          </div>
          <div className="flex flex-col gap-[14px]">
            {FB_STATS.map((s, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-[12px] border border-white/15 px-[22px] py-[20px]"
                style={{
                  background: "rgba(14,14,14,0.3)",
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                }}
              >
                <p className="text-white/85 font-medium text-[16px]">{s.label}</p>
                <p className="text-white font-bold text-[26px] tabular-nums">
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
