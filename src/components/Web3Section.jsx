import { useEffect, useLayoutEffect, useRef } from "react";
import productGlass from "../assets/product-glass-blue.jpg";

/**
 * Web3Section — Figma 196:509 / 200:34 + 코멘트:
 *   "한 메뉴당 100vh 스크롤, 스크롤 시 좌측 메뉴 이동 + 백그라운드 아래로 스크롤
 *    + 메뉴에 맞는 Arcade Demo 노출"
 *
 *   TRACK 500vh / sticky 100vh — 핀 400vh = 메뉴 4개 × 100vh
 *   [휠 스냅] 핀 구간에서는 휠 1회 = 메뉴 1칸(100vh) 단위로만 이동 (자유 스크롤 금지)
 *   [클릭] 좌측 메뉴 클릭 시 해당 메뉴 위치로 스크롤 이동
 *   [호버] 메뉴 위에서 설명 라벨 커서(icon-swap md label 모드)
 *   배경: Product 굴곡(radius)에서 드러난 글래스 이미지가 "그대로 한 장으로" 이어짐
 *         — 무대 상단 = 이미지 첫 줄(Product 무대 하단과 픽셀 연속), 스크롤-스루로 하강
 *   레이아웃: 좌측 컬럼은 상단(라벨·헤딩)과 하단(메뉴)이 패딩 끝에 정렬(justify-between),
 *             하단 여백 100px, 우측 Arcade Demo 높이 668×1.15 = 768px
 *   ※ Arcade 임베드 URL 확정 전까지 데모 목업 이미지로 대체 (메뉴별 교체 구조 유지)
 */

const WEB3_BLUE = "#4545ff";
// Arcade 인터랙티브 데모 임베드 — 메뉴별 데모가 준비되면 embed만 교체
const ARCADE_EMBED =
  "https://demo.arcade.software/6AffC1DYBio7CwnzgXjB?embed&embed_mobile=inline&embed_desktop=inline&show_copy_link=true";
const WEB3_MENUS = [
  { title: "AI 간편접수", desc: "경조사 소식만 전달하면 AI가 알아서 접수를 끝내드려요", embed: ARCADE_EMBED },
  { title: "실시간 주문내역", desc: "접수부터 배송 완료까지 주문 현황을 실시간으로 확인해요", embed: ARCADE_EMBED },
  { title: "간편한 정산회계", desc: "월 정산과 증빙 서류를 클릭 한 번으로 처리해요", embed: ARCADE_EMBED },
  { title: "문구·상품 즐겨찾기", desc: "자주 쓰는 경조 문구와 상품을 저장해 두고 빠르게 주문해요", embed: ARCADE_EMBED },
];
const W3_TRACK_VH = 500; // 핀 400vh = 메뉴당 100vh (코멘트)

const clamp01 = (v) => Math.max(0, Math.min(1, v));
const lerp = (a, b, t) => a + (b - a) * t;

