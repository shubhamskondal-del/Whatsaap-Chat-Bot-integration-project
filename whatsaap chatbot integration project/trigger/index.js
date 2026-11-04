import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Render backend URL
const SERVER_URL = 'https://whatsaap-chat-bot-integration-project.onrender.com';

// Polling interval: 30 seconds
const INTERVAL_MS = 30_000;

// Trigger authentication token
const TRIGGER_TOKEN = 'd5aa9777b2e891a99c16881a69f695ba';

// Local Excel file
const EXCEL_FILE = path.join(__dirname, 'leads.xlsx');

// Excel columns (fixed order)
const EXCEL_COLUMNS = [
    { header: 'Name', key: 'name', width: 25 },
    { header: 'WhatsApp', key: 'whatsapp', width: 20 },
    { header: 'Email', key: 'email', width: 35 },
    { header: 'City', key: 'city', width: 20 },
    { header: 'Message', key: 'message', width: 45 },
    { header: 'Submitted At', key: 'submittedAt', width: 30 }
];

let isRunning = false;

function timestamp() {
    return new Date().toLocaleTimeString();
}

// API request with authentication
async function apiRequest(url, options = {}) {
    const controller = new AbortController();

    const timeout = setTimeout(() => {
        controller.abort();
    }, 120_000);

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

// Append fetched records to local Excel
async function appendToExcel(leads) {

    if (!Array.isArray(leads) || leads.length === 0) {
        console.log(`[${timestamp()}] No records to write.`);
        return;
    }

    const workbook = new ExcelJS.Workbook();

    // Load existing Excel if available
    if (fs.existsSync(EXCEL_FILE)) {
        await workbook.xlsx.readFile(EXCEL_FILE);
        console.log(`[${timestamp()}] Existing Excel file loaded.`);
    }

    // Get or create worksheet
    let worksheet = workbook.getWorksheet('Leads');

    if (!worksheet) {
        worksheet = workbook.addWorksheet('Leads');
    }

    // Configure columns
    worksheet.columns = EXCEL_COLUMNS;

    // Add header if worksheet is empty
    if (worksheet.rowCount === 0) {
        const headerRow = worksheet.addRow(
            EXCEL_COLUMNS.map(column => column.header)
        );

        headerRow.font = { bold: true };
    }

    // Prepare records with blank values for missing fields
    const rows = leads.map(lead => ({
        name: lead?.name ?? '',
        whatsapp: lead?.whatsapp ?? '',
        email: lead?.email ?? '',
        city: lead?.city ?? '',
        message: lead?.message ?? '',
        submittedAt: lead?.submittedAt ?? ''
    }));

    // Append rows without deleting previous entries
    rows.forEach(row => {
        worksheet.addRow(row);
    });

    // Save to temporary file first
    const tempFile = `${EXCEL_FILE}.tmp`;

    await workbook.xlsx.writeFile(tempFile);

    // Replace the existing Excel file
    fs.renameSync(tempFile, EXCEL_FILE);

    console.log(`[${timestamp()}] Excel updated successfully.`);
    console.log(`[${timestamp()}] Rows appended: ${rows.length}`);
    console.log(`[${timestamp()}] Excel location: ${EXCEL_FILE}`);
}

// Fetch records from Render
async function poll() {

    if (isRunning) {
        console.log(
            `[${timestamp()}] Previous request is still running. Skipping this cycle.`
        );
        return;
    }

    isRunning = true;

    try {

        console.log('\n======================================');
        console.log(`[${timestamp()}] Checking Render server...`);
        console.log(`[${timestamp()}] Fetching leads...`);

        const response = await apiRequest(
            `${SERVER_URL}/api/leads/consume`,
            {
                method: 'POST'
            }
        );

        const responseText = await response.text();

        // Check HTTP status
        if (!response.ok) {
            throw new Error(
                `HTTP ${response.status}: ${responseText.slice(0, 500)}`
            );
        }

        // Parse JSON
        let result;

        try {
            result = JSON.parse(responseText);
        } catch {
            throw new Error(
                `Invalid JSON response: ${responseText.slice(0, 300)}`
            );
        }

        // Validate response
        if (
            !result ||
            result.success !== true ||
            !Array.isArray(result.data)
        ) {
            throw new Error(
                result?.message || 'Invalid response received from server.'
            );
        }

        // No records: do not create or modify Excel
        if (result.data.length === 0) {
            console.log(`[${timestamp()}] No new records found.`);
            console.log(`[${timestamp()}] Excel not modified.`);
            console.log('======================================');
            return;
        }

        console.log(
            `[${timestamp()}] Records received: ${result.data.length}`
        );

        // Display received data
        console.log('\n========== FETCHED DATA ==========\n');

        result.data.forEach((lead, index) => {
            console.log(`Record ${index + 1}:`);
            console.log(JSON.stringify(lead, null, 2));
            console.log('----------------------------------');
        });

        // Append records to Excel
        await appendToExcel(result.data);

        console.log(`[${timestamp()}] Processing completed successfully.`);
        console.log('======================================');

    } catch (error) {

        if (error.name === 'AbortError') {
            console.error(`[${timestamp()}] ERROR: Request timed out.`);
        } else {
            console.error(`[${timestamp()}] ERROR: ${error.message}`);
        }

        console.log(`[${timestamp()}] Excel was not updated by this cycle.`);

    } finally {
        isRunning = false;
    }
}

// Start trigger
console.log('======================================');
console.log('       LOCAL DATA FETCH TRIGGER');
console.log('======================================');

console.log(`Server: ${SERVER_URL}`);
console.log(`Polling Interval: ${INTERVAL_MS / 1000} seconds`);
console.log(`Excel File: ${EXCEL_FILE}`);

console.log('Trigger Started Successfully!');

// First execution immediately
poll();

// Repeat every 30 seconds
setInterval(poll, INTERVAL_MS);