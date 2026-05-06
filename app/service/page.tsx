import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/shared/Container";
import { FadeIn } from "@/components/shared/FadeIn";
import { SectionHeading } from "@/components/shared/SectionHeading";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Web3Showcase } from "@/components/sections/Web3Showcase";
import { AgencyWarning } from "@/components/sections/AgencyWarning";
import { strengths } from "@/lib/data/strengths";

export const metadata: Metadata = {
  title: "서비스",
  description:
    "Years의 4가지 표준 혜택과 WEB 3.0 인트라넷 시스템, 그리고 3단계 도입 절차를 안내합니다.",
};

const processSteps = [
  {
    step: "01",
    title: "도입 상담 신청",
    detail:
      "도입 상담 채널을 통해 회사명·담당자·연락처와 예상 발주량을 알려주세요. 1영업일 내 담당 매니저가 회신합니다.",
  },
  {
    step: "02",
    title: "계약서 검토 후 회신",
    detail:
      "Years 측에서 표준 계약서를 송부합니다. 단가표·SLA·개인정보 처리 조항을 함께 검토 후 도입 여부를 회신해 주세요.",
  },
  {
    step: "03",
    title: "WEB 3.0 회원 가입",
    detail:
      "All-In-One 처리 시스템 회원 가입을 완료하면 즉시 발주가 가능합니다. 발송인 프로필·정산 옵션을 등록해 운영을 시작하세요.",
  },
];

const faqs = [
  {
    q: "도입 시 별도 가입비가 있나요?",
    a: "도입 가입비, 시스템 이용료는 없습니다. 발주 단가에 모든 비용이 포함되어 있으며, 월 단위로 자동 정산됩니다.",
  },
  {
    q: "기존 거래처와 병행해도 되나요?",
    a: "가능합니다. 단가·품질을 비교해 보시고 점진적으로 비중을 옮기시는 도입 형태가 가장 일반적입니다.",
  },
  {
    q: "지방 발송도 추가 비용이 없나요?",
    a: "도서산간을 포함한 대한민국 전국 어디든 단일 단가로 무료 배송됩니다. 별도의 지역 차등 단가가 없습니다.",
  },
  {
    q: "주문 후 취소·변경은 어떻게 처리되나요?",
    a: "제작 착수 전이면 자유롭게 취소·변경 가능합니다. 제작 착수 이후의 정책은 표준 계약서에 명시되어 있으며, 사고 발생 시 50만원 한도 내 책임 보상이 적용됩니다.",
  },
  {
    q: "개인 사업자도 이용할 수 있나요?",
    a: "이용 가능합니다. 다만 본 서비스는 B2B 정기 발주에 최적화되어 있어, 일반 1회성 주문은 별도 채널을 안내드릴 수 있습니다.",
  },
];

export default function ServicePage() {
  return (
    <>
      <PageHero />

      <section className="bg-background py-24 md:py-32">
        <Container>
          <SectionHeading
            eyebrow="Standard Benefits"
            title={
              <>
                도입 즉시 적용되는
                <br />
                <span className="text-brand">4가지 표준 혜택</span>
              </>
            }
            description="기업 규모·계약 형태와 무관하게 모든 제휴사에 동일하게 적용되는 표준 혜택입니다."
          />
          <div className="mt-14 grid gap-5 md:grid-cols-2">
            {strengths.map((s, idx) => {
              const Icon = s.icon;
              return (
                <FadeIn key={s.highlight} delay={idx * 0.05}>
                  <article className="h-full rounded-2xl border bg-card p-8 md:p-10">
                    <div className="flex items-start justify-between gap-4">
                      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
                        <Icon className="h-6 w-6" strokeWidth={1.6} />
                      </span>
                      <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Benefit {String(idx + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <p className="mt-6 text-sm font-medium uppercase tracking-wider text-muted-foreground">
                      {s.title}
                    </p>
                    <p className="mt-1 text-2xl font-bold tracking-tight md:text-3xl">
                      {s.highlight}
                    </p>
                    <p className="mt-4 text-sm leading-7 text-muted-foreground md:text-base md:leading-8">
                      {s.description}
                    </p>
                  </article>
                </FadeIn>
              );
            })}
          </div>
        </Container>
      </section>

      <Web3Showcase />

      <section id="process" className="bg-muted/40 py-24 md:py-32">
        <Container>
          <SectionHeading
            eyebrow="Onboarding"
            title={
              <>
                도입은 단 3단계,
                <br />
                평균 1~2영업일
              </>
            }
            description="복잡한 절차 없이 빠르게 시작합니다. 모든 과정에서 전담 매니저가 함께합니다."
          />
          <ol className="mt-14 grid gap-5 md:grid-cols-3">
            {processSteps.map((step, idx) => (
              <FadeIn key={step.step} delay={idx * 0.06}>
                <li className="relative h-full overflow-hidden rounded-2xl border bg-card p-7 md:p-8">
                  <span className="absolute right-5 top-5 text-5xl font-black tracking-tight text-brand/15">
                    {step.step}
                  </span>
                  <div className="relative">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
                      Step {step.step}
                    </p>
                    <h3 className="mt-3 text-xl font-bold tracking-tight md:text-2xl">
                      {step.title}
                    </h3>
                    <p className="mt-4 text-sm leading-7 text-muted-foreground md:text-base md:leading-8">
                      {step.detail}
                    </p>
                  </div>
                </li>
              </FadeIn>
            ))}
          </ol>

          <div className="mt-14 rounded-2xl border bg-card p-7 md:p-9">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4 md:items-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
                  <Check className="h-6 w-6" strokeWidth={2.2} />
                </span>
                <div>
                  <p className="text-base font-semibold tracking-tight md:text-lg">
                    상담만으로도 단가 비교가 가능합니다.
                  </p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    현재 거래처 단가표를 보내주시면 즉시 비교 견적을 회신
                    드립니다.
                  </p>
                </div>
              </div>
              <Button asChild size="lg">
                <Link href="/inquiry">
                  도입 문의하기 <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <AgencyWarning />

      <section className="bg-background py-24 md:py-32">
        <Container>
          <SectionHeading
            eyebrow="FAQ"
            title="도입 전 가장 많이 받는 질문"
            description="여기에 답이 없는 질문은 도입 상담 채널로 보내주세요. 직접 회신드립니다."
            align="center"
          />
          <div className="mx-auto mt-14 max-w-3xl">
            <Accordion type="single" collapsible defaultValue="faq-0">
              {faqs.map((item, idx) => (
                <AccordionItem key={item.q} value={`faq-${idx}`}>
                  <AccordionTrigger className="text-base md:text-lg">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-7 md:text-base md:leading-8">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </Container>
      </section>
    </>
  );
}

function PageHero() {
  return (
    <section className="bg-primary pt-32 pb-16 text-primary-foreground md:pt-40 md:pb-24">
      <Container>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/65">
          Service
        </p>
        <h1 className="mt-4 text-4xl font-bold leading-[1.15] tracking-tight md:text-6xl">
          꽃배달, 그 이상.
          <br />
          B2B 운영을 위한 표준 시스템.
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-7 text-white/75 md:text-lg md:leading-8">
          단순한 화환·화분 공급이 아닌, 발주 → 알림 → 정산 → 회계까지 한
          시스템에서 처리하는 B2B 표준 운영 솔루션.
        </p>
      </Container>
    </section>
  );
}
