"use client";

import { FadeUp } from "@/components/home/FadeUp";

/**
 * About 진입부 — 100vh, 중앙 정렬
 * 단일 강한 카피와 보조 설명
 */
export function AboutSection() {
  return (
    <section
      id="about"
      className="relative flex h-screen w-full items-center justify-center px-6"
      style={{ backgroundColor: "#FFFFFF" }}
    >
      <div className="flex w-full max-w-[1100px] flex-col items-center text-center">
        <FadeUp delay={0.05}>
          <span
            className="text-[12px] font-bold uppercase"
            style={{ color: "#CB0D35", letterSpacing: "0.18em" }}
          >
            About — 올해의경조사
          </span>
        </FadeUp>

        <FadeUp delay={0.18}>
          <h2
            className="mt-6 text-[clamp(28px,4.3vw,48px)] font-bold leading-[1.25]"
            style={{ color: "#231F20", letterSpacing: "-0.015em" }}
          >
            올해의경조사는 8년간 100만건+ 노하우의
            <br />
            경조사 전문기업입니다.
          </h2>
        </FadeUp>

        <FadeUp delay={0.32}>
          <p
            className="mt-7 max-w-[700px] text-[16px] font-medium leading-[1.8]"
            style={{ color: "#6B7280", letterSpacing: "-0.01em" }}
          >
            중간 대행사를 거치지 않고 자체 운영망으로 직접 처리합니다.
            법무·세무법인, 제조·도소매·유통 기업, 공공기관까지 — 경조사가 잦은
            조직의 업무를 한 단계로 정리합니다.
          </p>
        </FadeUp>

        <FadeUp delay={0.45}>
          <dl className="mt-14 grid grid-cols-3 gap-x-12 gap-y-4 border-t border-b py-8" style={{ borderColor: "#F3F4F6" }}>
            {[
              { v: "8년", l: "운영 연차" },
              { v: "100만+", l: "누적 경조사 처리" },
              { v: "직접 운영", l: "중간대행 0%" },
            ].map((s) => (
              <div key={s.l} className="flex flex-col items-center">
                <dt
                  className="text-[11px] font-semibold uppercase"
                  style={{ color: "#6B7280", letterSpacing: "0.14em" }}
                >
                  {s.l}
                </dt>
                <dd
                  className="mt-2 text-[28px] font-extrabold"
                  style={{ color: "#231F20", letterSpacing: "-0.015em" }}
                >
                  {s.v}
                </dd>
              </div>
            ))}
          </dl>
        </FadeUp>
      </div>
    </section>
  );
}
