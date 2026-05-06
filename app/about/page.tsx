import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MapPin, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/shared/Container";
import { FadeIn } from "@/components/shared/FadeIn";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Achievements } from "@/components/sections/Achievements";
import { targetIndustries } from "@/lib/data/partners";

export const metadata: Metadata = {
  title: "회사소개",
  description:
    "Years는 10년 동안 온라인과 오프라인을 직접 연결하며 화훼업계를 활성화해 온 B2B 꽃배달 전문 기업입니다.",
};

const milestones = [
  {
    year: "2016",
    title: "Years 사업 개시",
    detail: "수도권 화훼 실무자 네트워크 기반으로 B2B 경조사 전담 서비스 시작.",
  },
  {
    year: "2019",
    title: "전국 직배송 망 구축",
    detail: "도서산간 포함 전국 단일 배송 단가 정책 정착.",
  },
  {
    year: "2022",
    title: "WEB 3.0 인트라넷 출시",
    detail: "발송인 프로필·자동 정산·다방향 메시징을 통합한 자체 시스템 공개.",
  },
  {
    year: "2024",
    title: "AI 간편 발주 시스템 도입",
    detail: "부고·청첩 텍스트·이미지 자동 분석으로 발주 시간 80% 단축.",
  },
  {
    year: "2026",
    title: "공공·교육 부문 확장",
    detail: "대구 가톨릭대학교 공식 협력 · 나라장터 입찰 낙찰.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHero />

      <section className="bg-background py-24 md:py-32">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
            <FadeIn>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
                Brand Story
              </p>
              <h2 className="mt-3 text-3xl font-bold leading-tight tracking-tight md:text-4xl lg:text-5xl">
                중간 대행이 아닌
                <br />
                직접 운영하는 사람들
              </h2>
            </FadeIn>
            <FadeIn delay={0.05}>
              <div className="space-y-5 text-base leading-8 text-foreground/80 md:text-lg md:leading-[1.85]">
                <p>
                  Years는 2016년, 화훼 실무 현장에서 출발했습니다. 2023년 언택트
                  시대 이후 마케팅 기반의 중간 마진 업체가 폭증하며 화훼업계가
                  무너져 가는 현실을 가까이서 보았고, &ldquo;진짜 실무자가
                  책임지는 B2B 꽃배달이 필요하다&rdquo;는 문제의식에서 사업을
                  본격화했습니다.
                </p>
                <p>
                  10년 동안 우리는 1차 대대행사 · 2차 대행사 · 3차 중개자가
                  편취하는 마진 구조 대신, 실제 유통처와 직접 소통하며
                  주문을 책임지는 단계에서만 일했습니다. 그 결과 시장 평균보다
                  35% 낮은 단가, 50만원의 책임 배상, 그리고 자동 정산 시스템을
                  표준으로 만들었습니다.
                </p>
                <p>
                  Years는 매출이 아니라{" "}
                  <span className="font-semibold text-foreground">
                    화훼업계의 정직한 가격 구조와 파트너 기업의 신뢰
                  </span>
                  를 측정 지표로 삼습니다.
                </p>
              </div>
            </FadeIn>
          </div>
        </Container>
      </section>

      <section className="bg-muted/40 py-24 md:py-32">
        <Container>
          <SectionHeading
            eyebrow="Who We Help"
            title="경조사가 잦은 조직, 누구든."
            description="법무·세무 전문 서비스부터 제조·유통·기관·단체까지. 업종별 발주 패턴에 맞춘 전담 운영을 제공합니다."
          />
          <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {targetIndustries.map((industry, idx) => (
              <FadeIn key={industry.title} delay={idx * 0.04}>
                <article className="h-full rounded-2xl border bg-card p-7">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
                    Industry {String(idx + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-3 text-xl font-bold tracking-tight">
                    {industry.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    {industry.description}
                  </p>
                </article>
              </FadeIn>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-background py-24 md:py-32">
        <Container>
          <SectionHeading
            eyebrow="History"
            title={
              <>
                10년의 운영
                <br />
                <span className="text-brand">검증된 흐름</span>
              </>
            }
          />
          <ol className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {milestones.map((m, idx) => (
              <FadeIn key={m.year} delay={idx * 0.04}>
                <li className="rounded-2xl border bg-card p-7">
                  <p className="text-3xl font-bold tracking-tight text-brand md:text-4xl">
                    {m.year}
                  </p>
                  <h3 className="mt-3 text-lg font-bold tracking-tight">
                    {m.title}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    {m.detail}
                  </p>
                </li>
              </FadeIn>
            ))}
          </ol>
        </Container>
      </section>

      <Achievements id="achievements" />

      <section className="bg-muted/40 py-24 md:py-32">
        <Container>
          <SectionHeading
            eyebrow="Contact"
            title="언제든 편하게 연락 주세요."
            description="도입 상담은 평일 오전 9시부터 오후 6시까지 운영합니다. 업무 시간 외 문의는 이메일로 회신드립니다."
          />
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            <ContactInfoCard
              icon={MapPin}
              title="본사"
              value="대구광역시 ___"
              hint="실 주소는 도입 계약 시 공유"
            />
            <ContactInfoCard
              icon={Phone}
              title="전화"
              value="02-0000-0000"
              hint="평일 09:00 – 18:00"
            />
            <ContactInfoCard
              icon={Mail}
              title="이메일"
              value="partner@years.kr"
              hint="24시간 접수, 1영업일 내 회신"
            />
          </div>
          <div className="mt-12 flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <Link href="/inquiry">
                도입 문의하기 <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/service">서비스 살펴보기</Link>
            </Button>
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
          About Years
        </p>
        <h1 className="mt-4 text-4xl font-bold leading-[1.15] tracking-tight md:text-6xl">
          정직한 꽃배달.
          <br />
          그것이 Years의 시작입니다.
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-7 text-white/75 md:text-lg md:leading-8">
          중간에서 마진을 편취하는 기업이 아닌, 10년 동안 온라인과 오프라인을
          직접 연결하고 화훼업계를 활성화해 온 전문 꽃배달 기업.
        </p>
      </Container>
    </section>
  );
}

function ContactInfoCard({
  icon: Icon,
  title,
  value,
  hint,
}: {
  icon: typeof MapPin;
  title: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border bg-card p-7">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 text-brand">
        <Icon className="h-5 w-5" strokeWidth={1.6} />
      </span>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        {title}
      </p>
      <p className="mt-2 text-lg font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{hint}</p>
    </div>
  );
}
