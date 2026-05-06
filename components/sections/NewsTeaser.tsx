import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { FadeIn } from "@/components/shared/FadeIn";
import { SectionHeading } from "@/components/shared/SectionHeading";

const placeholders = [
  {
    tag: "공지",
    title: "2026년 명절 단가 안내 (예정)",
    summary: "설·추석·연말 시즌 대량 주문에 대한 표준 단가 가이드.",
  },
  {
    tag: "보도자료",
    title: "Years, 나라장터 입찰 낙찰 (예정)",
    summary: "공공기관 경조사 화훼 부문 정식 조달 계약 체결 소식.",
  },
  {
    tag: "리포트",
    title: "꽃배달 산업 5단계 유통구조 분석 (예정)",
    summary: "왜 80%의 업체가 중간마진 대행사인가 — 시장 구조 리포트.",
  },
];

export function NewsTeaser() {
  return (
    <section className="bg-background py-24 md:py-32">
      <Container>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow="News & PR"
            title={
              <>
                Years의 소식과
                <br />
                업계 인사이트
              </>
            }
            description="공식 자료 · 단가 가이드 · 산업 리포트를 정리해 발행합니다. 정식 콘텐츠는 곧 공개됩니다."
            className="md:max-w-xl"
          />
          <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Coming Soon
          </span>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {placeholders.map((item, idx) => (
            <FadeIn key={item.title} delay={idx * 0.05}>
              <article className="group flex h-full flex-col rounded-2xl border bg-card p-6 transition-colors hover:border-brand/40 md:p-7">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-brand/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-brand">
                    {item.tag}
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
                <h3 className="mt-7 text-lg font-bold leading-snug tracking-tight md:text-xl">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {item.summary}
                </p>
                <div className="mt-auto pt-8 text-xs text-muted-foreground/80">
                  준비 중 · 발행 예정
                </div>
              </article>
            </FadeIn>
          ))}
        </div>
      </Container>
    </section>
  );
}
