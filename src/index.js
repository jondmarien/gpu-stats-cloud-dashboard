import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { getLatestStats, setLatestStats } from './storage.js';
import { API_KEYS } from './config.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

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

// POST /api/push
app.post('/api/push', authenticate, (req, res) => {
  const { deviceId, stats } = req.body;
  if (!deviceId || !stats) {
    return res.status(400).json({ error: 'Missing deviceId or stats' });
  }
  setLatestStats(deviceId, stats);
  res.json({ success: true });
});

// GET /api/latest?device=DEVICE_ID
app.get('/api/latest', authenticate, (req, res) => {
  const deviceId = req.query.device;
  if (!deviceId) {
    return res.status(400).json({ error: 'Missing device parameter' });
  }
  const stats = getLatestStats(deviceId);
  if (!stats) {
    return res.status(404).json({ error: 'No stats found for device' });
  }
  res.json({ deviceId, stats });
});

app.get('/', (req, res) => {
  res.send('GPU Info Backend is running.');
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
