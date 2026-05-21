"use client";

import { FadeUp } from "@/components/home/FadeUp";
import {
  Percent,
  ShieldCheck,
  Truck,
  CalendarSync,
  Users,
} from "lucide-react";

/**
 * 5가지 핵심 혜택 — Asymmetric Bento Grid (3열 2행)
 * 카드1 (35% 할인): col-span-2
 * 카드2 (50만원 책임배상): col-span-1
 * 카드3, 4, 5: 하단 1칸씩
 */
type Card = {
  title: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  span?: string;
  accent?: boolean;
};

const cards: Card[] = [
  {
    title: "평균 35% 단가 할인",
    desc: "중간 대행 마진을 제거한 직접 운영가. 일반 시장가 대비 평균 35% 절감을 보증합니다.",
    icon: Percent,
    span: "lg:col-span-2",
    accent: true,
  },
  {
    title: "50만원 책임배상",
    desc: "납기·품질 문제 발생 시 건당 최대 50만원 즉시 보상.",
    icon: ShieldCheck,
    span: "lg:col-span-1",
  },
  {
    title: "전국 무료배송",
    desc: "수도권 외 지역도 별도 배송비 없이 처리합니다.",
    icon: Truck,
  },
  {
    title: "월 단위 자동정산",
    desc: "건별 송금·세금계산서 발행 불필요. 월말 일괄 정산.",
    icon: CalendarSync,
  },
  {
    title: "임직원 동일 단가",
    desc: "대표 발주든 임직원 개별 발주든 동일한 협력 단가 적용.",
    icon: Users,
  },
];

export function BenefitsSection() {
  return (
    <section
      id="benefits"
      className="relative flex h-screen w-full items-center justify-center px-6"
      style={{ backgroundColor: "#FFFFFF" }}
    >
      <div className="flex w-full max-w-[1280px] flex-col">
        <div className="flex flex-col items-start gap-4">
          <FadeUp delay={0.05}>
            <span
              className="text-[12px] font-bold uppercase"
              style={{ color: "#CB0D35", letterSpacing: "0.18em" }}
            >
              Core — 5가지 핵심 혜택
            </span>
          </FadeUp>
          <FadeUp delay={0.18}>
            <h2
              className="text-[clamp(28px,4.2vw,46px)] font-extrabold leading-[1.2]"
              style={{ color: "#231F20", letterSpacing: "-0.015em" }}
            >
              직접 운영이기 때문에 가능한
              <br />
              5가지 보장입니다.
            </h2>
          </FadeUp>
        </div>

        <FadeUp delay={0.32}>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((card) => {
              const Icon = card.icon;
              const isAccent = !!card.accent;
              return (
                <div
                  key={card.title}
                  className={`group relative flex flex-col justify-between rounded-3xl border p-7 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.05)] ${card.span ?? ""}`}
                  style={{
                    backgroundColor: isAccent ? "#231F20" : "#FFFFFF",
                    borderColor: isAccent ? "#231F20" : "#E5E7EB",
                    color: isAccent ? "#FFFFFF" : "#231F20",
                    minHeight: isAccent ? "240px" : "200px",
                  }}
                >
                  <span
                    className="absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 rounded-b-3xl transition-transform duration-500 group-hover:scale-x-100"
                    style={{ backgroundColor: "#EF695D" }}
                  />
                  <div
                    className="inline-flex h-11 w-11 items-center justify-center rounded-xl"
                    style={{
                      backgroundColor: isAccent ? "rgba(255,255,255,0.1)" : "#F3F4F6",
                    }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="mt-6">
                    <h3
                      className={`font-extrabold ${isAccent ? "text-[28px]" : "text-[18px]"}`}
                      style={{ letterSpacing: "-0.015em" }}
                    >
                      {card.title}
                    </h3>
                    <p
                      className="mt-3 text-[14px] font-medium leading-[1.65]"
                      style={{
                        color: isAccent ? "rgba(255,255,255,0.7)" : "#6B7280",
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {card.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
