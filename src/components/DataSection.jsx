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
                "linear-gradient(to top, color-mix(in srgb, var(--color-brand-red-dark) 30%, black 70%), color-mix(in srgb, var(--color-brand-red-dark) 45%, transparent) 52%, transparent)",
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
      <p className="text-[#222] font-bold text-[14px] md:text-[16px] xl:text-[20px] leading-[1.4] tracking-[-0.01em] whitespace-nowrap">
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
