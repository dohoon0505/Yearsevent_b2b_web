import type { LucideIcon } from "lucide-react";
import {
  UserSquare2,
  Sparkles,
  Activity,
  MessagesSquare,
  Calculator,
} from "lucide-react";

export interface Web3Feature {
  index: string;
  icon: LucideIcon;
  title: string;
  description: string;
  bullets: string[];
  preview: string;
}

export const web3Features: Web3Feature[] = [
  {
    index: "01",
    icon: UserSquare2,
    title: "발송인 프로필 저장 시스템",
    description:
      "매번 반복되는 발송인 정보, 발송 문구, 회사 직책을 한 번 저장해 두면 다음 주문부터는 클릭 한 번으로 자동 입력됩니다.",
    bullets: [
      "회사·법인·개인 발송인 다중 등록",
      "직책별 · 부서별 발송 문구 템플릿",
      "조사·축의 상황별 기본 멘트 자동 매칭",
    ],
    preview: "발송인",
  },
  {
    index: "02",
    icon: Sparkles,
    title: "AI 간편 발주 시스템",
    description:
      "부고장, 청첩장 텍스트 또는 이미지를 붙여넣기만 하면 발인 일시·장소·고인·상주 정보가 자동으로 분석되어 주문서가 채워집니다.",
    bullets: [
      "부고/청첩 텍스트·이미지 자동 파싱",
      "장례식장·예식장 위치 자동 매칭",
      "발인 시각 기준 도착 마감 자동 계산",
    ],
    preview: "AI 발주",
  },
  {
    index: "03",
    icon: Activity,
    title: "실시간 주문 현황 조회",
    description:
      "주문 접수 · 제작 · 출고 · 도착까지 4단계 진행 상황을 실시간으로 확인하고, 배송 완료 사진까지 즉시 받아볼 수 있습니다.",
    bullets: [
      "단계별 타임스탬프 + 담당자 표시",
      "도착지 도착 사진 자동 업로드",
      "지연 발생 시 푸시 + 이메일 알림",
    ],
    preview: "현황",
  },
  {
    index: "04",
    icon: MessagesSquare,
    title: "다방향 메시징 시스템",
    description:
      "발송 요청 대표, 주문을 담당한 실무자, 경조사가 발생한 대상자까지. 원하는 대상에게 알림 메시지를 자동 발송하도록 설정할 수 있습니다.",
    bullets: [
      "대표 · 담당자 · 수신자 3-way 알림",
      "카카오 알림톡 + 이메일 템플릿",
      "발송 시점 · 채널을 주문서마다 커스터마이즈",
    ],
    preview: "메시징",
  },
  {
    index: "05",
    icon: Calculator,
    title: "체계적 회계 · 정산 시스템",
    description:
      "매월 거래 내역을 일일이 대조하고 계산서 발급 여부를 확인할 필요가 없습니다. 자동 생성된 명세서를 검토하고 동의 버튼 한 번이면 세금계산서가 발급됩니다.",
    bullets: [
      "월별 명세서 · 거래원장 자동 생성",
      "동의 한 번으로 전자세금계산서 발행",
      "부서별 · 프로젝트별 비용 라벨 분류",
    ],
    preview: "정산",
  },
];
