import type { LucideIcon } from "lucide-react";
import { BadgePercent, Truck, Receipt, ShieldCheck } from "lucide-react";

export interface Strength {
  icon: LucideIcon;
  title: string;
  highlight: string;
  description: string;
}

export const strengths: Strength[] = [
  {
    icon: BadgePercent,
    title: "소비자가 대비",
    highlight: "35% 할인",
    description:
      "법무·세무·기관 등 경조사가 많은 조직을 위해 시장가 대비 평균 35% 절감된 단가로 공급합니다.",
  },
  {
    icon: Truck,
    title: "대한민국 전국",
    highlight: "무료 배송",
    description:
      "도서산간을 포함한 전국 어디든 추가 배송비 없이 책임 배송. 당일 출고 기준 시간 내 도착.",
  },
  {
    icon: Receipt,
    title: "월 단위",
    highlight: "자동 정산 · 계산서",
    description:
      "매월 발주 내역을 자동 집계하여 명세서를 생성하고, 동의 한 번으로 세금계산서가 발급됩니다.",
  },
  {
    icon: ShieldCheck,
    title: "최대",
    highlight: "50만원 책임 배상",
    description:
      "배송 사고 · 품질 이슈 발생 시 건당 최대 50만 원까지 책임 보상하는 제휴 전용 보장 제도.",
  },
];
