// Local GPU Info HTTP server using systeminformation (ESM style)
// Run this on each machine to collect GPU stats and push to your cloud backend
import express from 'express';
import si from 'systeminformation';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.LOCAL_GPU_SERVER_PORT || 3001;

// Config: Set these in your .env or here
const CLOUD_BACKEND_URL = process.env.CLOUD_BACKEND_URL || 'http://localhost:3000/api/push';
const GPU_SSE_URL = process.env.GPU_SSE_URL || 'http://localhost:3001/gpu/stream';
const API_KEY = process.env.API_KEY_MYPc; // Use your device's API key
const DEVICE_ID = 'thebeast'; // Change this per device

// CORS middleware: allow all origins
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});


// SSE clients array
const sseClients = [];

// SSE endpoint for live GPU stats
app.get('/gpu/stream', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Push initial comment to keep connection alive
  res.write(': connected\n\n');

  // Add client to list
  sseClients.push(res);

  // Remove client on close
  req.on('close', () => {
    const idx = sseClients.indexOf(res);
    if (idx !== -1) sseClients.splice(idx, 1);
  });
});

// Broadcast GPU stats to all SSE clients every 2 seconds
setInterval(async () => {
  if (sseClients.length === 0) return;
  try {
    const gpus = await si.graphics();
    const nvidiaGpu = gpus.controllers && gpus.controllers.find(ctrl => ctrl.vendor && ctrl.vendor.toLowerCase().includes('nvidia'));
    if (!nvidiaGpu) return;
    const stats = {
      name: nvidiaGpu.name || nvidiaGpu.model,
      vendor: nvidiaGpu.vendor,
      memoryTotal: nvidiaGpu.memoryTotal || nvidiaGpu.vram,
      memoryUsed: nvidiaGpu.memoryUsed,
      memoryFree: nvidiaGpu.memoryFree,
      temperatureGpu: nvidiaGpu.temperatureGpu,
      utilizationGpu: nvidiaGpu.utilizationGpu,
      utilizationMemory: nvidiaGpu.utilizationMemory,
      fanSpeed: nvidiaGpu.fanSpeed,
      powerDraw: nvidiaGpu.powerDraw,
      powerLimit: nvidiaGpu.powerLimit,
      clockCore: nvidiaGpu.clockCore,
      clockMemory: nvidiaGpu.clockMemory,
      driverVersion: nvidiaGpu.driverVersion
    };
    const data = `data: ${JSON.stringify(stats)}\n\n`;
    sseClients.forEach(client => client.write(data));
  } catch (err) {
    // Optionally send error event
    const errorData = `event: error\ndata: ${JSON.stringify({ error: err.message })}\n\n`;
    sseClients.forEach(client => client.write(errorData));
  }
}, 2000);


app.listen(PORT, () => {
  console.log(`SSE live stats at http://localhost:${PORT}/gpu/stream`);
});
