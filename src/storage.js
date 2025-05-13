// In-memory storage for GPU stats, keyed by deviceId
const deviceStats = {};

export function setLatestStats(deviceId, stats) {
  deviceStats[deviceId] = {
    stats,
    updatedAt: new Date().toISOString(),
  };
}

export function getLatestStats(deviceId) {
  return deviceStats[deviceId] || null;
}

// For future extensibility: swap this module with a DB-backed version as needed.
