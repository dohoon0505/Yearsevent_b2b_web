"use client";

import * as React from "react";
import { FadeUp } from "@/components/home/FadeUp";

/**
 * 도입사례 + 파트너 리스트 — 100vh
 * 상단: 6개 업종 탭 / 본문: 탭별 사례 / 하단: 11개 파트너 텍스트 나열 (· 구분)
 */
const tabs = [
  { id: "law", label: "법무법인" },
  { id: "tax", label: "세무법인" },
  { id: "mfg", label: "제조업" },
  { id: "retail", label: "도소매" },
  { id: "logi", label: "유통업" },
  { id: "org", label: "단체·기관" },
];

const cases: Record<string, { stat: string; statLabel: string; copy: string }> = {
  law: {
    stat: "월 18건",
    statLabel: "평균 처리량",
    copy: "사건 의뢰인·법무 파트너 경조사를 통합 위임. 비서팀의 발주·정산 업무가 0건으로 정리됩니다.",
  },
  tax: {
    stat: "월 22건",
    statLabel: "평균 처리량",
    copy: "고객사 임원 경조사를 분기 단위 자동정산으로 처리. 세금계산서는 월말 일괄 발행됩니다.",
  },
  mfg: {
    stat: "월 40건+",
    statLabel: "평균 처리량",
    copy: "임직원 본인 + 가족 경조사까지 동일 단가. 협력업체 경조사도 통합 운영합니다.",
  },
  retail: {
    stat: "월 15건",
    statLabel: "평균 처리량",
    copy: "지점·매장 단위로 분산되어 있던 경조 비용을 본사 일괄 단가로 정렬했습니다.",
  },
  logi: {
    stat: "월 28건",
    statLabel: "평균 처리량",
    copy: "전국 거점 단위 무료 배송. 지방 거점도 수도권과 동일 가격으로 처리됩니다.",
  },
  org: {
    stat: "월 12건",
    statLabel: "평균 처리량",
    copy: "협회·재단의 회원사 경조사 운영을 위임. 회원사별 발주 이력은 관리자 화면에서 확인됩니다.",
  },
};

const partners = [
  "법무법인 OO",
  "세무법인 △△",
  "OO제조",
  "△△유통",
  "OO상사",
  "△△에너지",
  "OO그룹",
  "△△재단",
  "OO협회",
  "△△조합",
  "OO공사",
];

export function CasesSection() {
  const [active, setActive] = React.useState("law");

  return (
    <section
      id="cases"
      className="relative flex h-screen w-full items-center justify-center px-6"
      style={{ backgroundColor: "#FFFFFF" }}
    >
      <div className="flex w-full max-w-[1200px] flex-col">
        <div className="flex flex-col items-start gap-4">
          <FadeUp delay={0.05}>
            <span
              className="text-[12px] font-bold uppercase"
              style={{ color: "#CB0D35", letterSpacing: "0.18em" }}
            >
              Cases — 업종별 도입사례
            </span>
          </FadeUp>
          <FadeUp delay={0.18}>
            <h2
              className="text-[clamp(28px,4.2vw,44px)] font-extrabold leading-[1.2]"
              style={{ color: "#231F20", letterSpacing: "-0.015em" }}
            >
              어떤 업종이 어떻게 도입했는지
              <br />
              한 줄로 보여드립니다.
            </h2>
          </FadeUp>
        </div>

        {/* 탭 */}
        <FadeUp delay={0.3}>
          <div
            className="mt-10 inline-flex flex-wrap items-center gap-1 rounded-full p-1.5"
            style={{ backgroundColor: "#F3F4F6" }}
          >
            {tabs.map((t) => {
              const isActive = active === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActive(t.id)}
                  className="rounded-full px-4 py-2 text-[13px] font-semibold transition-colors"
                  style={{
                    backgroundColor: isActive ? "#231F20" : "transparent",
                    color: isActive ? "#FFFFFF" : "#374151",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </FadeUp>

        {/* 탭 본문 */}
        <FadeUp delay={0.4} key={active}>
          <div
            className="mt-8 grid grid-cols-1 gap-6 rounded-3xl border p-8 md:grid-cols-[260px_1fr]"
            style={{ borderColor: "#E5E7EB", backgroundColor: "#FFFFFF" }}
          >
            <div className="flex flex-col border-r-0 border-b pb-6 md:border-b-0 md:border-r md:pb-0 md:pr-6" style={{ borderColor: "#F3F4F6" }}>
              <span
                className="text-[11px] font-semibold uppercase"
                style={{ color: "#6B7280", letterSpacing: "0.14em" }}
              >
                {cases[active].statLabel}
              </span>
              <span
                className="mt-2 text-[40px] font-extrabold leading-none"
                style={{ color: "#CB0D35", letterSpacing: "-0.015em" }}
              >
                {cases[active].stat}
              </span>
            </div>
            <p
              className="text-[16px] font-medium leading-[1.75]"
              style={{ color: "#374151", letterSpacing: "-0.01em" }}
            >
              {cases[active].copy}
            </p>
          </div>
        </FadeUp>

        {/* 파트너 텍스트 리스트 */}
        <FadeUp delay={0.55}>
          <div className="mt-12">
            <span
              className="text-[11px] font-semibold uppercase"
              style={{ color: "#6B7280", letterSpacing: "0.14em" }}
            >
              Partners — 협력 파트너
            </span>
            <p
              className="mt-3 text-[clamp(15px,1.6vw,20px)] font-bold leading-[1.6]"
              style={{ color: "#231F20", letterSpacing: "-0.015em" }}
            >
              {partners.map((p, i) => (
                <span key={p}>
                  {p}
                  {i < partners.length - 1 && (
                    <span className="mx-2.5" style={{ color: "#CB0D35" }}>
                      ·
                    </span>
                  )}
                </span>
              ))}
            </p>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
