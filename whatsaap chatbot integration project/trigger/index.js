const SERVER_URL = 'https://whatsaap-chat-bot-integration-project.onrender.com';
const INTERVAL_MS = 30_000;

// Trigger authentication token
const TRIGGER_TOKEN = 'd5aa9777b2e891a99c16881a69f695ba';

let isRunning = false;

function timestamp() {
    return new Date().toLocaleTimeString();
}

async function apiRequest(url, options = {}) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120_000);

    try {
        return await fetch(url, {
            ...options,
            signal: controller.signal,
            headers: {
                'x-trigger-token': TRIGGER_TOKEN,
                ...options.headers
            }
        });
    } finally {
        clearTimeout(timeout);
    }
}

async function poll() {
    if (isRunning) {
        console.log(`[${timestamp()}] Previous request is still running. Skipping this cycle.`);
        return;
    }

    isRunning = true;

    try {
        console.log('\n======================================');
        console.log(`[${timestamp()}] Checking Render server...`);
        console.log(`[${timestamp()}] Fetching and consuming leads...`);

        // Fetch current records and clear that batch in one API operation.
        const response = await apiRequest(
            `${SERVER_URL}/api/leads/consume`,
            { method: 'POST' }
        );

        const responseText = await response.text();

        if (!response.ok) {
            throw new Error(
                `HTTP ${response.status}: ${responseText.slice(0, 500)}`
            );
        }

        let result;

        try {
            result = JSON.parse(responseText);
        } catch {
            throw new Error(
                `Expected JSON but received: ${responseText.slice(0, 300)}`
            );
        }

        if (!result.success || !Array.isArray(result.data)) {
            throw new Error(result.message || 'Unexpected API response');
        }

        if (result.data.length === 0) {
            console.log(`[${timestamp()}] No new records found.`);
            console.log('======================================');
            return;
        }

        console.log(`[${timestamp()}] Found ${result.data.length} record(s).`);
        console.log('\n========== FETCHED DATA ==========\n');

        result.data.forEach((lead, index) => {
            console.log(`Record ${index + 1}:`);
            console.log(JSON.stringify(lead, null, 2));
            console.log('----------------------------------');
        });

        console.log(`[${timestamp()}] ${result.message}`);
        console.log('======================================');

    } catch (error) {
        if (error.name === 'AbortError') {
            console.error(`[${timestamp()}] ERROR: Request timed out.`);
        } else {
            console.error(`[${timestamp()}] ERROR: ${error.message}`);
        }
    } finally {
        isRunning = false;
    }
}

console.log('======================================');
console.log('       LOCAL DATA FETCH TRIGGER');
console.log('======================================');
console.log(`Server: ${SERVER_URL}`);
console.log(`Polling Interval: ${INTERVAL_MS / 1000} seconds`);
console.log('Trigger Started Successfully!');

// Start immediately, then repeat every 30 seconds.
poll();
setInterval(poll, INTERVAL_MS);