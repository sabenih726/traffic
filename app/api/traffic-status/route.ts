import { type NextRequest, NextResponse } from "next/server"

// Global state untuk traffic light
const trafficStatus = {
  mode: "off",
  color: "off",
  autoStep: 0,
  lastUpdate: new Date().toISOString(),
  settings: {
    redDuration: 5000,
    yellowDuration: 2000,
    greenDuration: 5000,
  },
}

// Auto mode timer
let autoTimer: NodeJS.Timeout | null = null

// Fungsi untuk menjalankan mode otomatis
function runAutoMode() {
  if (trafficStatus.mode !== "auto") return

  const sequence = ["red", "green", "yellow"]
  const timings = [
    trafficStatus.settings.redDuration,
    trafficStatus.settings.greenDuration,
    trafficStatus.settings.yellowDuration,
  ]

  trafficStatus.color = sequence[trafficStatus.autoStep] as any
  trafficStatus.lastUpdate = new Date().toISOString()

  console.log(`🚦 Auto mode: ${trafficStatus.color.toUpperCase()} for ${timings[trafficStatus.autoStep]}ms`)

  autoTimer = setTimeout(() => {
    trafficStatus.autoStep = (trafficStatus.autoStep + 1) % sequence.length
    runAutoMode()
  }, timings[trafficStatus.autoStep])
}

export async function GET(request: NextRequest) {
  // Log request untuk debugging
  console.log("Arduino requesting status:", trafficStatus)

  return NextResponse.json(trafficStatus, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { mode, color } = body

    // Clear auto timer jika ada
    if (autoTimer) {
      clearTimeout(autoTimer)
      autoTimer = null
    }

    if (mode === "manual" && ["red", "yellow", "green", "off"].includes(color)) {
      trafficStatus.mode = "manual"
      trafficStatus.color = color
      trafficStatus.lastUpdate = new Date().toISOString()

      console.log(`🚦 Manual mode: ${color.toUpperCase()}`)
      return NextResponse.json({
        success: true,
        status: trafficStatus,
        message: `Traffic light diatur ke ${color.toUpperCase()}`,
      })
    } else if (mode === "auto") {
      trafficStatus.mode = "auto"
      trafficStatus.autoStep = 0
      trafficStatus.lastUpdate = new Date().toISOString()

      // Mulai auto mode
      runAutoMode()

      console.log("🔄 Auto mode activated")
      return NextResponse.json({
        success: true,
        status: trafficStatus,
        message: "Mode otomatis diaktifkan",
      })
    } else if (mode === "off") {
      trafficStatus.mode = "off"
      trafficStatus.color = "off"
      trafficStatus.lastUpdate = new Date().toISOString()

      console.log("⚫ All lights OFF")
      return NextResponse.json({
        success: true,
        status: trafficStatus,
        message: "Semua lampu dimatikan",
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid mode atau color",
        },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("Error processing request:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Server error",
      },
      { status: 500 },
    )
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
