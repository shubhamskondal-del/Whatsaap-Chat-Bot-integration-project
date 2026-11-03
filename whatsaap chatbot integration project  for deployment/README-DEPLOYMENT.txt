# WhatsApp Chatbot POC – updated single-service deployment

## Render configuration

Keep one Render **Web Service** connected to this repository.

- Root Directory: `whatsaap chatbot integration project`
- Build Command:
  `npm install --prefix server && npm install --prefix client && npm run build --prefix client`
- Start Command:
  `npm start --prefix server`

The Express server serves the built React app and its `/api/*` routes from the same Render URL.

## Required Render environment variable

In Render → your service → Environment, add:

- Key: `TRIGGER_TOKEN`
- Value: generate a NEW long random secret and use the same value in your local trigger environment.

The token previously pasted into chat should be considered exposed. Rotate it and do not commit the replacement to GitHub.

## Test after redeploy

1. Open `/api/health` on your Render URL. It should return JSON.
2. Open `/api/leads` in a browser. It should return JSON `401` or `403` because the route is protected; it must NOT return the React page.
3. Run the trigger after setting `TRIGGER_TOKEN`.

## Run the local trigger (Windows PowerShell)

Open PowerShell in the `trigger` folder:

```powershell
$env:TRIGGER_TOKEN = "PASTE_THE_SAME_NEW_TOKEN_HERE"
node index.js
```

## How the trigger works

Every 30 seconds it calls `POST /api/leads/consume`. That endpoint returns the current batch and clears that batch in one synchronous server operation. This is safer than separate GET and DELETE calls because a lead submitted after the batch is read will not be cleared accidentally.

## Important POC limitation

`data.json` on Render's free web service uses an ephemeral filesystem. Data can be lost when the service restarts, redeploys, or its instance is replaced. Use persistent storage/database before production. The consume endpoint also clears leads as soon as the trigger receives the response; for production workflows, use a durable queue or per-record acknowledgement after downstream processing.
