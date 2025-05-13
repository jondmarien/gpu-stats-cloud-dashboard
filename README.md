# gpuinfo-backend

Cloud backend for collecting and serving GPU stats from multiple devices. Provides authenticated API endpoints for pushing and retrieving the latest GPU statistics. Designed for easy extensibility and deployment to Vercel, Railway, or VPS.

## Features
- **POST /api/push**: Push latest GPU stats (per device, authenticated)
- **GET /api/latest?device=DEVICE_ID**: Fetch latest stats for a device (authenticated)
- **API key authentication** (per device)
- **CORS enabled** for web dashboard integration
- **In-memory storage** (easy to swap for DB later)

## Quickstart

1. **Clone the repo & install dependencies:**
   ```sh
   git clone https://github.com/jondmarien/gpuinfo-backend.git
   cd gpuinfo-backend
   npm install
   ```

2. **Configure API keys:**
   - Copy `.env.example` to `.env` and set your API keys (per device).

3. **Run the server:**
   ```sh
   npm run dev
   # or
   npm start
   ```

## API Usage

### Push GPU Stats
```
curl -X POST http://localhost:3000/api/push \
  -H 'x-api-key: changeme-mypc' \
  -H 'Content-Type: application/json' \
  -d '{"deviceId":"mypc","stats":{"gpuTemp":65,"gpuLoad":80}}'
```

### Fetch Latest Stats
```
curl -X GET 'http://localhost:3000/api/latest?device=mypc' \
  -H 'x-api-key: changeme-mypc'
```

## Deployment

### Vercel
- Import this repo on [Vercel](https://vercel.com/)
- Set environment variables (API keys, PORT)
- Deploy!

### Railway
- Create a new Railway project, link this repo
- Set environment variables (API keys, PORT)
- Deploy!

### VPS
- Copy repo to server
- Install Node.js
- Set up `.env` file
- Run with `npm start` or a process manager (pm2, systemd)

## Extending / Swapping Storage
- All storage logic is in `src/storage.js`. Replace this module with DB logic as needed.

## Integrating with Local GPU Info Server
- Configure your local GPU info server to POST stats to `/api/push` with the correct API key and deviceId.
- Example payload:
  ```json
  {
    "deviceId": "mypc",
    "stats": { "gpuTemp": 65, "gpuLoad": 80 }
  }
  ```

---

Feel free to open issues or PRs for improvements!
