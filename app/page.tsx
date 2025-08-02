"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Circle, Power, RotateCcw, AlertTriangle, Activity, Wifi } from "lucide-react"

interface TrafficStatus {
  mode: "manual" | "auto" | "off"
  color: "red" | "yellow" | "green" | "off"
  autoStep: number
  lastUpdate: string
}

interface TrafficSettings {
  redDuration: number
  yellowDuration: number
  greenDuration: number
  autoRefresh: boolean
}

export default function TrafficLightController() {
  const [status, setStatus] = useState<TrafficStatus>({
    mode: "off",
    color: "off",
    autoStep: 0,
    lastUpdate: new Date().toISOString(),
  })

  const [settings, setSettings] = useState<TrafficSettings>({
    redDuration: 5,
    yellowDuration: 2,
    greenDuration: 5,
    autoRefresh: true,
  })

  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null)
  const [isConnected, setIsConnected] = useState(true)
  const [activeTab, setActiveTab] = useState("manual")

  // Get current status from API
  const getCurrentStatus = async () => {
    try {
      const response = await fetch("/api/traffic-status")
      const data = await response.json()
      setStatus(data)
      setIsConnected(true)
    } catch (error) {
      setIsConnected(false)
      showMessage("Gagal menghubungi server", "error")
    }
  }

  // Auto refresh status
  useEffect(() => {
    getCurrentStatus() // Initial load

    const interval = setInterval(() => {
      if (settings.autoRefresh) {
        getCurrentStatus()
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [settings.autoRefresh])

  const controlTraffic = async (mode: string, color?: string) => {
    if (isLoading) return

    setIsLoading(true)

    try {
      const body = color ? { mode, color } : { mode }

      const response = await fetch("/api/control-traffic", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (data.success) {
        setStatus(data.status)
        showMessage(data.message, "success")
      } else {
        showMessage(data.message, "error")
      }
    } catch (error) {
      showMessage("Gagal menghubungi server", "error")
    } finally {
      setIsLoading(false)
    }
  }

  const emergencyStop = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/emergency", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (data.success) {
        setStatus(data.status)
        showMessage(data.message, "error")
      } else {
        showMessage(data.message, "error")
      }
    } catch (error) {
      showMessage("Gagal mengaktifkan emergency stop", "error")
    } finally {
      setIsLoading(false)
    }
  }

  const showMessage = (text: string, type: "success" | "error") => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 4000)
  }

  const getLightClass = (lightColor: string) => {
    if (status.color === lightColor) {
      return `w-20 h-20 rounded-full border-4 border-gray-700 ${
        lightColor === "red"
          ? "bg-red-500 shadow-red-500/50 shadow-2xl animate-pulse"
          : lightColor === "yellow"
            ? "bg-yellow-500 shadow-yellow-500/50 shadow-2xl animate-pulse"
            : "bg-green-500 shadow-green-500/50 shadow-2xl animate-pulse"
      }`
    }
    return "w-20 h-20 rounded-full border-4 border-gray-700 bg-gray-600"
  }

  const updateSetting = (key: keyof TrafficSettings, value: number | boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card className="bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3">
              🚦 Traffic Light Controller
            </CardTitle>
            <CardDescription className="text-lg">Wemos D1 R2 - LED 8mm 5V Controller</CardDescription>
            <div className="flex items-center justify-center gap-4 mt-4">
              <Badge variant={isConnected ? "default" : "destructive"} className="flex items-center gap-2">
                <Wifi className="w-4 h-4" />
                {isConnected ? "Connected" : "Disconnected"}
              </Badge>
              <Badge variant={status.mode === "auto" ? "default" : "secondary"} className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                {status.mode.toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Traffic Light Display */}
          <Card className="bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-center">Traffic Light Status</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-6">
              {/* Traffic Light Visual */}
              <div className="bg-gray-800 rounded-3xl p-8 shadow-2xl">
                <div className="flex flex-col items-center space-y-6">
                  <div className={getLightClass("red")} />
                  <div className={getLightClass("yellow")} />
                  <div className={getLightClass("green")} />
                </div>
              </div>

              {/* Status Info */}
              <div className="w-full space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-semibold">Mode:</span>
                  <Badge variant="outline">{status.mode.toUpperCase()}</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-semibold">Current Light:</span>
                  <Badge variant="outline">{status.color.toUpperCase()}</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-semibold">Last Update:</span>
                  <span className="text-sm text-gray-600">
                    {new Date(status.lastUpdate).toLocaleTimeString("id-ID")}
                  </span>
                </div>
              </div>

              {status.mode === "auto" && (
                <Badge className="w-full justify-center py-2 animate-pulse">🔄 MODE OTOMATIS AKTIF</Badge>
              )}
            </CardContent>
          </Card>

          {/* Controls */}
          <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              {["manual", "auto", "settings"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === "manual" && (
              <Card>
                <CardHeader>
                  <CardTitle>Manual Control</CardTitle>
                  <CardDescription>Control individual lights manually</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    <Button
                      onClick={() => controlTraffic("manual", "red")}
                      disabled={isLoading}
                      className="bg-red-500 hover:bg-red-600 text-white py-3"
                    >
                      <Circle className="w-4 h-4 mr-2 fill-current" />🔴 MERAH
                    </Button>
                    <Button
                      onClick={() => controlTraffic("manual", "yellow")}
                      disabled={isLoading}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white py-3"
                    >
                      <Circle className="w-4 h-4 mr-2 fill-current" />🟡 KUNING
                    </Button>
                    <Button
                      onClick={() => controlTraffic("manual", "green")}
                      disabled={isLoading}
                      className="bg-green-500 hover:bg-green-600 text-white py-3"
                    >
                      <Circle className="w-4 h-4 mr-2 fill-current" />🟢 HIJAU
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "auto" && (
              <Card>
                <CardHeader>
                  <CardTitle>Automatic Mode</CardTitle>
                  <CardDescription>Automated traffic light sequence</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    onClick={() => controlTraffic("auto")}
                    disabled={isLoading}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />🔄 START AUTO MODE
                  </Button>

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold mb-2">Auto Sequence:</h4>
                    <div className="space-y-1 text-sm">
                      <div>🔴 Merah: {settings.redDuration}s</div>
                      <div>🟢 Hijau: {settings.greenDuration}s</div>
                      <div>🟡 Kuning: {settings.yellowDuration}s</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "settings" && (
              <Card>
                <CardHeader>
                  <CardTitle>Settings</CardTitle>
                  <CardDescription>Configure timing and behavior</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium block mb-2">Red Duration: {settings.redDuration}s</label>
                      <input
                        type="range"
                        min="1"
                        max="30"
                        value={settings.redDuration}
                        onChange={(e) => updateSetting("redDuration", Number.parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium block mb-2">
                        Yellow Duration: {settings.yellowDuration}s
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={settings.yellowDuration}
                        onChange={(e) => updateSetting("yellowDuration", Number.parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium block mb-2">
                        Green Duration: {settings.greenDuration}s
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="30"
                        value={settings.greenDuration}
                        onChange={(e) => updateSetting("greenDuration", Number.parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Auto Refresh Status</label>
                    <input
                      type="checkbox"
                      checked={settings.autoRefresh}
                      onChange={(e) => updateSetting("autoRefresh", e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* System Controls */}
            <Card>
              <CardHeader>
                <CardTitle>System Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() => controlTraffic("off")}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full py-3"
                >
                  <Power className="w-4 h-4 mr-2" />⚫ TURN OFF
                </Button>

                <Button onClick={emergencyStop} disabled={isLoading} variant="destructive" className="w-full py-3">
                  <AlertTriangle className="w-4 h-4 mr-2" />🚨 EMERGENCY STOP
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <Card
            className={`${message.type === "success" ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"}`}
          >
            <CardContent className="py-3">
              <p
                className={`text-center font-medium ${message.type === "success" ? "text-green-700" : "text-red-700"}`}
              >
                {message.text}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Footer Info */}
        <Card className="bg-white/95 backdrop-blur-sm">
          <CardContent className="py-4">
            <div className="text-center text-sm text-gray-600 space-y-2">
              <p>🔄 Status diperbarui otomatis setiap 2 detik</p>
              <p>
                🚦 Mode AUTO: Merah ({settings.redDuration}s) → Hijau ({settings.greenDuration}s) → Kuning (
                {settings.yellowDuration}s)
              </p>
              <p>⚡ Emergency Stop akan mengaktifkan lampu merah</p>
              <p>⌨️ Keyboard Shortcuts: 1=Merah, 2=Kuning, 3=Hijau, A=Auto, 0=Off, E=Emergency</p>
              <p className="text-blue-600 font-medium">
                🌐 API Endpoint: https://traffic-steel.vercel.app/api/traffic-status
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
