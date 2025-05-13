# GPU Stats Cloud Dashboard

A seamless, real-time GPU monitoring solution using Server-Sent Events (SSE).

This project consists of:
- **Cloud Backend**: Streams live GPU stats to connected clients via SSE and accepts stat updates from remote agents.
- **Local Agent**: Collects real GPU stats from your PC and pushes them to the backend for real-time cloud monitoring.

---

## Architecture Overview

- **Backend** (Node.js/Express):
  - Streams GPU stats to any connected web client via the `/gpu/stream` SSE endpoint.
  - Accepts POSTs at `/push-sse` from trusted agents to broadcast new stats.
- **Local Agent** (`src/push-gpu-stats.js`):
  - Runs on your PC, collects GPU stats using [`systeminformation`](https://www.npmjs.com/package/systeminformation).
  - Periodically POSTs stats to the backend’s `/push-sse` endpoint.
  - Designed to run hidden in the background at startup (e.g., via Windows Task Scheduler).

---

## Quickstart

### 1. Clone & Install
```sh
# Backend & agent are in the same repo
npm install
```

### 2. Configure Backend
- Edit `src/config.js` to define your trusted device(s) and API keys (if needed).
- Set up a `.env` file for any secrets or per-device keys.
- Start the backend:
  ```sh
  npm start
  # or, for development:
  npm run dev
  ```
- The backend will listen on the port defined in `.env` (default: 3000).

### 3. Setup Local Agent
- Edit `src/push-gpu-stats.js`:
  - Set `DROPLET_PUSH_URL` to your backend’s public `/push-sse` endpoint.
- Install dependencies if running standalone:
  ```sh
  npm install systeminformation node-fetch
  ```
- Test the agent locally:
  ```sh
  node src/push-gpu-stats.js
  ```

### 4. Run Agent at Startup (Windows)
- Use Task Scheduler to run the agent script in the background at login:
  1. Open Task Scheduler → Create Task
  2. Set trigger: At log on
  3. Action: Start a program → `node`
  4. Add argument: `C:\path\to\src\push-gpu-stats.js`
  5. Set to run hidden (optional)
- This ensures real GPU stats are sent to the cloud backend automatically.

---

## Backend Endpoints

- **POST `/push-sse`**
  - Accepts a JSON payload with GPU stats from the agent.
  - Example payload:
    ```json
    {
      "name": "NVIDIA RTX 3080",
      "vendor": "NVIDIA",
      "temperatureGpu": 65,
      "utilizationGpu": 80,
      ...
    }
    ```
- **GET `/gpu/stream`**
  - SSE endpoint. Connect with EventSource in browser or curl:
    ```js
    const es = new EventSource('https://your-backend/gpu/stream');
    es.onmessage = (e) => console.log(JSON.parse(e.data));
    ```

---

## Dependencies
- express
- cors
- dotenv
- systeminformation
- node-fetch

Dev dependencies:
- nodemon
- concurrently

---

## Notes
- No REST API: All real-time updates use SSE; stats are pushed to `/push-sse` and broadcast to `/gpu/stream`.
- Designed for extensibility: You can add authentication or database storage as needed.
- For multi-device setups, run the agent on each PC and point to the same backend.

---

## Credits & Contributions
Feel free to open issues or PRs for improvements!
