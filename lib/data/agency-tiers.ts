export interface AgencyTier {
  step: string;
  label: string;
  detail: string;
  takesMargin: boolean;
  isUs?: boolean;
}

export const agencyTiers: AgencyTier[] = [
  {
    step: "1차",
    label: "대대행사",
    detail:
      "마케팅 업체가 쇼핑몰·네이버 스토어를 활성화하여 일반 소비자·기업으로부터 주문을 발생시키는 단계",
    takesMargin: true,
  },
  {
    step: "2차",
    label: "대행사",
    detail:
      "1차에서 발생한 주문을 받아 정보를 정리하고, 3차 중개자에게 꽃배달을 다시 요청하는 단계",
    takesMargin: true,
  },
  {
    step: "3차",
    label: "중개자",
    detail:
      "다양한 실무자 풀을 보유하고, 그중 가장 저렴한 실무자를 골라 꽃배달을 의뢰하는 단계",
    takesMargin: true,
  },
  {
    step: "★",
    label: "실무자 (Years)",
    detail:
      "실제 유통처와 직접 소통하며 주문을 책임지는 단계. 우리는 바로 이 위치에서 10년간 운영해 왔습니다.",
    takesMargin: false,
    isUs: true,
  },
  {
    step: "5차",
    label: "유통처",
    detail:
      "화원에서 직접 화환·화분을 제작하여 실제 배송지로 배송하는 곳",
    takesMargin: false,
  },
];

export const agencyHazards = [
  "불필요한 중간 마진이 누적되어 비용이 높아집니다.",
  "주문 상품에 대한 책임 주체가 모호합니다.",
  "고객의 요청에 대한 전문성·대응력이 떨어집니다.",
  "배송 과정에서 문제 발생 시 대처가 느려집니다.",
];
