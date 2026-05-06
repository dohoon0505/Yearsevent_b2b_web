import { AlertTriangle, Star, ChevronRight } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { FadeIn } from "@/components/shared/FadeIn";
import { Badge } from "@/components/ui/badge";
import { agencyTiers, agencyHazards } from "@/lib/data/agency-tiers";
import { cn } from "@/lib/utils";

export function AgencyWarning() {
  return (
    <section className="relative isolate overflow-hidden bg-zinc-950 text-white">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,oklch(0.32_0.16_25/0.55)_0%,transparent_70%)]"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-warning/60 to-transparent"
      />

      <Container className="py-24 md:py-32">
        <FadeIn>
          <Badge
            variant="warning"
            className="mb-5 inline-flex items-center gap-1.5 px-3 py-1 text-[11px]"
          >
            <AlertTriangle className="h-3.5 w-3.5" strokeWidth={2.4} />
            Industry Warning
          </Badge>
          <h2 className="text-3xl font-bold leading-[1.2] tracking-tight md:text-5xl lg:text-6xl">
            🚨 꽃배달 대행사를
            <br />
            <span className="text-warning">조심하세요.</span>
          </h2>
          <p className="mt-6 max-w-3xl text-base leading-7 text-white/70 md:text-lg md:leading-8">
            2023년 언택트 시대 이후 꽃배달 업체가 기하급수적으로 늘어났습니다.
            이 중 80%는 마케팅 기반의 중간 마진 업체. 무책임한 대행 구조가
            화훼업계를 무너뜨리고 있습니다.
          </p>
        </FadeIn>

        {/* Hazards */}
        <FadeIn delay={0.1}>
          <div className="mt-12 grid gap-3 md:grid-cols-2">
            {agencyHazards.map((hazard, idx) => (
              <div
                key={hazard}
                className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-sm"
              >
                <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-warning/20 text-warning text-xs font-bold">
                  {idx + 1}
                </span>
                <p className="text-sm leading-6 text-white/85 md:text-base">
                  {hazard}
                </p>
              </div>
            ))}
          </div>
        </FadeIn>

        {/* 5-tier diagram */}
        <FadeIn delay={0.15}>
          <div className="mt-20">
            <div className="flex items-center gap-3 text-warning">
              <span className="h-px w-10 bg-warning/60" />
              <p className="text-xs font-semibold uppercase tracking-[0.25em]">
                5 Tier Distribution
              </p>
            </div>
            <h3 className="mt-3 text-2xl font-bold leading-snug md:text-3xl lg:text-4xl">
              지금 이용하시는 업체가
              <br className="hidden md:block" />
              혹시, 대행사는 아니신가요?
            </h3>

            <ol className="mt-10 space-y-3">
              {agencyTiers.map((tier, idx) => (
                <li
                  key={tier.label}
                  className={cn(
                    "group relative flex flex-col gap-3 rounded-2xl border px-5 py-5 transition-all md:flex-row md:items-center md:gap-6 md:px-7 md:py-6",
                    tier.isUs
                      ? "border-brand bg-brand/15 shadow-[0_0_0_1px_oklch(0.62_0.18_250)]"
                      : "border-white/10 bg-white/[0.03]",
                  )}
                >
                  <div className="flex items-center gap-4 md:w-72">
                    <span
                      className={cn(
                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-base font-bold tracking-tight",
                        tier.isUs
                          ? "bg-brand text-brand-foreground"
                          : "bg-white/10 text-white/80",
                      )}
                    >
                      {tier.isUs ? (
                        <Star className="h-5 w-5 fill-current" />
                      ) : (
                        tier.step
                      )}
                    </span>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-widest text-white/50">
                        {tier.step} 단계
                      </p>
                      <div className="mt-0.5 flex items-center gap-2">
                        <p
                          className={cn(
                            "text-lg font-bold md:text-xl",
                            tier.isUs ? "text-white" : "text-white/90",
                          )}
                        >
                          {tier.label}
                        </p>
                        {tier.isUs ? (
                          <Badge variant="brand" className="text-[10px]">
                            자사
                          </Badge>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  <p className="flex-1 text-sm leading-6 text-white/70 md:text-base md:leading-7">
                    {tier.detail}
                  </p>
                  <span
                    className={cn(
                      "inline-flex items-center self-start rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider md:self-auto",
                      tier.takesMargin
                        ? "bg-warning/15 text-warning"
                        : tier.isUs
                          ? "bg-white text-brand"
                          : "bg-white/10 text-white/70",
                    )}
                  >
                    {tier.takesMargin
                      ? "중간 마진 수취"
                      : tier.isUs
                        ? "직접 운영"
                        : "실제 제작·배송"}
                  </span>
                  {idx < agencyTiers.length - 1 ? (
                    <ChevronRight
                      aria-hidden
                      className="absolute -bottom-3 left-1/2 hidden h-5 w-5 -translate-x-1/2 rotate-90 text-white/30 md:block"
                    />
                  ) : null}
                </li>
              ))}
            </ol>

            <div className="mt-12 rounded-2xl border border-white/10 bg-white/[0.03] p-7 md:p-9">
              <p className="text-base leading-8 text-white/85 md:text-lg md:leading-9">
                Years는 중간에서 마진을 편취하는 기업이 아닌,
                <br />
                <span className="font-bold text-white">
                  10년 동안 온라인과 오프라인을 직접 연결하고
                  <br className="hidden md:block" />
                  화훼업계를 활성화해 온 전문 꽃배달 기업
                </span>
                입니다.
              </p>
            </div>
          </div>
        </FadeIn>
      </Container>
    </section>
  );
}
