import { useEffect, useLayoutEffect, useRef, useState } from "react";
import productGlass from "../assets/product-glass-blue.jpg";

/**
 * ProductSection — Figma 151:332 (sequence 01~06) + 코멘트 #9·#10·#11
 *
 *   TRACK 640vh / sticky 100vh
 *   [다크(#222): "What kind of Product?" 라임 라벨 + 헤드라인1 scrub
 *      + "비즈니스" 단어 로테이터(#10·#11 — text-scramble-word-rotator-08 md,
 *        마스크 세로 순환: 정지 70% + easeInOutCubic 슬라이드 30%)]
 *   → [헤드라인 교체: "모든 경조사 소식에 발 빠르게 대응합니다"]
 *   → [다크 영역이 "첫 상품 카드(대형 관엽화분)" 위치·크기로 축소(시퀀스 04):
 *      라벨 top-left + 헤드라인 bottom-left로 재정렬]
 *   → [다크 카드가 측면 물결(card-wavy-swap/wave-side)로 사라지며 그 자리의
 *      대형 관엽화분 카드가 드러남]
 *   → [흰 배경 쇼케이스: 좌측 텍스트+CTA 고정, 나머지 상품 카드 우→좌 슬라이드
 *      (개별 물결 없음) + 커스텀 라벨 커서(#9)]
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

// 상품 이미지 — src/assets/products/<key>.{jpg,jpeg,png,webp} 를 빌드 시 자동 수집.
// 파일이 아직 없으면 해당 카드는 회색 플레이스홀더로 폴백되므로 빌드가 깨지지 않는다.
const PRODUCT_IMG_FILES = import.meta.glob(
  "../assets/products/*.{jpg,jpeg,png,webp}",
  { eager: true, import: "default" },
);
const imgFor = (key) => {
  if (!key) return null;
  const hit = Object.entries(PRODUCT_IMG_FILES).find(
    ([path]) => path.split("/").pop().replace(/\.[^.]+$/, "") === key,
  );
  return hit ? hit[1] : null;
};

// 상품 카드 (Figma 199:42~44). img 키 = src/assets/products/<img>.* 파일명.
// 화환(근조·축하)은 사진 추후 추가 예정 → 파일이 들어오기 전까지 회색 플레이스홀더.
const PRODUCTS = [
  { title: "대형 관엽화분", desc: "개업·이전 축하의 품격을 높이는 프리미엄 관엽", img: imgFor("foliage") },
  { title: "근조화환", desc: "깊은 애도의 마음을 정중하게 전하는 근조 3단 화환", img: imgFor("wreath-condolence") },
  { title: "축하화환", desc: "개업·취임·행사의 기쁨을 더하는 축하 3단 화환", img: imgFor("wreath-celebration") },
  { title: "동양란", desc: "변함없는 신뢰의 마음을 전하는 단아한 동양란", img: imgFor("oriental-orchid") },
  { title: "호접난", desc: "공간을 화사하게 밝히는 서양 호접난", img: imgFor("phalaenopsis") },
  { title: "꽃바구니", desc: "받는 분의 공간을 화사하게 채우는 마음 담은 꽃바구니", img: imgFor("flower-basket") },
];

const PD_TRACK_VH = 640;
// 인터랙션 임계값 (p ∈ [0,1])
const PD_TEXT_END = 0.14; // 헤드라인1 scrub 완료
const PD_SWAP_AT = 0.18; // 헤드라인1 → 2 교체
const PD_SWAP_DUR = 0.08;
const PD_CAP_AT = 0.3; // 다크 → 첫 상품카드(대형 관엽화분) 위치·크기로 축소
const PD_CAP_END = 0.46;
const PD_SHOW_AT = 0.34; // 쇼케이스(흰 배경+좌측+카드)를 미리 등장 → 다크 카드 뒤에 첫 카드 배치
const PD_SHOW_DUR = 0.1;
const PD_WAVE_AT = 0.48; // 다크 카드가 측면 물결로 사라짐 (card-wavy-swap)
const PD_WAVE_END = 0.64; // 사라짐 완료 → 대형 관엽화분 노출
const PD_CARDS_AT = 0.66; // 나머지 카드 우→좌 슬라이드 (물결 스윕 없음)
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

// ── card-wavy-swap / wave-side (측면 물결 스윕) — md 100% 반영:
//    우측 경계가 세로 사인 곡선(진폭 5% · 1.3주기)을 그리며 좌(-A)→우(w+A)로
//    coverage(c)에 비례해 쓸려 들어온다. 베지어로 곡선이 매끄럽다.
const __r = (n) => Math.round(n * 10) / 10;
const WAVE_ZERO = 'path("M0 0Z")';
const waveFull = (w, h) => `path("M0 0H${__r(w)}V${__r(h)}H0Z")`;
// 점들을 지나는 매끄러운 2차 베지어(열린 경로, 선행 M 없음)
const waveBody = (pts) => {
  let d = "";
  let i;
  for (i = 1; i < pts.length - 1; i++) {
    const xc = (pts[i][0] + pts[i + 1][0]) / 2;
    const yc = (pts[i][1] + pts[i + 1][1]) / 2;
    d += ` Q${__r(pts[i][0])} ${__r(pts[i][1])} ${__r(xc)} ${__r(yc)}`;
  }
  d += ` Q${__r(pts[i][0])} ${__r(pts[i][1])} ${__r(pts[i][0])} ${__r(pts[i][1])}`;
  return d;
};
const waveSmooth = (pts) => `M${__r(pts[0][0])} ${__r(pts[0][1])}${waveBody(pts)}`;
// ox·oy: 레이어 로컬 오프셋 — 풀스크린 레이어에서 (ox,oy)~(ox+w,oy+h) 영역만 물결 클립.
const waveSideClip = (c, w, h, ox = 0, oy = 0) => {
  if (c <= 0) return `path("M${__r(ox)} ${__r(oy)}Z")`;
  if (c >= 1)
    return `path("M${__r(ox)} ${__r(oy)}H${__r(ox + w)}V${__r(oy + h)}H${__r(ox)}Z")`;
  const A = w * 0.05; // 진폭 ~5%
  const wv = 1.3; // 1.3주기
  const ex = c * (w + 2 * A) - A;
  const s = Math.max(14, Math.ceil(wv * 10));
  const p = [];
  for (let i = 0; i <= s; i++) {
    const y = oy + (h * i) / s;
    const ph = (i / s) * wv * Math.PI * 2;
    p.push([ox + ex + A * Math.sin(ph), y]);
  }
  return `path("${waveSmooth(p)} L${__r(ox)} ${__r(oy + h)} L${__r(ox)} ${__r(oy)}Z")`;
};

export default function ProductSection() {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const darkLayerRef = useRef(null); // 다크 레이어 컨테이너(투명) — ready 페이드인
  const darkBackdropRef = useRef(null); // 풀스크린 → 첫 카드(cap)로 inset 축소되는 다크 배경(#222)
  const darkInnerRef = useRef(null); // 다크 중앙 콘텐츠 (스크럽·교체 → 축소 시 페이드아웃)
  const darkSwapRef = useRef(null); // cap 카드 마스크(rounded-24 + overflow-hidden) — 모서리 radius 유지
  const darkSwapBgRef = useRef(null); // 카드 다크 배경(#222) — 측면 물결로 사라짐
  const darkCardRef = useRef(null); // 카드 정렬 콘텐츠 (라벨 top-left + 헤드라인 bottom-left)
  const h1Ref = useRef(null); // 헤드라인1 (scrub + 로테이터)
  const h2Ref = useRef(null); // 헤드라인2
  const h1WordRefs = useRef([]);
  const rotMaskRef = useRef(null); // 로테이터 마스크 (폭 고정)
  const rotInnerRef = useRef(null); // 로테이터 단어 스택 (translateY 순환)
  const whiteLayerRef = useRef(null); // 흰 레이어 (출구 좌하단 radius)
  const showcaseRef = useRef(null); // 쇼케이스 콘텐츠 (등장)
  const cardsTrackRef = useRef(null); // 카드 트랙 (우→좌 슬라이드)
  const cardEl0Ref = useRef(null); // 첫 상품 카드(대형 관엽화분) — 다크 카드 위치·크기 동기 + 물결 사라짐 대상
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
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const measure = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      // 축소 목표 = 다음 섹션 상품 카드와 동일한 세로형 "카드" 형태(원형 캡슐 X).
      // 폭·높이를 쇼케이스 카드의 clamp 값과 동일하게 산출해 화면 정중앙에 둔다.
      const cardW = Math.min(450, Math.max(288, vw * 0.234)); // clamp(288, 23.4vw, 450)
      const cardH = Math.min(650, Math.max(420, vh * 0.6)); //   clamp(420, 60vh, 650)
      const cap = { x: (vw - cardW) / 2, y: (vh - cardH) / 2, w: cardW, h: cardH };
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

      // 3) 다크 → 첫 상품카드(대형 관엽화분) 위치·크기로 축소 → 그 자리에서 측면
      //    물결로 사라지며 대형 관엽화분 노출(card-wavy-swap). cap = 첫 카드의 실제
      //    화면 위치(슬라이드 전 = 정지 위치)에 100% 일치.
      const capT = smoothstep(clamp01((p - PD_CAP_AT) / (PD_CAP_END - PD_CAP_AT)));
      let cap = g.cap; // 측정 전 폴백(화면 중앙)
      const fc = cardEl0Ref.current;
      if (fc) {
        const fr = fc.getBoundingClientRect();
        if (fr.width) cap = { x: fr.left, y: fr.top, w: fr.width, h: fr.height };
      }
      // 3a) 풀스크린 → cap(첫 카드)로 inset 축소되는 다크 배경. 물결 단계 진입 시
      //     숨김(카드 마스크 C가 같은 자리 #222를 그대로 이어받음 → 점프 없음).
      const backdrop = darkBackdropRef.current;
      if (backdrop) {
        if (p < PD_WAVE_AT) {
          // 여백은 레이어 실제 크기 기준(innerWidth는 스크롤바 포함이라 어긋남).
          const lw = backdrop.clientWidth;
          const lh = backdrop.clientHeight;
          const top = lerp(0, cap.y, capT);
          const left = lerp(0, cap.x, capT);
          const right = lerp(0, lw - cap.x - cap.w, capT);
          const bottom = lerp(0, lh - cap.y - cap.h, capT);
          // 카드 radius clamp(28px, 2.6vw, 50px)와 동기 (cap=첫 상품카드)
          const cardR = Math.min(50, Math.max(28, g.vw * 0.026));
          const rad = lerp(0, cardR, capT);
          const clip =
            capT <= 0
              ? "none"
              : `inset(${top.toFixed(1)}px ${right.toFixed(1)}px ${bottom.toFixed(1)}px ${left.toFixed(1)}px round ${rad.toFixed(1)}px)`;
          if (backdrop.dataset.clip !== clip) {
            backdrop.style.clipPath = clip;
            backdrop.dataset.clip = clip;
          }
          backdrop.style.opacity = "1";
        } else {
          backdrop.style.opacity = "0";
        }
      }
      // 3b) cap 카드 마스크(C) — 위치·크기 = cap, rounded-24 + overflow-hidden.
      //     안쪽 배경(D)이 어떤 물결 모양이어도 모서리 radius는 이 컨테이너가 유지.
      const swap = darkSwapRef.current;
      if (swap) {
        swap.style.left = `${cap.x.toFixed(1)}px`;
        swap.style.top = `${cap.y.toFixed(1)}px`;
        swap.style.width = `${cap.w.toFixed(1)}px`;
        swap.style.height = `${cap.h.toFixed(1)}px`;
        swap.style.opacity = smoothstep(clamp01((capT - 0.45) / 0.45)).toFixed(3);
      }
      // 3c) 카드 다크 배경(D) — 측면 물결로 사라짐(coverage 1→0). C 로컬좌표(0~w,0~h).
      const swapBg = darkSwapBgRef.current;
      if (swapBg) {
        let cov = 1;
        if (p >= PD_WAVE_AT) {
          const waveT = clamp01((p - PD_WAVE_AT) / (PD_WAVE_END - PD_WAVE_AT));
          cov = reduceMotion ? 0 : 1 - waveT;
        }
        const clip = waveSideClip(cov, cap.w, cap.h);
        if (swapBg.dataset.clip !== clip) {
          swapBg.style.clipPath = clip;
          swapBg.dataset.clip = clip;
        }
      }
      // 중앙 정렬 콘텐츠(스크럽·교체)는 축소 초반에 빠르게 페이드아웃.
      if (darkInnerRef.current) {
        darkInnerRef.current.style.transform = `scale(${lerp(1, 0.92, capT).toFixed(4)})`;
        darkInnerRef.current.style.opacity = (1 - smoothstep(clamp01(capT / 0.25))).toFixed(3);
      }

      // 4) 쇼케이스(흰 배경+좌측+카드)를 다크 축소와 함께 미리 등장 → 다크 카드 뒤에
      //    첫 카드를 배치. 다크가 물결로 사라진 뒤에만 호버(라벨 커서) 활성화.
      const sIn = smoothstep(clamp01((p - PD_SHOW_AT) / PD_SHOW_DUR));
      if (showcaseRef.current) {
        showcaseRef.current.style.opacity = sIn.toFixed(3);
        showcaseRef.current.style.transform = `translate3d(0, ${((1 - sIn) * 40).toFixed(1)}px, 0)`;
        showcaseRef.current.style.pointerEvents = p >= PD_WAVE_END ? "auto" : "none";
      }
      // 나머지 카드 우→좌 슬라이드 (개별 물결 스윕 없음 — 이미지는 항상 노출)
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

  // ── 커스텀 커서(#9 + custom-cursor-icon-swap-07 md) — 스테이지 전체 기본 커서 대체.
  //    data-cursor 영역 선언: 빈 여백 = scroll(↓) / 이미지 카드 = label(설명) / CTA = arrow(→)
  //    위치는 lerp(0.18)로 부드럽게 추종, 모드 변경 시에만 클래스 스왑.
  useEffect(() => {
    const stage = stageRef.current;
    const cur = cursorRef.current;
    if (!stage || !cur) return;
    // 터치 환경: 커스텀 커서 미적용 (CSS에서 기본 커서 복원)
    if (window.matchMedia("(hover: none), (pointer: coarse)").matches) return;
    stage.classList.add("pd-cursor-stage");
    const labelEl = cur.querySelector(".pd-cur-label");
    let mx = 0;
    let my = 0;
    let cx = 0;
    let cy = 0;
    let raf = 0;
    let on = false;
    let mode = "";
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
        cx = mx; // 첫 진입은 snap (멀리서 날아오지 않게)
        cy = my;
        stage.classList.add("is-on");
        if (!raf) raf = requestAnimationFrame(frame);
      }
      const z = e.target.closest("[data-cursor]");
      const m = z ? z.dataset.cursor : "";
      if (m !== mode) {
        mode = m;
        cur.className = `pd-cursor${m ? ` has-mode mode-${m}` : ""}`;
      }
      if (m === "label" && z && labelEl) {
        const txt = z.dataset.cursorLabel || "";
        if (labelEl.textContent !== txt) labelEl.textContent = txt;
      }
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
          {/* 스테이지 — 기본 커서 대체(빈 여백 = ↓스크롤 아이콘 스왑) */}
          <div
            ref={stageRef}
            data-cursor="scroll"
            className="sticky top-0 h-screen w-full overflow-hidden"
            style={{ "--pd-pad": "clamp(28px, 7.8vw, 150px)" }}
          >
            {/* 0) 최하단 — 글래스 이미지의 "위쪽 미러 확장"(scaleY -1, 하단 고정):
                무대 하단 가장자리 = 이미지 첫 줄(row 0) → 굴곡(radius)으로 드러나는
                배경이 다음 WEB 3.0 섹션 배경(이미지 첫 줄부터)과 픽셀 단위로 이어진다 */}
            <div aria-hidden className="absolute inset-0 overflow-hidden bg-[#eef2fa]">
              <img
                src={productGlass}
                alt=""
                draggable="false"
                className="absolute bottom-0 left-0 w-full select-none"
                style={{ transform: "scaleY(-1)" }}
              />
            </div>

            {/* 1) 흰 레이어 — 쇼케이스. 출구에서 좌하단 radius (#9) */}
            <div
              ref={whiteLayerRef}
              className="absolute inset-0 bg-white will-change-[clip-path]"
            >
              {/* 쇼케이스 — 다크 단계에서는 pointer-events 차단(보이지 않는 카드에
                  라벨 커서가 반응하지 않도록), 등장 후 update()에서 활성화 */}
              <div
                ref={showcaseRef}
                className="absolute inset-0 will-change-transform"
                style={{ opacity: 0, pointerEvents: "none" }}
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
                      style={{ fontSize: "clamp(17px, 1.25vw, 24px)" }}
                    >
                      <span>All Products Offer</span>
                      <span aria-hidden className="inline-block w-[10px] h-[10px] rounded-full bg-[var(--color-brand-red)]" />
                    </p>
                    <h2
                      className="mt-[20px] text-[#222] font-bold leading-[1.4] tracking-[-0.02em]"
                      style={{ fontSize: "clamp(38px, 3.65vw, 70px)" }}
                    >
                      경조사 소식을
                      <br />
                      공유 해주세요 :)
                    </h2>
                    <p
                      className="mt-[20px] text-[#797979] leading-[1.5]"
                      style={{ fontSize: "clamp(15px, 1.04vw, 20px)" }}
                    >
                      기업에게, 대표님에게 발생하는 경조사 소식을
                      <br />
                      10년 경력의 노하우로 발 빠르게 대응 해드리고 있어요
                    </p>
                  </div>
                  <button
                    type="button"
                    data-cursor="arrow"
                    className="self-start inline-flex items-center gap-[10px] rounded-full bg-[var(--color-brand-red)] text-white font-semibold transition-transform duration-300 hover:-translate-y-[2px]"
                    style={{
                      padding: "clamp(15px, 0.94vw, 18px) clamp(22px, 1.46vw, 28px)",
                      fontSize: "clamp(16px, 1.04vw, 20px)",
                    }}
                  >
                    <span>상품가이드 더 살펴보기</span>
                    <span aria-hidden>→</span>
                  </button>
                </div>

                {/* 우측 카드 뷰포트 — 우→좌 슬라이드. 텍스트와의 간격은 카드 간 간격의 2배 */}
                <div
                  className="absolute inset-y-0 right-0 overflow-hidden"
                  style={{ left: "calc(var(--pd-pad) + clamp(300px, 22.5vw, 431px) + clamp(100px, 10.4vw, 200px))" }}
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
                          ref={i === 0 ? cardEl0Ref : undefined}
                          data-cursor="label"
                          data-cursor-label={prod.desc}
                          className="relative shrink-0 overflow-hidden flex flex-col justify-end"
                          style={{
                            width: "clamp(300px, 26vw, 500px)",
                            height: "clamp(420px, 60vh, 650px)",
                            padding: "clamp(28px, 2.6vw, 50px)",
                            borderRadius: "clamp(28px, 2.6vw, 50px)",
                            marginTop: i % 2 === 1 ? "clamp(30px, 6vh, 65px)" : "0px",
                            // 이미지 카드는 다크 베이스, 이미지 없는 카드는 회색 플레이스홀더.
                            background: prod.img ? "#1d1d1f" : "#f8f8f8",
                          }}
                        >
                          {prod.img && (
                            // 상품 이미지는 항상 노출(개별 물결 스윕 없음). 첫 카드는 위를
                            // 덮은 다크 카드가 물결로 사라지며 드러난다.
                            <>
                              <img
                                src={prod.img}
                                alt={prod.title}
                                draggable="false"
                                className="absolute inset-0 h-full w-full object-cover select-none"
                              />
                              {/* 하단 스크림 — 사진 위 흰 텍스트 가독성 확보 */}
                              <div
                                aria-hidden
                                className="absolute inset-x-0 bottom-0 h-1/2"
                                style={{
                                  background:
                                    "linear-gradient(to top, rgba(17,17,17,.78), rgba(17,17,17,.32) 45%, rgba(17,17,17,0))",
                                }}
                              />
                            </>
                          )}
                          <p
                            className="relative font-bold tracking-[-0.01em]"
                            style={{
                              fontSize: "clamp(22px, 1.67vw, 32px)",
                              color: prod.img ? "#fff" : "#222",
                            }}
                          >
                            {prod.title}
                          </p>
                          <p
                            className="relative mt-[14px] leading-[1.5]"
                            style={{
                              fontSize: "clamp(14px, 1.04vw, 20px)",
                              color: prod.img ? "rgba(255,255,255,.88)" : "rgba(34,34,34,.7)",
                            }}
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
            {/* pointer-events-none: 페이드아웃 후 카드 호버(라벨 커서)를 가로채지 않도록 */}
            <div
              ref={darkLayerRef}
              className="absolute inset-0 pointer-events-none"
              style={{ opacity: ready ? 1 : 0, transition: "opacity .6s ease-out" }}
            >
              {/* 풀스크린 → 첫 카드(cap)로 축소되는 다크 배경(#222). 물결 단계엔 숨김. */}
              <div ref={darkBackdropRef} className="absolute inset-0 bg-[#222] will-change-[clip-path]">
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

              {/* cap 카드 마스크(C) — rounded-24 + overflow-hidden. 안쪽 배경(D)이
                  측면 물결로 사라져도 모서리 radius는 이 컨테이너가 끝까지 유지.
                  위치·크기·opacity는 update()에서 기록. */}
              <div
                ref={darkSwapRef}
                aria-hidden
                className="absolute overflow-hidden will-change-[opacity]"
                style={{ left: 0, top: 0, width: 0, height: 0, opacity: 0, borderRadius: "clamp(28px, 2.6vw, 50px)" }}
              >
                <div
                  ref={darkSwapBgRef}
                  className="absolute inset-0 bg-[#222] will-change-[clip-path]"
                >
                  <div
                    ref={darkCardRef}
                    className="absolute inset-0 flex flex-col justify-between"
                    style={{ padding: "clamp(22px, 1.8vw, 34px)" }}
                  >
                <p
                  className="self-start font-bold tracking-[-0.01em] inline-flex items-center gap-[8px]"
                  style={{ fontSize: "clamp(13px, 1vw, 18px)", color: LIME }}
                >
                  <span>All Product Offer</span>
                  <span aria-hidden className="inline-block w-[8px] h-[8px] rounded-full" style={{ background: LIME }} />
                </p>
                <h2
                  className="font-bold leading-[1.45] tracking-[-0.02em]"
                  style={{ fontSize: "clamp(22px, 1.85vw, 32px)" }}
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
            </div>

            {/* 3) 커스텀 커서 — 라임 코어 + 아이콘 스왑(↓스크롤/→화살표) + 설명 라벨.
                모드 클래스는 커서 effect가 통째로 교체(pd-cursor mode-*) */}
            <div ref={cursorRef} aria-hidden className="pd-cursor">
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
                <svg
                  className="pd-cur-ic pd-ic-arrow"
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="#1c1e0d"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12 h14 M13 6 l6 6 -6 6" />
                </svg>
                <span className="pd-cur-label" />
              </span>
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
            {PRODUCTS.map((prod, i) => (
              <div
                key={i}
                className="relative overflow-hidden rounded-[18px] bg-[#f7f7f8] p-[18px] flex flex-col justify-end aspect-[10/12]"
              >
                {prod.img && (
                  <>
                    <img
                      src={prod.img}
                      alt={prod.title}
                      draggable="false"
                      className="absolute inset-0 h-full w-full object-cover select-none"
                    />
                    <div
                      aria-hidden
                      className="absolute inset-x-0 bottom-0 h-1/2"
                      style={{ background: "linear-gradient(to top, rgba(17,17,17,.78), rgba(17,17,17,0))" }}
                    />
                  </>
                )}
                <p className="relative font-bold text-[16px]" style={{ color: prod.img ? "#fff" : "#222" }}>
                  {prod.title}
                </p>
                <p
                  className="relative mt-[6px] text-[12px] leading-[1.5]"
                  style={{ color: prod.img ? "rgba(255,255,255,.88)" : "#888" }}
                >
                  {prod.desc}
                </p>
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
