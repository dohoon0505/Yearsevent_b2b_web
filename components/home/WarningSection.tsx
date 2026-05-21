"use client";

import { FadeUp } from "@/components/home/FadeUp";
import { ChevronRight } from "lucide-react";

/**
 * 경고 (문제 제기) — 100vh, bg #F9FAFB
 * 5단계 유통구조 다이어그램. 중간 3단계는 #CB0D35 하이라이트.
 */
const nodes = [
  { label: "고객사", role: "발주", highlight: false },
  { label: "1차 대행", role: "수주 마진", highlight: true },
  { label: "2차 대행", role: "중개 마진", highlight: true },
  { label: "3차 대행", role: "재중개 마진", highlight: true },
  { label: "실제 화훼농가", role: "납품", highlight: false },
];

export function WarningSection() {
  return (
    <section
      id="warning"
      className="relative flex h-screen w-full items-center justify-center px-6"
      style={{ backgroundColor: "#F9FAFB" }}
    >
      <div className="flex w-full max-w-[1200px] flex-col">
        <FadeUp delay={0.05}>
          <span
            className="text-[12px] font-bold uppercase"
            style={{ color: "#CB0D35", letterSpacing: "0.18em" }}
          >
            Why — 업계 구조 경고
          </span>
        </FadeUp>

        <FadeUp delay={0.18}>
          <h2
            className="mt-5 text-[clamp(30px,4.6vw,52px)] font-extrabold leading-[1.2]"
            style={{ letterSpacing: "-0.015em" }}
          >
            <span style={{ color: "#CB0D35" }}>꽃배달 대행사 80%</span>
            <span style={{ color: "#231F20" }}>가 중간마진입니다.</span>
          </h2>
        </FadeUp>

        <FadeUp delay={0.3}>
          <p
            className="mt-5 max-w-[680px] text-[15px] font-medium leading-[1.7]"
            style={{ color: "#6B7280", letterSpacing: "-0.01em" }}
          >
            5단계 유통이 표준입니다. 고객사가 지불한 금액의 절반 이상은 실제
            상품·배송이 아닌 중간 대행 수수료로 흘러갑니다.
          </p>
        </FadeUp>

        {/* 다이어그램 */}
        <FadeUp delay={0.42}>
          <div className="mt-14 hidden md:block">
            <div className="flex items-stretch justify-between gap-3">
              {nodes.map((node, i) => (
                <div key={node.label} className="flex flex-1 items-stretch gap-3">
                  <div
                    className="flex flex-1 flex-col items-center justify-center rounded-2xl border px-4 py-7 text-center"
                    style={{
                      backgroundColor: node.highlight ? "#CB0D35" : "#FFFFFF",
                      borderColor: node.highlight ? "#CB0D35" : "#E5E7EB",
                      color: node.highlight ? "#FFFFFF" : "#231F20",
                    }}
                  >
                    <span
                      className="text-[11px] font-semibold uppercase"
                      style={{
                        letterSpacing: "0.14em",
                        color: node.highlight ? "rgba(255,255,255,0.85)" : "#6B7280",
                      }}
                    >
                      Step {i + 1}
                    </span>
                    <span
                      className="mt-3 text-[18px] font-bold"
                      style={{ letterSpacing: "-0.015em" }}
                    >
                      {node.label}
                    </span>
                    <span
                      className="mt-1 text-[12px] font-medium"
                      style={{
                        letterSpacing: "-0.01em",
                        color: node.highlight ? "rgba(255,255,255,0.85)" : "#6B7280",
                      }}
                    >
                      {node.role}
                    </span>
                  </div>
                  {i < nodes.length - 1 && (
                    <div className="flex items-center">
                      <ChevronRight
                        className="h-5 w-5"
                        style={{ color: i >= 0 && nodes[i].highlight && nodes[i + 1].highlight ? "#CB0D35" : "#9CA3AF" }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* 빨간 구간 강조 라벨 */}
            <div className="mt-6 flex justify-center">
              <div
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-bold"
                style={{
                  backgroundColor: "#FFFFFF",
                  color: "#CB0D35",
                  border: "1px solid #CB0D35",
                  letterSpacing: "-0.01em",
                }}
              >
                <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: "#CB0D35" }} />
                3단계 중간 대행 = 누적 마진 평균 80%
              </div>
            </div>
          </div>

          {/* 모바일 다이어그램 — 세로 */}
          <div className="mt-10 flex flex-col gap-3 md:hidden">
            {nodes.map((node, i) => (
              <div
                key={node.label}
                className="flex items-center justify-between rounded-xl border px-4 py-4"
                style={{
                  backgroundColor: node.highlight ? "#CB0D35" : "#FFFFFF",
                  borderColor: node.highlight ? "#CB0D35" : "#E5E7EB",
                  color: node.highlight ? "#FFFFFF" : "#231F20",
                }}
              >
                <div className="flex flex-col">
                  <span
                    className="text-[10px] font-semibold uppercase"
                    style={{
                      letterSpacing: "0.14em",
                      color: node.highlight ? "rgba(255,255,255,0.85)" : "#6B7280",
                    }}
                  >
                    Step {i + 1}
                  </span>
                  <span className="text-[15px] font-bold" style={{ letterSpacing: "-0.015em" }}>
                    {node.label}
                  </span>
                </div>
                <span
                  className="text-[12px] font-medium"
                  style={{
                    letterSpacing: "-0.01em",
                    color: node.highlight ? "rgba(255,255,255,0.85)" : "#6B7280",
                  }}
                >
                  {node.role}
                </span>
              </div>
            ))}
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
