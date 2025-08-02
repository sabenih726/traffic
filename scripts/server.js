const express = require("express")
const cors = require("cors")
const app = express()
const port = 3000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.static("public"))

// Status traffic light global
const trafficStatus = {
  mode: "off", // 'manual', 'auto', 'off'
  color: "off", // 'red', 'yellow', 'green', 'off'
  autoStep: 0, // untuk tracking step auto mode
  lastUpdate: new Date(),
  settings: {
    redDuration: 5000,
    yellowDuration: 2000,
    greenDuration: 5000,
  },
}

// Auto mode timer
let autoTimer = null

// Fungsi untuk menjalankan mode otomatis
function runAutoMode() {
  if (trafficStatus.mode !== "auto") return

  const sequence = ["red", "green", "yellow"]
  const timings = [
    trafficStatus.settings.redDuration,
    trafficStatus.settings.greenDuration,
    trafficStatus.settings.yellowDuration,
  ]

  trafficStatus.color = sequence[trafficStatus.autoStep]
  trafficStatus.lastUpdate = new Date()

  console.log(`🚦 Auto mode: ${trafficStatus.color.toUpperCase()} for ${timings[trafficStatus.autoStep]}ms`)

  autoTimer = setTimeout(() => {
    trafficStatus.autoStep = (trafficStatus.autoStep + 1) % sequence.length
    runAutoMode()
  }, timings[trafficStatus.autoStep])
}

// Route untuk mendapatkan status traffic light (digunakan oleh Arduino)
app.get("/traffic-status", (req, res) => {
  console.log(`Arduino meminta status: ${JSON.stringify(trafficStatus)}`)
  res.json(trafficStatus)
})

// Route untuk kontrol manual traffic light
app.post("/control-traffic", (req, res) => {
  const { mode, color } = req.body

  // Clear auto timer jika ada
  if (autoTimer) {
    clearTimeout(autoTimer)
    autoTimer = null
  }

  if (mode === "manual" && ["red", "yellow", "green", "off"].includes(color)) {
    trafficStatus.mode = "manual"
    trafficStatus.color = color
    trafficStatus.lastUpdate = new Date()

    console.log(`🚦 Manual mode: ${color.toUpperCase()}`)
    res.json({
      success: true,
      status: trafficStatus,
      message: `Traffic light diatur ke ${color.toUpperCase()}`,
    })
  } else if (mode === "auto") {
    trafficStatus.mode = "auto"
    trafficStatus.autoStep = 0
    trafficStatus.lastUpdate = new Date()

    // Mulai auto mode
    runAutoMode()

    console.log("🔄 Auto mode activated")
    res.json({
      success: true,
      status: trafficStatus,
      message: "Mode otomatis diaktifkan",
    })
  } else if (mode === "off") {
    trafficStatus.mode = "off"
    trafficStatus.color = "off"
    trafficStatus.lastUpdate = new Date()

    console.log("⚫ All lights OFF")
    res.json({
      success: true,
      status: trafficStatus,
      message: "Semua lampu dimatikan",
    })
  } else {
    res.status(400).json({
      success: false,
      message: "Invalid mode atau color. Mode: manual/auto/off, Color: red/yellow/green/off",
    })
  }
})

// Route untuk update settings
app.post("/update-settings", (req, res) => {
  const { redDuration, yellowDuration, greenDuration } = req.body

  if (redDuration) trafficStatus.settings.redDuration = redDuration * 1000
  if (yellowDuration) trafficStatus.settings.yellowDuration = yellowDuration * 1000
  if (greenDuration) trafficStatus.settings.greenDuration = greenDuration * 1000

  console.log("⚙️ Settings updated:", trafficStatus.settings)
  res.json({
    success: true,
    settings: trafficStatus.settings,
    message: "Settings berhasil diperbarui",
  })
})

// Route untuk mendapatkan status saat ini (untuk web interface)
app.get("/current-traffic-status", (req, res) => {
  res.json(trafficStatus)
})

// Route untuk traffic light patterns/presets
app.get("/traffic-patterns", (req, res) => {
  const patterns = {
    normal: {
      name: "Normal Traffic",
      sequence: ["red", "green", "yellow"],
      timing: [5000, 5000, 2000],
    },
    emergency: {
      name: "Emergency Mode",
      sequence: ["red"],
      timing: [1000],
    },
    caution: {
      name: "Caution Mode",
      sequence: ["yellow"],
      timing: [1000],
    },
    pedestrian: {
      name: "Pedestrian Crossing",
      sequence: ["red", "green", "yellow"],
      timing: [8000, 3000, 2000],
    },
  }
  res.json(patterns)
})

// Route untuk statistics/logging
app.get("/traffic-stats", (req, res) => {
  res.json({
    currentStatus: trafficStatus,
    uptime: process.uptime(),
    lastUpdate: trafficStatus.lastUpdate,
    serverTime: new Date(),
    autoModeActive: trafficStatus.mode === "auto",
    totalModeChanges: 0, // Could be tracked with a counter
  })
})

// Endpoint untuk emergency override
app.post("/emergency", (req, res) => {
  // Clear auto timer
  if (autoTimer) {
    clearTimeout(autoTimer)
    autoTimer = null
  }

  trafficStatus.mode = "manual"
  trafficStatus.color = "red"
  trafficStatus.lastUpdate = new Date()

  console.log("🚨 EMERGENCY OVERRIDE - ALL RED")
  res.json({
    success: true,
    status: trafficStatus,
    message: "Emergency mode activated - All RED",
  })
})

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date(),
    uptime: process.uptime(),
    trafficStatus: trafficStatus,
  })
})

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: "Terjadi kesalahan server" })
})

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down server...")
  if (autoTimer) {
    clearTimeout(autoTimer)
  }
  process.exit(0)
})

// Start server
app.listen(port, "0.0.0.0", () => {
  console.log(`🚦 Traffic Light Server berjalan di http://localhost:${port}`)
  console.log(`📱 Akses dari perangkat lain: http://[IP-KOMPUTER]:${port}`)
  console.log(`🔗 Arduino endpoint: http://[IP-KOMPUTER]:${port}/traffic-status`)
  console.log(`🚦 Status saat ini: ${JSON.stringify(trafficStatus)}`)
  console.log(`\n🎮 Available Controls:`)
  console.log(`   Manual: POST /control-traffic {"mode":"manual","color":"red/yellow/green"}`)
  console.log(`   Auto:   POST /control-traffic {"mode":"auto"}`)
  console.log(`   Off:    POST /control-traffic {"mode":"off"}`)
  console.log(`   Emergency: POST /emergency`)
  console.log(`   Settings: POST /update-settings {"redDuration":5,"yellowDuration":2,"greenDuration":5}`)
})
