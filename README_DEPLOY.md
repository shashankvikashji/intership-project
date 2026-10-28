# Deploy Lumen (Vercel + Render)

Repo: https://github.com/shashankvikashji/intership-project

## 1) Deploy Backend to Render
1. Go to https://dashboard.render.com/ and sign in with GitHub.
2. New > Web Service > Connect the repo `shashankvikashji/intership-project`.
3. Root Directory: `server`
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Environment:
   - `NODE_ENV=production`
   - `JWT_SECRET` (generate a long random string)
   - `MONGO_URI` (optional; leave empty for in-memory demo)
   - `CLIENT_URL` - set after Vercel deploy (e.g. `https://your-app.vercel.app`)
   - `GNEWS_API_KEY`, `AI_API_KEY` (optional)
   - `ADMIN_EMAILS=demo@lumen.news`
7. Deploy. Copy the URL e.g. `https://lumen-api-xxxx.onrender.com`

## 2) Deploy Frontend to Vercel
1. Go to https://vercel.com/new and import the same repo.
2. Framework: Vite (auto-detected). Root Directory: `client`
3. Build Command: `npm run build` (default)
4. Output Directory: `dist` (default)
5. Add/Update `client/vercel.json` - replace `YOUR-RENDER-URL.onrender.com` with your Render URL.
   ```json
   {
     "rewrites": [
       { "source": "/api/:path*", "destination": "https://lumen-api-xxxx.onrender.com/api/:path*" },
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```
6. Deploy. Copy the Vercel URL.

## 3) Link them
1. In Render, set/update `CLIENT_URL` to your Vercel URL (e.g. `https://your-app.vercel.app`) and redeploy.
2. In Vercel, redeploy after updating vercel.json.
3. Test: open Vercel URL, login with `demo@lumen.news` / `demo1234`.

Notes:
- Without MongoDB, data resets on Render free dyno sleep/restart (demo mode) - that's expected per README.
- The app already allows all `*.vercel.app` origins in CORS.
- In dev, client proxies `/api` to `localhost:5000`. In prod on Vercel, rewrites forward to Render.
