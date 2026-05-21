"use client";

import { FadeUp } from "@/components/home/FadeUp";
import { SlotCounter } from "@/components/home/SlotCounter";

/**
 * 빅넘버 실적 — 100vh, bg #231F20, text #FFFFFF
 * 슬롯머신 카운트업 (인뷰 진입 시 즉시 회전 → 정답 안착)
 */
const bignumbers = [
  { value: "1,570,000", suffix: "+", label: "누적 경조사 처리 건수" },
  { value: "100", suffix: "+", label: "도입 기업 수" },
  { value: "8", suffix: "년", label: "직접 운영 연차" },
  { value: "35", suffix: "%", label: "평균 단가 절감률" },
];

export function StatsSection() {
  return (
    <section
      id="stats"
      className="relative flex h-screen w-full items-center justify-center px-6"
      style={{ backgroundColor: "#231F20" }}
    >
      <div className="flex w-full max-w-[1200px] flex-col">
        <FadeUp delay={0.05}>
          <span
            className="text-[12px] font-bold uppercase"
            style={{ color: "#EF695D", letterSpacing: "0.18em" }}
          >
            Numbers — 빅 넘버
          </span>
        </FadeUp>

        <FadeUp delay={0.18}>
          <h2
            className="mt-5 text-[clamp(28px,4.2vw,46px)] font-extrabold leading-[1.2]"
            style={{ color: "#FFFFFF", letterSpacing: "-0.015em" }}
          >
            숫자가 직접 설명하는
            <br />
            8년 운영의 누적값.
          </h2>
        </FadeUp>

        <div className="mt-12 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {bignumbers.map((b, i) => (
            <FadeUp key={b.label} delay={0.32 + i * 0.07}>
              <div className="flex flex-col gap-3 border-t pt-6" style={{ borderColor: "rgba(255,255,255,0.12)" }}>
                <span
                  className="text-[clamp(40px,5vw,72px)] font-extrabold leading-[1]"
                  style={{ letterSpacing: "-0.015em" }}
                >
                  <SlotCounter value={b.value} color="#FFFFFF" />
                  <span style={{ color: "#EF695D" }}>{b.suffix}</span>
                </span>
                <span
                  className="text-[13px] font-medium"
                  style={{ color: "rgba(255,255,255,0.65)", letterSpacing: "-0.01em" }}
                >
                  {b.label}
                </span>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
