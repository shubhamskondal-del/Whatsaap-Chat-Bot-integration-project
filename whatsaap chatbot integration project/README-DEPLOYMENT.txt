WHATSAPP CHATBOT POC — UPDATED SINGLE RENDER SERVICE

This project keeps the React frontend and Express backend in ONE Render Web Service.

RENDER SETTINGS
- Root Directory: whatsaap chatbot integration project
- Build Command: npm install --prefix server && npm install --prefix client && npm run build --prefix client
- Start Command: npm start --prefix server

RENDER ENVIRONMENT VARIABLE
- Key: TRIGGER_TOKEN
- Value: must exactly match the token in trigger/index.js.

IMPORTANT: The token has been shared in chat. Rotate it before production and update BOTH the Render environment variable and trigger/index.js with the new value. Do not commit a hardcoded token to a public GitHub repository.

WHAT WAS UPDATED
- server/index.js now explicitly registers POST /api/leads/consume before the frontend fallback.
- GET /api/leads and DELETE /api/leads are protected.
- /api/health returns JSON.
- Unknown /api/* routes return JSON 404 rather than the React HTML page.
- trigger/index.js calls POST /api/leads/consume every 30 seconds.
- The consume endpoint fetches the current batch and clears it in one server-side operation.

VERY IMPORTANT DEPLOYMENT STEP
Changing files in this ZIP does not change the live Render service automatically.
You must replace the matching project files in the GitHub repository with the files from this ZIP, commit the changes, and wait for Render to deploy the new commit.
Then verify the deployment's latest commit in Render > Events.

TESTS AFTER DEPLOYMENT
1. Open https://whatsaap-chat-bot-integration-project.onrender.com/api/health
   Expected: JSON with "Backend is running!"
2. Open https://whatsaap-chat-bot-integration-project.onrender.com/api/leads/consume in a browser.
   A browser GET is not the required POST method, so it should NOT return the React app. It may return a JSON 404 for GET.
3. Run trigger/index.js using Node.js. It sends POST /api/leads/consume with the x-trigger-token header.

POC STORAGE WARNING
The data.json file on Render's free service uses ephemeral local storage. It can be lost after restart/redeploy/instance replacement. Use a persistent database or durable queue for production.
