import { z } from "zod";

export const industries = [
  { value: "법무", label: "법무법인" },
  { value: "세무", label: "세무법인" },
  { value: "제조", label: "제조업" },
  { value: "도소매", label: "도소매·유통" },
  { value: "기관", label: "기관·단체" },
  { value: "기타", label: "기타" },
] as const;

const koreanPhoneRegex = /^(0\d{1,2})-?\d{3,4}-?\d{4}$/;

export const inquirySchema = z.object({
  company: z
    .string({ required_error: "회사명을 입력해 주세요." })
    .trim()
    .min(2, "회사명은 2자 이상 입력해 주세요."),
  manager: z
    .string({ required_error: "담당자명을 입력해 주세요." })
    .trim()
    .min(2, "담당자명은 2자 이상 입력해 주세요."),
  phone: z
    .string({ required_error: "연락처를 입력해 주세요." })
    .trim()
    .regex(koreanPhoneRegex, "연락처 형식이 올바르지 않습니다. 예) 02-1234-5678 또는 010-1234-5678"),
  email: z
    .string({ required_error: "이메일을 입력해 주세요." })
    .trim()
    .email("이메일 형식이 올바르지 않습니다."),
  industry: z.enum(
    industries.map((i) => i.value) as [string, ...string[]],
    { required_error: "업종을 선택해 주세요." },
  ),
  monthlyVolume: z.string().trim().optional(),
  message: z
    .string({ required_error: "문의 내용을 입력해 주세요." })
    .trim()
    .min(10, "문의 내용을 10자 이상 입력해 주세요."),
  agreement: z.literal(true, {
    errorMap: () => ({ message: "개인정보 수집·이용에 동의해 주세요." }),
  }),
});

export type InquiryInput = z.infer<typeof inquirySchema>;
