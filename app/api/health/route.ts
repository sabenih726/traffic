import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Get current status
    const statusResponse = await fetch(`${request.nextUrl.origin}/api/traffic-status`)
    const trafficStatus = await statusResponse.json()

    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      trafficStatus: trafficStatus,
    })
  } catch (error) {
    console.error("Health check error:", error)
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