export default function Web3Section() {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const stageRef = useRef(null);
  const bgImgRef = useRef(null); // 배경 글래스 래퍼 (아래로 스크롤-스루)
  const menuRefs = useRef([]); // 메뉴 4개 (활성 토글)
  const demoFrameRef = useRef(null); // Arcade Demo iframe (메뉴별 src 교체)
  const shieldRef = useRef(null); // iframe 휠 실드 (클릭 시 데모 조작 모드)
  const cursorRef = useRef(null); // 커스텀 커서 (scroll/label)
  const idxRef = useRef(-1);
  const snappingRef = useRef(false);
  const zoneRef = useRef(false); // 스냅 구간 내부 여부 (Lenis stop/start 제어)
  const geo = useRef({ vw: 0, vh: 0 });

  // 활성 메뉴 적용 — idx 변경 시에만 클래스/스타일 토글 (전환은 CSS transition)
  const applyIdx = (idx) => {
    if (idxRef.current === idx) return;
    idxRef.current = idx;
    menuRefs.current.forEach((el, i) => {
      if (el) el.classList.toggle("w3-active", i === idx);
    });
    // 메뉴별 Arcade 데모 교체 — URL이 다를 때만 src 스왑(불필요한 리로드 방지)
    const f = demoFrameRef.current;
    if (f) {
      const next = WEB3_MENUS[idx].embed;
      if (f.getAttribute("src") !== next) f.setAttribute("src", next);
    }
  };

  // 메뉴 i의 스냅 위치 (핀 진행률 i/4 지점)
  const menuScrollY = (i) => {
    const node = trackRef.current;
    if (!node) return 0;
    const rect = node.getBoundingClientRect();
    const top = rect.top + window.scrollY;
    const step = (rect.height - window.innerHeight) / WEB3_MENUS.length;
    return top + i * step;
  };

  const snapTo = (y) => {
    snappingRef.current = true;
    window.scrollTo({ top: y, behavior: "smooth" });
    // 트랙패드 관성 꼬리(잔여 휠 이벤트)가 다음 칸으로 연속 점프시키지 않도록 여유 쿨다운
    window.setTimeout(() => {
      snappingRef.current = false;
    }, 950);
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
        const imgH = g.vw * (2537 / 1920); // 글래스 이미지 자연 높이
        const ty = -Math.max(0, imgH - g.vh) * p;
        bgImgRef.current.style.transform = `translate3d(0, ${ty.toFixed(1)}px, 0)`;
      }

      // 3) 스냅 구간 진입/이탈 시 Lenis 일시정지/재개 — Lenis 관성이 구간을
      //    자유 통과하거나 스냅(native smooth)과 매 프레임 싸우는 버벅임 방지.
      const scrolled = -rect.top; // 구간 내 진행(px)
      const inZone = scrolled >= -g.vh * 0.5 && scrolled <= max - 2;
      if (inZone !== zoneRef.current) {
        zoneRef.current = inZone;
        const L = window.__lenis;
        if (L) {
          if (inZone) {
            L.stop(); // 관성 즉시 종료 — 이후 휠은 스냅 핸들러가 전담
          } else {
            L.scrollTo(window.scrollY, { immediate: true, force: true }); // 위치 재동기화
            L.start();
          }
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
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // ── 휠 스냅 — 핀 구간에서 휠 1회 = 메뉴 1칸(100vh). 경계 밖으로는 자연 릴리즈.
  //    capture 단계에서 가로채고 전파 차단 → Lenis와 충돌 방지.
  useEffect(() => {
    const node = trackRef.current;
    if (!node) return;
    if (window.matchMedia("(hover: none), (pointer: coarse)").matches) return;
    const N = WEB3_MENUS.length;
    const onWheel = (e) => {
      const vh = window.innerHeight;
      const rect = node.getBoundingClientRect();
      const top = rect.top + window.scrollY;
      const maxScroll = rect.height - vh;
      const step = maxScroll / N;
      const sy = window.scrollY;
      // 스냅 구간: 진입 직전(0.5vh)부터 핀 해제 직전까지
      if (sy < top - vh * 0.5 || sy > top + maxScroll - 2) return;
      if (snappingRef.current) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }
      if (Math.abs(e.deltaY) < 1) return;
      const idxF = (sy - top) / step;
      let target;
      if (e.deltaY > 0) {
        // 아래로: 다음 메뉴 경계 (next=N이면 핀 해제 지점 → 이후 휠은 구간 밖 자연 스크롤)
        const next = Math.min(N, Math.floor(idxF + 0.001) + 1);
        target = top + next * step;
      } else {
        const prev = Math.ceil(idxF - 0.001) - 1;
        // 위로 릴리즈: 스냅 구간(-0.5vh) "밖"까지 한 번에 이탈해야
        // 존 관리자가 Lenis를 다시 stop시키는 루프가 생기지 않는다.
        target = prev >= 0 ? top + prev * step : top - vh;
      }
      e.preventDefault();
      e.stopImmediatePropagation();
      snapTo(target);
    };
    window.addEventListener("wheel", onWheel, { passive: false, capture: true });
    return () => window.removeEventListener("wheel", onWheel, { capture: true });
  }, []);

  // ── 커스텀 커서 — icon-swap md: 여백 = scroll(↓) / 메뉴 = label(설명) / 데모 = 기본
  useEffect(() => {
    const stage = stageRef.current;
    const cur = cursorRef.current;
    if (!stage || !cur) return;
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
        cx = mx;
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
      // 기본 커서 영역(cursor-native)에서는 커스텀 커서 숨김
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
    // -mt-px: Product 트랙과의 경계 서브픽셀 헤어라인 방지
    <section ref={sectionRef} aria-label="WEB 3.0 시스템" className="relative bg-[#dfe7f8] -mt-px">
      {/* 데스크톱(lg+) — 메뉴당 100vh 핀 스크롤(휠 스냅) */}
      <div className="hidden lg:block">
        <div ref={trackRef} style={{ height: `${W3_TRACK_VH}vh` }} className="relative">
          <div
            ref={stageRef}
            data-cursor="scroll"
            className="sticky top-0 h-screen w-full overflow-hidden"
            style={{ "--w3-pad": "clamp(28px, 7.8vw, 150px)" }}
          >
            {/* 배경 — Product 굴곡에서 드러난 글래스 이미지가 한 장으로 이어짐.
                무대 첫 줄 = 이미지 첫 줄(Product 무대 하단과 픽셀 연속) */}
            <div aria-hidden className="absolute inset-0 overflow-hidden bg-[#dfe7f8]">
              <div ref={bgImgRef} className="absolute top-0 left-0 w-full will-change-transform">
                <img
                  src={productGlass}
                  alt=""
                  draggable="false"
                  className="block w-full select-none"
                />
              </div>
            </div>

            {/* 콘텐츠 — 좌: 상단 라벨·헤딩 / 하단 메뉴(끝 정렬), 우: Arcade Demo */}
            <div
              className="relative h-full flex items-end justify-between gap-[clamp(28px,3.1vw,90px)]"
              style={{
                paddingLeft: "var(--w3-pad)",
                paddingRight: "clamp(24px, 4.2vw, 80px)",
                paddingTop: "var(--w3-pad)",
                paddingBottom: "100px",
              }}
            >
              {/* 좌측 — 상·하단 끝 정렬 (justify-between) */}
              <div className="self-stretch flex flex-col justify-between shrink-0 min-w-0">
                <div className="flex flex-col gap-[clamp(18px,1.6vw,30px)]">
                  {label}
                  {heading}
                </div>
                {/* 메뉴 리스트 (Figma 214:36 업데이트) — 활성: 블루 바(r5) + → /
                    비활성: 투명 + 흰 텍스트. 클릭 시 해당 메뉴 위치로 스크롤 */}
                <div
                  className="flex flex-col gap-[8px]"
                  style={{ width: "clamp(288px, 21.2vw, 406px)" }}
                >
                  {WEB3_MENUS.map((m, i) => (
                    <button
                      key={i}
                      type="button"
                      ref={(el) => (menuRefs.current[i] = el)}
                      data-cursor="label"
                      data-cursor-label={m.desc}
                      onClick={() => snapTo(menuScrollY(i))}
                      className={`w3-item flex items-center justify-between w-full text-left ${i === 0 ? "w3-active" : ""}`}
                    >
                      <span className="w3-title whitespace-nowrap">{m.title}</span>
                      <span className="w3-arrow" aria-hidden>
                        →
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 우측 — Arcade 인터랙티브 데모 (높이 668×1.15=768).
                  실드: iframe이 휠을 삼켜 100vh 스냅이 깨지는 것을 방지 —
                  클릭하면 실드가 사라져 데모 조작 모드, 패널을 벗어나면 복귀 */}
              <div
                className="cursor-native relative shrink overflow-hidden rounded-[20px] bg-white"
                style={{
                  width: "min(56.9vw, 1092px)",
                  height: "min(71.2vh, 768px)",
                  boxShadow: "0 40px 90px -40px rgba(34,40,90,0.45)",
                }}
                aria-label="WEB 3.0 시스템 데모"
                onMouseLeave={() => {
                  if (shieldRef.current) shieldRef.current.style.display = "block";
                }}
              >
                <iframe
                  ref={demoFrameRef}
                  src={ARCADE_EMBED}
                  title="경조화환 상품 주문하기"
                  frameBorder="0"
                  loading="lazy"
                  allow="clipboard-write"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                  style={{ colorScheme: "light" }}
                />
                <div
                  ref={shieldRef}
                  className="absolute inset-0 z-10"
                  onClick={() => {
                    if (shieldRef.current) shieldRef.current.style.display = "none";
                  }}
                />
              </div>
            </div>

            {/* 커스텀 커서 — 여백 ↓스크롤 / 메뉴 설명 라벨 */}
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
                <span className="pd-cur-label" />
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
        <div className="flex flex-col gap-[8px]">
          {WEB3_MENUS.map((m, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-[20px] py-[16px] rounded-[5px]"
              style={{ background: i === 0 ? WEB3_BLUE : "rgba(255,255,255,0.35)" }}
            >
              <p className="font-semibold text-[16px]" style={{ color: i === 0 ? "#fff" : "#445" }}>
                {m.title}
              </p>
              {i === 0 && (
                <span className="font-semibold text-[14px] text-white" aria-hidden>
                  →
                </span>
              )}
            </div>
          ))}
        </div>
        {/* Arcade 임베드 (모바일 — 반응형 비율 컨테이너) */}
        <div
          className="relative w-full overflow-hidden rounded-[14px]"
          style={{ paddingBottom: "calc(47.4479% + 41px)", height: 0 }}
        >
          <iframe
            src={ARCADE_EMBED}
            title="경조화환 상품 주문하기"
            frameBorder="0"
            loading="lazy"
            allow="clipboard-write"
            allowFullScreen
            className="absolute top-0 left-0 w-full h-full"
            style={{ colorScheme: "light" }}
          />
        </div>
      </div>
    </section>
  );
}
