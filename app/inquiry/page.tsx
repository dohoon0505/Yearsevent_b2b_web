import type { Metadata } from "next";
import {
  Phone,
  Mail,
  MessageCircle,
  Clock,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Container } from "@/components/shared/Container";
import { FadeIn } from "@/components/shared/FadeIn";
import { InquiryForm } from "@/components/inquiry/InquiryForm";

export const metadata: Metadata = {
  title: "도입 문의",
  description:
    "Years 도입 문의 채널. 회사명·담당자·연락처·예상 발주량을 알려주시면 1영업일 내에 회신드립니다.",
};

const channels = [
  {
    icon: Phone,
    title: "전화 상담",
    value: "02-0000-0000",
    hint: "평일 09:00 – 18:00",
    href: "tel:02-0000-0000",
  },
  {
    icon: Mail,
    title: "이메일 문의",
    value: "partner@years.kr",
    hint: "24시간 접수 / 1영업일 내 회신",
    href: "mailto:partner@years.kr",
  },
  {
    icon: MessageCircle,
    title: "카카오 채널",
    value: "@years",
    hint: "실시간 문의 채널 (준비 중)",
    href: "#",
  },
];

const guarantees = [
  {
    icon: Clock,
    title: "1영업일 내 회신",
    detail: "도입 문의 접수 후 영업일 기준 24시간 내 매니저가 직접 연락드립니다.",
  },
  {
    icon: ShieldCheck,
    title: "단가 비교 견적",
    detail: "현재 거래처 단가표를 보내주시면 무료로 비교 견적을 회신해 드립니다.",
  },
  {
    icon: Sparkles,
    title: "WEB 3.0 데모",
    detail: "회원가입 전, 데모 환경에서 인트라넷 시스템을 직접 체험할 수 있습니다.",
  },
];

export default function InquiryPage() {
  return (
    <>
      <PageHero />
      <section className="bg-background py-20 md:py-28">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
            <FadeIn>
              <div className="rounded-3xl border bg-card p-7 shadow-sm md:p-10">
                <div className="mb-7">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand">
                    도입 문의 폼
                  </p>
                  <h2 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">
                    도입 상담 신청
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground md:text-base">
                    필수 항목을 작성해 주시면 담당 매니저가 곧 연락드립니다.
                  </p>
                </div>
                <InquiryForm />
              </div>
            </FadeIn>

            <FadeIn delay={0.08}>
              <aside className="space-y-5 lg:sticky lg:top-28">
                <div className="rounded-3xl border bg-primary p-7 text-primary-foreground md:p-9">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/65">
                    Direct Channel
                  </p>
                  <h3 className="mt-3 text-xl font-bold tracking-tight md:text-2xl">
                    바로 연결되는 직통 채널
                  </h3>
                  <ul className="mt-6 space-y-4">
                    {channels.map((c) => {
                      const Icon = c.icon;
                      return (
                        <li key={c.title}>
                          <a
                            href={c.href}
                            className="flex items-start gap-4 rounded-xl border border-white/10 bg-white/5 px-4 py-4 transition-colors hover:border-white/30 hover:bg-white/10"
                          >
                            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-white">
                              <Icon className="h-5 w-5" strokeWidth={1.6} />
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-medium uppercase tracking-widest text-white/55">
                                {c.title}
                              </p>
                              <p className="mt-1 truncate text-base font-semibold text-white">
                                {c.value}
                              </p>
                              <p className="mt-0.5 text-xs text-white/65">
                                {c.hint}
                              </p>
                            </div>
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div className="rounded-3xl border bg-card p-7 md:p-8">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand">
                    What You Get
                  </p>
                  <h3 className="mt-3 text-lg font-bold tracking-tight md:text-xl">
                    문의 후 받게 되는 것
                  </h3>
                  <ul className="mt-5 space-y-4">
                    {guarantees.map((g) => {
                      const Icon = g.icon;
                      return (
                        <li key={g.title} className="flex items-start gap-3">
                          <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-brand/10 text-brand">
                            <Icon className="h-4 w-4" strokeWidth={1.6} />
                          </span>
                          <div>
                            <p className="text-sm font-semibold">{g.title}</p>
                            <p className="mt-1 text-xs leading-5 text-muted-foreground">
                              {g.detail}
                            </p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </aside>
            </FadeIn>
          </div>
        </Container>
      </section>
    </>
  );
}

function PageHero() {
  return (
    <section className="bg-primary pt-32 pb-12 text-primary-foreground md:pt-40 md:pb-20">
      <Container>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/65">
          Inquiry
        </p>
        <h1 className="mt-4 text-4xl font-bold leading-[1.15] tracking-tight md:text-5xl">
          도입 문의는
          <br />
          평균 1~2영업일 내에 시작됩니다.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-white/75 md:text-lg md:leading-8">
          도입 상담 채널로 신청해 주시면 표준 계약서·단가 비교 견적·WEB 3.0
          데모를 한 번에 회신드립니다.
        </p>
      </Container>
    </section>
  );
}
