export interface Achievement {
  year: string;
  title: string;
  description: string;
  marker: string;
}

export const achievements: Achievement[] = [
  {
    year: "2026",
    title: "대구 가톨릭대학교 공식 협력사",
    description:
      "대학 본부 · 부속 의료원 · 산학협력단의 경조사 화훼 공급 파트너로 정식 선정",
    marker: "§",
  },
  {
    year: "2026",
    title: "나라장터 공식 입찰 낙찰",
    description:
      "공공기관 경조사 화훼 부문 조달 입찰 낙찰. 정부·지자체 단가 기준 충족 검증",
    marker: "§",
  },
];

export const heroStats = [
  { value: "10+", label: "운영 연차" },
  { value: "100+", label: "제휴 파트너" },
  { value: "전국", label: "직접 배송망" },
  { value: "50만원", label: "건당 책임 배상" },
];
