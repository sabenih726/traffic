import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // Forward emergency request ke traffic-status endpoint
    const response = await fetch(`${request.nextUrl.origin}/api/traffic-status`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ mode: "manual", color: "red" }),
    })

    const data = await response.json()

    return NextResponse.json({
      success: true,
      status: data.status,
      message: "🚨 Emergency mode activated - All RED",
    })
  } catch (error) {
    console.error("Error in emergency:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Emergency activation failed",
      },
      { status: 500 },
    )
  }
}
