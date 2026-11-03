import express from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

const PORT = process.env.PORT || 3001;
const DATA_FILE = path.join(__dirname, 'data.json');
const FRONTEND_PATH = path.join(__dirname, '../client/dist');

app.disable('x-powered-by');
app.use(express.json({ limit: '20kb' }));

function readLeads() {
    if (!fs.existsSync(DATA_FILE)) return [];

    const raw = fs.readFileSync(DATA_FILE, 'utf8').trim();
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
        throw new Error('data.json must contain a JSON array');
    }
    return parsed;
}

function writeLeads(leads) {
    const tempFile = `${DATA_FILE}.${process.pid}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(leads, null, 2), 'utf8');
    fs.renameSync(tempFile, DATA_FILE);
}

function verifyTriggerToken(req, res, next) {
    const expected = process.env.TRIGGER_TOKEN;
    const supplied = req.get('x-trigger-token');

    if (!expected) {
        return res.status(503).json({
            success: false,
            message: 'TRIGGER_TOKEN is not configured on the Render service'
        });
    }

    if (!supplied) {
        return res.status(401).json({
            success: false,
            message: 'Missing x-trigger-token header'
        });
    }

    const expectedBuffer = Buffer.from(expected);
    const suppliedBuffer = Buffer.from(supplied);

    if (
        expectedBuffer.length !== suppliedBuffer.length ||
        !crypto.timingSafeEqual(expectedBuffer, suppliedBuffer)
    ) {
        return res.status(403).json({
            success: false,
            message: 'Invalid trigger token'
        });
    }

    next();
}

// Health check: should always return JSON.
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Backend is running!',
        service: 'whatsapp-chatbot'
    });
});

// Save a lead from the React frontend.
app.post('/api/save', (req, res) => {
    try {
        const leads = readLeads();
        leads.push({
            ...req.body,
            submittedAt: new Date().toISOString()
        });
        writeLeads(leads);

        return res.status(201).json({
            success: true,
            message: 'Lead saved successfully'
        });
    } catch (error) {
        console.error('POST /api/save failed:', error);
        return res.status(500).json({
            success: false,
            message: 'Unable to save lead'
        });
    }
});

// Protected read endpoint, useful for manual/API testing.
app.get('/api/leads', verifyTriggerToken, (req, res) => {
    try {
        return res.json(readLeads());
    } catch (error) {
        console.error('GET /api/leads failed:', error);
        return res.status(500).json({
            success: false,
            message: 'Unable to read leads'
        });
    }
});

// Protected atomic consume endpoint: returns current batch and clears it.
// A newly submitted lead after this read/write will remain for the next poll.
app.post('/api/leads/consume', verifyTriggerToken, (req, res) => {
    try {
        const batch = readLeads();
        writeLeads([]);

        return res.status(200).json({
            success: true,
            count: batch.length,
            data: batch,
            message: batch.length
                ? 'Leads fetched and cleared successfully'
                : 'No leads available'
        });
    } catch (error) {
        console.error('POST /api/leads/consume failed:', error);
        return res.status(500).json({
            success: false,
            message: 'Unable to consume leads'
        });
    }
});

// Protected manual clear endpoint.
app.delete('/api/leads', verifyTriggerToken, (req, res) => {
    try {
        writeLeads([]);
        return res.json({
            success: true,
            message: 'Server data cleared successfully'
        });
    } catch (error) {
        console.error('DELETE /api/leads failed:', error);
        return res.status(500).json({
            success: false,
            message: 'Unable to clear leads'
        });
    }
});

// Serve the React build after API routes.
app.use(express.static(FRONTEND_PATH));

// SPA fallback: API paths that do not exist return JSON 404, not index.html.
app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({
            success: false,
            message: `API route not found: ${req.method} ${req.path}`
        });
    }

    return res.sendFile(path.join(FRONTEND_PATH, 'index.html'), (error) => {
        if (error) next(error);
    });
});

// JSON error handler.
app.use((error, req, res, next) => {
    console.error('Unhandled server error:', error);
    if (res.headersSent) return next(error);

    return res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Application running on port ${PORT}`);
    console.log(`Serving frontend from: ${FRONTEND_PATH}`);
});
