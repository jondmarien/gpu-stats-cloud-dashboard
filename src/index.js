import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import si from 'systeminformation';
import { getLatestStats, setLatestStats } from './storage.js';
import { API_KEYS } from './config.js';
console.log('Loaded API_KEYS:', API_KEYS);

const app = express();
const PORT = process.env.PORT || 3000;
const DEVICE_ID = process.env.DEVICE_ID; // Change this per device

app.use(cors());
app.use(express.json());

function authenticate(req, res, next) {
  const apiKey = req.header('x-api-key');
  if (!apiKey || !Object.values(API_KEYS).includes(apiKey)) {
    return res.status(401).json({ error: 'Unauthorized: Invalid API Key' });
  }
  req.deviceId = Object.keys(API_KEYS).find(
    (device) => API_KEYS[device] === apiKey
  );
  next();
}

// POST /push-sse: Accept stats and broadcast to all SSE clients
app.post('/push-sse', express.json(), (req, res) => {
  const stats = req.body;
  if (!stats) return res.status(400).json({ error: 'Missing stats' });
  const data = `data: ${JSON.stringify(stats)}\n\n`;
  sseClients.forEach(client => client.write(data));
  res.json({ success: true });
});

// --- SSE endpoint for live GPU stats ---
const sseClients = [];

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

app.get('/', (req, res) => {
  res.send('GPU Info Backend (API + SSE) is running.');
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  console.log(`SSE live stats at http://localhost:${PORT}/gpu/stream`);
});
