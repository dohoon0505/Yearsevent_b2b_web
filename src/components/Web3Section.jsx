import { useEffect, useLayoutEffect, useRef } from "react";
import productGlass from "../assets/product-glass-blue.jpg";
import web3Demo from "../assets/web3-demo.jpg";

/**
 * Web3Section — Figma 196:509 / 200:34 "sequence 4(100vh)" + 코멘트:
 *   "한 메뉴당 100vh 스크롤, 스크롤 시 좌측 메뉴 이동 + 백그라운드 아래로 스크롤
 *    + 메뉴에 맞는 Arcade Demo 노출"
 *
 *   TRACK 500vh / sticky 100vh — 핀 구간 400vh = 메뉴 4개 × 100vh
 *   [스크롤] 좌측 메뉴 활성(#4545ff)이 1→4로 이동 + 우측 Arcade Demo 교체(크로스페이드)
 *            + 배경(Product 글래스 이미지)이 아래로 스크롤-스루
 *   배경 연속성: 글래스 이미지를 scaleY(-1)로 뒤집어 상단 고정 →
 *   무대 첫 줄 = 위 이미지 블록의 마지막 줄 (Product 굴곡 배경에서 픽셀 연속)
 *   ※ Arcade 임베드 URL 확정 전까지 데모 목업 이미지로 대체 (메뉴별 교체 구조 유지)
 *
 * 성능: 스크롤 프레임에서 React state 갱신 없이 ref 직접 DOM만 기록.
 */

const WEB3_BLUE = "#4545ff";
const WEB3_MENUS = [
  { title: "AI 간편접수", demo: web3Demo },
  { title: "실시간 주문내역", demo: web3Demo },
  { title: "간편한 정산회계", demo: web3Demo },
  { title: "문구·상품 즐겨찾기", demo: web3Demo },
];
const W3_TRACK_VH = 500; // 핀 400vh = 메뉴당 100vh (코멘트)

const clamp01 = (v) => Math.max(0, Math.min(1, v));
const lerp = (a, b, t) => a + (b - a) * t;

