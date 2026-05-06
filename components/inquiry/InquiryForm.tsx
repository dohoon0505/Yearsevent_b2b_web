"use client";

import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  industries,
  inquirySchema,
  type InquiryInput,
} from "@/lib/validation/inquiry-schema";
import { cn } from "@/lib/utils";

const defaultValues: Partial<InquiryInput> = {
  company: "",
  manager: "",
  phone: "",
  email: "",
  monthlyVolume: "",
  message: "",
};

export function InquiryForm() {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<InquiryInput>({
    resolver: zodResolver(inquirySchema),
    defaultValues,
    mode: "onTouched",
  });

  const onSubmit = async (data: InquiryInput) => {
    await new Promise((r) => setTimeout(r, 600));
    console.log("[Years inquiry submitted]", data);
    toast.success("문의가 접수되었습니다.", {
      description: "1영업일 내 담당 매니저가 회신드립니다.",
    });
    reset(defaultValues);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <div className="grid gap-5 md:grid-cols-2">
        <Field
          label="회사명"
          required
          error={errors.company?.message}
          htmlFor="company"
        >
          <Input
            id="company"
            placeholder="(주)Years"
            autoComplete="organization"
            aria-invalid={Boolean(errors.company)}
            {...register("company")}
          />
        </Field>
        <Field
          label="담당자명"
          required
          error={errors.manager?.message}
          htmlFor="manager"
        >
          <Input
            id="manager"
            placeholder="홍길동"
            autoComplete="name"
            aria-invalid={Boolean(errors.manager)}
            {...register("manager")}
          />
        </Field>
        <Field
          label="연락처"
          required
          error={errors.phone?.message}
          htmlFor="phone"
        >
          <Input
            id="phone"
            placeholder="010-1234-5678"
            autoComplete="tel"
            inputMode="tel"
            aria-invalid={Boolean(errors.phone)}
            {...register("phone")}
          />
        </Field>
        <Field
          label="이메일"
          required
          error={errors.email?.message}
          htmlFor="email"
        >
          <Input
            id="email"
            type="email"
            placeholder="manager@company.kr"
            autoComplete="email"
            inputMode="email"
            aria-invalid={Boolean(errors.email)}
            {...register("email")}
          />
        </Field>
        <Field
          label="업종"
          required
          error={errors.industry?.message}
          htmlFor="industry"
        >
          <Controller
            control={control}
            name="industry"
            render={({ field }) => (
              <Select
                value={field.value ?? ""}
                onValueChange={field.onChange}
              >
                <SelectTrigger id="industry" aria-invalid={Boolean(errors.industry)}>
                  <SelectValue placeholder="업종을 선택해 주세요" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>
        <Field
          label="예상 월 발주량"
          error={errors.monthlyVolume?.message}
          htmlFor="monthlyVolume"
          hint="선택 사항"
        >
          <Input
            id="monthlyVolume"
            placeholder="예) 월 30건"
            {...register("monthlyVolume")}
          />
        </Field>
      </div>

      <Field
        label="문의 내용"
        required
        error={errors.message?.message}
        htmlFor="message"
      >
        <Textarea
          id="message"
          placeholder="현재 거래 형태, 도입 검토 배경, 궁금한 점을 자유롭게 작성해 주세요."
          rows={6}
          aria-invalid={Boolean(errors.message)}
          {...register("message")}
        />
      </Field>

      <div className="rounded-xl border bg-muted/30 px-5 py-4">
        <Controller
          control={control}
          name="agreement"
          render={({ field }) => (
            <label className="flex items-start gap-3 text-sm leading-6 text-foreground/85">
              <Checkbox
                checked={Boolean(field.value)}
                onCheckedChange={(v) => field.onChange(v === true)}
                aria-invalid={Boolean(errors.agreement)}
                className="mt-0.5"
              />
              <span>
                <span className="font-semibold">[필수]</span> 도입 상담 처리를
                위한 개인정보 수집·이용에 동의합니다. (수집 항목: 회사명,
                담당자명, 연락처, 이메일 / 보유 기간: 상담 종료 후 1년)
              </span>
            </label>
          )}
        />
        {errors.agreement?.message ? (
          <p className="mt-2 text-xs text-destructive">
            {errors.agreement.message}
          </p>
        ) : null}
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            접수 중...
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            도입 문의 보내기
          </>
        )}
      </Button>
    </form>
  );
}

interface FieldProps {
  label: string;
  htmlFor: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}

function Field({ label, htmlFor, required, hint, error, children }: FieldProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={htmlFor} className="text-sm">
          {label}
          {required ? (
            <span className="ml-1 text-destructive" aria-hidden>
              *
            </span>
          ) : null}
        </Label>
        {hint ? (
          <span className="text-xs text-muted-foreground">{hint}</span>
        ) : null}
      </div>
      {children}
      <p
        className={cn(
          "text-xs leading-5 text-destructive",
          error ? "block" : "hidden",
        )}
        role={error ? "alert" : undefined}
      >
        {error}
      </p>
    </div>
  );
}
