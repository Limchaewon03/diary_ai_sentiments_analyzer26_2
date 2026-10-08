import { NextRequest, NextResponse } from "next/server";
import { generateObject } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";

const SentimentAnalysisSchema = z.object({
  dominantSentiment: z.enum(["joy", "calm", "flutter", "sadness", "stress"]),
  dominantSentimentLabel: z.string().describe("가장 지배적인 감정 한국어 명칭 (예: 기쁨, 차분, 설렘, 슬픔, 스트레스)"),
  sentimentPercentages: z.object({
    joy: z.number().describe("기쁨 백분율 (0-100)"),
    calm: z.number().describe("차분 백분율 (0-100)"),
    flutter: z.number().describe("설렘 백분율 (0-100)"),
    sadness: z.number().describe("슬픔 백분율 (0-100)"),
    stress: z.number().describe("스트레스 백분율 (0-100)"),
  }),
  confidence: z.number().describe("AI 분석 신뢰도 백분율 (예: 98.4)"),
  balanceTitle: z.string().describe("감정 균형 타이틀 (예: 평온 및 자기 치유 밸런스)"),
  positivityScore: z.number().describe("전반적인 긍정 지수 (0-100)"),
  emotionalStability: z.string().describe("기분 안정성 평가 (예: 매우 높음, 양호, 세심한 보살핌 필요 등)"),
  recoveryIndex: z.string().describe("피로 회복/심리 회복 지수 (예: +15pt, +20pt, -5pt 등)"),
  keywords: z.array(z.string()).min(2).max(5).describe("일기에서 추출된 핵심 감정 키워드 4개 내외"),
  empathyNote: z.string().describe("Gemini가 일기 작성자에게 건네는 따뜻하고 다정한 공감 노트 (3~4문장)"),
  mindfulQuote: z.string().describe("일기 내용과 어우러지는 위로와 마음챙김 명언 인용구"),
  quoteAuthor: z.string().describe("인용구 출처 또는 작가 (예: 마음 챙김 가이드 중)"),
});

export async function POST(req: NextRequest) {
  try {
    const { title, content, customApiKey } = await req.json();

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json(
        { error: "일기 내용을 입력해주세요." },
        { status: 400 }
      );
    }

    const apiKey = customApiKey?.trim() || process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    // 목업(Mock-up) 데이터 제거: API 키가 없으면 에러 응답 반환
    if (!apiKey) {
      return NextResponse.json(
        {
          error: "Gemini API 키가 설정되지 않았습니다. 상단 우측의 열쇠(🔑) 아이콘을 눌러 API 키를 입력하거나 .env.local 환경 변수를 등록해주세요.",
        },
        { status: 401 }
      );
    }

    const google = createGoogleGenerativeAI({
      apiKey: apiKey,
    });

    const promptText = `
너는 일기를 깊이 있게 공감하고 따뜻한 위로와 심리적 통찰을 제공하는 전문 마음챙김 AI 카운슬러 'Gemini'이다.
사용자가 작성한 아래의 감정 일기(제목 및 본문)를 꼼꼼히 읽고 감성을 심층 분석하여 지정된 스키마에 맞춰 응답해줘.

일기 제목: ${title || "제목 없음"}
일기 본문:
${content}

[분석 가이드]
1. 5가지 기본 감정 분류:
   - 'joy': 기쁨, 감사, 환희, 행복, 성취감
   - 'calm': 차분, 평온, 여유, 편안함, 사색
   - 'flutter': 설렘, 희망, 기대감, 낭만
   - 'sadness': 슬픔, 공허함, 우울, 아쉬움, 눈물
   - 'stress': 스트레스, 분노, 불안, 긴장, 지침
2. 가장 높은 비율의 감성을 dominantSentiment로 지정하고 5개 감성의 백분율 합은 100이 되도록 해줘.
3. empathyNote는 친구처럼 따뜻하면서도 품격 있는 문체(~했어요, ~응원합니다)로 정성껏 써줘.
4. mindfulQuote는 일기 분위기를 포근하게 안아주는 멋진 한 줄 문장으로 제시해줘.
    `;

    let result;
    try {
      result = await generateObject({
        model: google("gemini-3.8-flash"),
        schema: SentimentAnalysisSchema,
        prompt: promptText,
      });
    } catch (primaryErr: any) {
      console.warn("gemini-3.8-flash 요청 실패, gemini-3.5-flash로 대체 시도합니다:", primaryErr?.message);
      // gemini-3.8-flash 과부하(503) 시 안정적인 gemini-3.5-flash로 자동 폴백
      result = await generateObject({
        model: google("gemini-3.5-flash"),
        schema: SentimentAnalysisSchema,
        prompt: promptText,
      });
    }

    return NextResponse.json({
      data: result.object,
    });
  } catch (error: any) {
    console.error("Sentiment analysis error:", error);
    return NextResponse.json(
      { error: error?.message || "Gemini 감성 분석 중 오류가 발생했습니다. API 키 및 네트워크를 확인해주세요." },
      { status: 500 }
    );
  }
}
