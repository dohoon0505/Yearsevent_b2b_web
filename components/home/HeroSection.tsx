"use client";

import { FadeUp } from "@/components/home/FadeUp";

/**
 * Hero — 100vh, 흰 배경, 중앙 정렬
 * 배지(업종 7종) + 메인 헤드라인 + 수직 스크롤 인디케이터
 */
const industries = [
  "법무법인",
  "세무법인",
  "제조업",
  "도소매업",
  "유통업",
  "공공기관",
  "단체·협회",
];

export function HeroSection() {
  return (
    <section
      id="hero"
      className="relative flex h-screen w-full items-center justify-center px-6"
      style={{ backgroundColor: "#FFFFFF" }}
    >
      <div className="flex w-full max-w-[1100px] flex-col items-center text-center">
        {/* 업종 배지 */}
        <FadeUp delay={0.05}>
          <ul className="flex flex-wrap items-center justify-center gap-2">
            {industries.map((label) => (
              <li
                key={label}
                className="inline-flex items-center rounded-full border px-3.5 py-1.5 text-[12px] font-semibold"
                style={{
                  borderColor: "#E5E7EB",
                  color: "#231F20",
                  backgroundColor: "#FFFFFF",
                  letterSpacing: "-0.01em",
                }}
              >
                {label}
              </li>
            ))}
          </ul>
        </FadeUp>

        {/* 메인 헤드라인 */}
        <FadeUp delay={0.18}>
          <h1
            className="mt-10 text-[clamp(34px,5.6vw,64px)] font-extrabold leading-[1.15]"
            style={{ color: "#231F20", letterSpacing: "-0.015em" }}
          >
            경조사 소식이 많이 들려온다면,
            <br />
            전담관리 서비스는 꼭 필요합니다.
          </h1>
        </FadeUp>

        {/* 보조 문구 */}
        <FadeUp delay={0.32}>
          <p
            className="mt-6 max-w-[640px] text-[16px] font-medium leading-[1.7]"
            style={{ color: "#6B7280", letterSpacing: "-0.01em" }}
          >
            8년간 100만 건 이상의 경조사를 직접 운영해 온 전담관리 파트너.
            법무·세무·제조·유통까지 — 조직의 경조 업무를 한 번에 위임받습니다.
          </p>
        </FadeUp>
      </div>

      {/* 스크롤 인디케이터 — 수직선 */}
      <div className="pointer-events-none absolute bottom-12 left-1/2 -translate-x-1/2">
        <div className="flex flex-col items-center gap-3">
          <span
            className="text-[11px] font-semibold uppercase"
            style={{ color: "#231F20", letterSpacing: "0.12em" }}
          >
            Scroll
          </span>
          <span
            className="block animate-y-scroll-line"
            style={{ width: "1px", height: "60px", backgroundColor: "#CB0D35" }}
          />
        </div>
      </div>
    </section>
  );
}
