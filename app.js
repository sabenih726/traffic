const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Status traffic light global
let trafficStatus = {
  mode: 'off',      // 'manual', 'auto', 'off'
  color: 'off',     // 'red', 'yellow', 'green', 'off'
  autoStep: 0,      // untuk tracking step auto mode
  lastUpdate: new Date()
};

// Route untuk mendapatkan status traffic light (digunakan oleh Arduino)
app.get('/traffic-status', (req, res) => {
  console.log(`Arduino meminta status: ${JSON.stringify(trafficStatus)}`);
  res.json(trafficStatus);
});

// Route untuk kontrol manual traffic light
app.post('/control-traffic', (req, res) => {
  const { mode, color } = req.body;
  
  if (mode === 'manual' && ['red', 'yellow', 'green', 'off'].includes(color)) {
    trafficStatus.mode = 'manual';
    trafficStatus.color = color;
    trafficStatus.lastUpdate = new Date();
    
    console.log(`🚦 Manual mode: ${color.toUpperCase()}`);
    res.json({ 
      success: true, 
      status: trafficStatus,
      message: `Traffic light diatur ke ${color.toUpperCase()}` 
    });
    
  } else if (mode === 'auto') {
    trafficStatus.mode = 'auto';
    trafficStatus.autoStep = 0;
    trafficStatus.lastUpdate = new Date();
    
    console.log('🔄 Auto mode activated');
    res.json({ 
      success: true, 
      status: trafficStatus,
      message: 'Mode otomatis diaktifkan' 
    });
    
  } else if (mode === 'off') {
    trafficStatus.mode = 'off';
    trafficStatus.color = 'off';
    trafficStatus.lastUpdate = new Date();
    
    console.log('⚫ All lights OFF');
    res.json({ 
      success: true, 
      status: trafficStatus,
      message: 'Semua lampu dimatikan' 
    });
    
  } else {
    res.status(400).json({ 
      success: false, 
      message: 'Invalid mode atau color. Mode: manual/auto/off, Color: red/yellow/green/off' 
    });
  }
});

// Route untuk mendapatkan status saat ini (untuk web interface)
app.get('/current-traffic-status', (req, res) => {
  res.json(trafficStatus);
});

// Route utama untuk web interface
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route untuk traffic light patterns/presets
app.get('/traffic-patterns', (req, res) => {
  const patterns = {
    normal: {
      name: 'Normal Traffic',
      sequence: ['red', 'green', 'yellow'],
      timing: [5000, 5000, 2000]
    },
    emergency: {
      name: 'Emergency Mode',
      sequence: ['red'],
      timing: [1000]
    },
    caution: {
      name: 'Caution Mode', 
      sequence: ['yellow'],
      timing: [1000]
    }
  };
  res.json(patterns);
});

// Route untuk statistics/logging
app.get('/traffic-stats', (req, res) => {
  res.json({
    currentStatus: trafficStatus,
    uptime: process.uptime(),
    lastUpdate: trafficStatus.lastUpdate,
    serverTime: new Date()
  });
});

// Endpoint untuk emergency override
app.post('/emergency', (req, res) => {
  trafficStatus.mode = 'manual';
  trafficStatus.color = 'red';
  trafficStatus.lastUpdate = new Date();
  
  console.log('🚨 EMERGENCY OVERRIDE - ALL RED');
  res.json({ 
    success: true, 
    status: trafficStatus,
    message: 'Emergency mode activated - All RED' 
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Terjadi kesalahan server' });
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`🚦 Traffic Light Server berjalan di http://localhost:${port}`);
  console.log(`📱 Akses dari perangkat lain: http://[IP-KOMPUTER]:${port}`);
  console.log(`🔗 Arduino endpoint: http://[IP-KOMPUTER]:${port}/traffic-status`);
  console.log(`🚦 Status saat ini: ${JSON.stringify(trafficStatus)}`);
  console.log(`\n🎮 Available Controls:`);
  console.log(`   Manual: POST /control-traffic {"mode":"manual","color":"red/yellow/green"}`);
  console.log(`   Auto:   POST /control-traffic {"mode":"auto"}`);
  console.log(`   Off:    POST /control-traffic {"mode":"off"}`);
  console.log(`   Emergency: POST /emergency`);
});