import { type NextRequest, NextResponse } from "next/server"

// Import status dari traffic-status route (dalam implementasi nyata, gunakan database atau state management)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Forward request ke traffic-status endpoint
    const response = await fetch(`${request.nextUrl.origin}/api/traffic-status`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in control-traffic:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Server error",
      },
      { status: 500 },
    )
  }
}
