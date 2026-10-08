import { NextResponse } from "next/server";

function getScriptUrl() {
  return (
    process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL ||
    process.env.GOOGLE_SCRIPT_URL ||
    ""
  ).trim();
}

// GET: 일기 목록 또는 특정 일기 조회
export async function GET(request: Request) {
  try {
    const scriptUrl = getScriptUrl();
    if (!scriptUrl) {
      return NextResponse.json(
        {
          error:
            ".env.local에 NEXT_PUBLIC_GOOGLE_SCRIPT_URL 설정이 필요합니다.",
        },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || "read";
    const timestamp = searchParams.get("timestamp");

    let targetUrl = `${scriptUrl}?action=${encodeURIComponent(action)}`;
    if (timestamp) {
      targetUrl += `&timestamp=${encodeURIComponent(timestamp)}`;
    }

    const res = await fetch(targetUrl, {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
      redirect: "follow",
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Google Script 요청 실패: HTTP ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Diary API GET error:", error);
    return NextResponse.json(
      { error: error.message || "서버 에러가 발생했습니다." },
      { status: 500 }
    );
  }
}

// POST: 일기 생성(create), 수정(update), 삭제(delete)
export async function POST(request: Request) {
  try {
    const scriptUrl = getScriptUrl();
    if (!scriptUrl) {
      return NextResponse.json(
        {
          error:
            ".env.local에 NEXT_PUBLIC_GOOGLE_SCRIPT_URL 설정이 필요합니다.",
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    const res = await fetch(scriptUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      redirect: "follow",
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Google Script 요청 실패: HTTP ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Diary API POST error:", error);
    return NextResponse.json(
      { error: error.message || "서버 에러가 발생했습니다." },
      { status: 500 }
    );
  }
}