export default function Web3Section() {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const stageRef = useRef(null);
  const bgImgRef = useRef(null); // 배경 글래스 (아래로 스크롤-스루)
  const menuRefs = useRef([]); // 메뉴 4개 (활성 토글)
  const demoRefs = useRef([]); // Arcade Demo 레이어 4개 (크로스페이드)
  const cursorRef = useRef(null); // 여백 스크롤 커서
  const idxRef = useRef(-1);
  const geo = useRef({ vw: 0, vh: 0 });

  // 활성 메뉴 적용 — idx 변경 시에만 클래스/스타일 토글 (전환은 CSS transition)
  const applyIdx = (idx) => {
    if (idxRef.current === idx) return;
    idxRef.current = idx;
    menuRefs.current.forEach((el, i) => {
      if (el) el.classList.toggle("w3-active", i === idx);
    });
    demoRefs.current.forEach((el, i) => {
      if (!el) return;
      el.style.opacity = i === idx ? "1" : "0";
      el.style.transform = i === idx ? "translateY(0px)" : "translateY(18px)";
    });
  };

  useLayoutEffect(() => {
    let ticking = false;

    const measure = () => {
      geo.current = { vw: window.innerWidth, vh: window.innerHeight };
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

      // 1) 메뉴 활성 — 한 메뉴당 100vh (핀 400vh / 4)
      applyIdx(Math.min(WEB3_MENUS.length - 1, Math.floor(p * WEB3_MENUS.length)));

      // 2) 배경 아래로 스크롤-스루 — 이미지 잔여 높이만큼 래퍼를 위로 이동
      if (bgImgRef.current) {
        const imgH = g.vw * (2537 / 1920); // 미러 이미지 자연 높이
        const ty = -Math.max(0, imgH - g.vh) * p;
        bgImgRef.current.style.transform = `translate3d(0, ${ty.toFixed(1)}px, 0)`;
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
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // 여백 스크롤 커서 — DataSection·Product와 동일 패턴. 메뉴·데모(cursor-native)는 기본 커서.
  useEffect(() => {
    const stage = stageRef.current;
    const cur = cursorRef.current;
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

  const label = (
    <p
      className="text-[#222] font-bold tracking-[-0.01em] inline-flex items-center gap-[8px]"
      style={{ fontSize: "clamp(17px, 1.46vw, 28px)" }}
    >
      <span>WEB 3.0 Manager</span>
      <span aria-hidden className="inline-block w-[10px] h-[10px] rounded-full" style={{ background: WEB3_BLUE }} />
    </p>
  );

  const heading = (
    <h2 className="leading-[1.4] tracking-[-0.01em]" style={{ fontSize: "clamp(32px, 2.92vw, 56px)" }}>
      <span className="block font-medium text-[#888]">실무자를 위한</span>
      <span className="block font-extrabold text-[#222]">WEB 3.0 시스템</span>
    </h2>
  );

  return (
    <section ref={sectionRef} aria-label="WEB 3.0 시스템" className="relative bg-[#dfe7f8]">
      {/* 데스크톱(lg+) — 메뉴당 100vh 핀 스크롤 */}
      <div className="hidden lg:block">
        <div ref={trackRef} style={{ height: `${W3_TRACK_VH}vh` }} className="relative">
          <div
            ref={stageRef}
            className="sticky top-0 h-screen w-full overflow-hidden"
            style={{ "--w3-pad": "clamp(28px, 7.8vw, 150px)" }}
          >
            {/* 배경 — Product 글래스 이미지의 아래쪽 미러 확장(상단 고정).
                무대 첫 줄 = 위 이미지 블록 마지막 줄 → 굴곡 배경에서 픽셀 연속 */}
            <div aria-hidden className="absolute inset-0 overflow-hidden bg-[#dfe7f8]">
              {/* 래퍼가 세로 이동(스크롤-스루), 이미지는 정적 미러(scaleY -1) */}
              <div ref={bgImgRef} className="absolute top-0 left-0 w-full will-change-transform">
                <img
                  src={productGlass}
                  alt=""
                  draggable="false"
                  className="block w-full select-none"
                  style={{ transform: "scaleY(-1)" }}
                />
              </div>
            </div>

            {/* 콘텐츠 — 좌: 라벨/헤딩/메뉴, 우: Arcade Demo (Figma 200:34) */}
            <div
              className="relative h-full flex items-end justify-between gap-[clamp(28px,3.1vw,90px)]"
              style={{
                paddingLeft: "var(--w3-pad)",
                paddingRight: "clamp(24px, 4.2vw, 80px)",
                paddingTop: "var(--w3-pad)",
                paddingBottom: "var(--w3-pad)",
              }}
            >
              {/* 좌측 — 메뉴/데모는 기본 커서(cursor-native) */}
              <div className="cursor-native flex flex-col gap-[clamp(32px,4.2vh,80px)] shrink-0 min-w-0">
                <div className="flex flex-col gap-[clamp(18px,1.6vw,30px)]">
                  {label}
                  {heading}
                </div>
                {/* 메뉴 리스트 — 활성 항목이 스크롤에 맞춰 1→4로 이동 */}
                <div
                  className="w-full rounded-[20px] overflow-hidden"
                  style={{ width: "clamp(360px, 26.5vw, 508px)", boxShadow: "0 24px 60px -32px rgba(34,40,90,0.35)" }}
                >
                  {WEB3_MENUS.map((m, i) => (
                    <div
                      key={i}
                      ref={(el) => (menuRefs.current[i] = el)}
                      className={`w3-item flex items-center justify-between ${i > 0 ? "border-t border-[#999]/40" : ""} ${i === 0 ? "w3-active" : ""}`}
                      style={{ padding: "clamp(20px, 1.56vw, 30px)" }}
                    >
                      <p className="w3-title font-semibold whitespace-nowrap" style={{ fontSize: "clamp(17px, 1.25vw, 24px)" }}>
                        {m.title}
                      </p>
                      <span className="w3-arrow font-semibold" style={{ fontSize: "clamp(15px, 1.05vw, 20px)" }} aria-hidden>
                        →
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 우측 — 메뉴별 Arcade Demo (현재 목업, 추후 임베드 교체) */}
              <div
                className="cursor-native relative shrink overflow-hidden rounded-[20px]"
                style={{
                  width: "min(56.9vw, 1092px)",
                  height: "min(61.9vh, 668px)",
                  boxShadow: "0 40px 90px -40px rgba(34,40,90,0.45)",
                }}
                aria-label="WEB 3.0 시스템 데모"
              >
                {WEB3_MENUS.map((m, i) => (
                  <img
                    key={i}
                    ref={(el) => (demoRefs.current[i] = el)}
                    src={m.demo}
                    alt=""
                    draggable="false"
                    className="absolute inset-0 w-full h-full object-cover select-none transition-all duration-500"
                    style={{
                      opacity: i === 0 ? 1 : 0,
                      transform: i === 0 ? "translateY(0px)" : "translateY(18px)",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* 여백 스크롤 커서 */}
            <div ref={cursorRef} aria-hidden className="pd-cursor has-mode mode-scroll">
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
          </div>
        </div>
      </div>

      {/* 모바일(<lg) — 정적 스택 */}
      <div className="lg:hidden px-6 md:px-12 py-[56px] flex flex-col gap-[28px]">
        <div className="flex flex-col gap-[14px]">
          {label}
          {heading}
        </div>
        <div className="rounded-[16px] overflow-hidden" style={{ boxShadow: "0 20px 50px -28px rgba(34,40,90,0.35)" }}>
          {WEB3_MENUS.map((m, i) => (
            <div
              key={i}
              className={`flex items-center justify-between px-[20px] py-[18px] ${i > 0 ? "border-t border-[#999]/40" : ""}`}
              style={{ background: i === 0 ? WEB3_BLUE : "#fff" }}
            >
              <p className="font-semibold text-[16px]" style={{ color: i === 0 ? "#fff" : "#bdbdbd" }}>
                {m.title}
              </p>
              <span className="font-semibold text-[14px]" style={{ color: i === 0 ? "#fff" : "#999" }} aria-hidden>
                →
              </span>
            </div>
          ))}
        </div>
        <img src={web3Demo} alt="WEB 3.0 시스템 데모" className="w-full rounded-[14px]" draggable="false" />
      </div>
    </section>
  );
}
