import si from 'systeminformation';
import fetch from 'node-fetch';

// Set this to your droplet's public URL
const DROPLET_PUSH_URL = 'https://gpustats.chron0.tech/push-sse';

// How often to push stats (ms)
const INTERVAL = 2000;

async function pushStats() {
  try {
    const gpus = await si.graphics();
    const nvidiaGpu = gpus.controllers && gpus.controllers.find(ctrl => ctrl.vendor && ctrl.vendor.toLowerCase().includes('nvidia'));
    if (!nvidiaGpu) {
      console.log('No NVIDIA GPU found.');
      return;
    }
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
    const res = await fetch(DROPLET_PUSH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(stats)
    });
    if (!res.ok) {
      console.error('Failed to push stats:', await res.text());
    } else {
      console.log('Pushed stats:', stats);
    }
  } catch (err) {
    console.error('Error collecting/pushing stats:', err.message);
  }
}

setInterval(pushStats, INTERVAL);
console.log('Started GPU stats agent. Pushing stats to:', DROPLET_PUSH_URL);