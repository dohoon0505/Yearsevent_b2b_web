"use client";

import { FadeUp } from "@/components/home/FadeUp";

/**
 * WEB 3.0 임베드 공간 — 100vh, bg #FAFAFA
 * Mac 브라우저 창 모양의 wrapper + "Arcade Embedded Area" 중앙 배치
 */
export function ArcadeSection() {
  return (
    <section
      id="arcade"
      className="relative flex h-screen w-full items-center justify-center px-6"
      style={{ backgroundColor: "#FAFAFA" }}
    >
      <div className="flex w-full max-w-[1200px] flex-col items-center">
        <FadeUp delay={0.05}>
          <span
            className="text-[12px] font-bold uppercase"
            style={{ color: "#CB0D35", letterSpacing: "0.18em" }}
          >
            Web 3.0 — 인트라넷 시연
          </span>
        </FadeUp>

        <FadeUp delay={0.18}>
          <h2
            className="mt-5 text-center text-[clamp(28px,4vw,44px)] font-extrabold leading-[1.25]"
            style={{ color: "#231F20", letterSpacing: "-0.015em" }}
          >
            발주·결재·정산이 한 화면에서 끝나는
            <br />
            Years 인트라넷 데모.
          </h2>
        </FadeUp>

        {/* Mac 브라우저 창 wrapper */}
        <FadeUp delay={0.32}>
          <div
            className="mt-12 w-full max-w-[1080px] overflow-hidden rounded-2xl border shadow-[0_30px_80px_rgba(35,31,32,0.08)]"
            style={{ borderColor: "#E5E7EB", backgroundColor: "#FFFFFF" }}
          >
            {/* 타이틀 바 */}
            <div
              className="flex h-10 items-center gap-2 border-b px-4"
              style={{ borderColor: "#E5E7EB", backgroundColor: "#F9FAFB" }}
            >
              <span className="block h-3 w-3 rounded-full" style={{ backgroundColor: "#FF5F57" }} />
              <span className="block h-3 w-3 rounded-full" style={{ backgroundColor: "#FEBC2E" }} />
              <span className="block h-3 w-3 rounded-full" style={{ backgroundColor: "#28C840" }} />
              <div
                className="ml-4 flex h-6 flex-1 items-center justify-center rounded-md px-3 text-[11px] font-medium"
                style={{ backgroundColor: "#FFFFFF", color: "#6B7280", border: "1px solid #E5E7EB", letterSpacing: "-0.005em" }}
              >
                app.years.kr / dashboard
              </div>
            </div>

            {/* 본문 — 임베드 자리 */}
            <div
              className="flex h-[420px] w-full items-center justify-center"
              style={{ backgroundColor: "#FAFAFA" }}
            >
              <div className="flex flex-col items-center gap-3 text-center">
                <span
                  className="text-[11px] font-bold uppercase"
                  style={{ color: "#6B7280", letterSpacing: "0.18em" }}
                >
                  Embed Placeholder
                </span>
                <span
                  className="text-[24px] font-extrabold"
                  style={{ color: "#231F20", letterSpacing: "-0.015em" }}
                >
                  Arcade Embedded Area
                </span>
                <span
                  className="text-[13px] font-medium"
                  style={{ color: "#6B7280", letterSpacing: "-0.01em" }}
                >
                  여기에 Arcade iframe 또는 동영상 데모가 임베드됩니다.
                </span>
              </div>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
