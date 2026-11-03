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

app.use(express.json({ limit: '20kb' }));

function readLeads() {
    if (!fs.existsSync(DATA_FILE)) return [];

    try {
        const parsed = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error('Unable to read data.json:', error);
        throw new Error('Lead data file is invalid JSON');
    }
}

function writeLeads(leads) {
    // Write to a temporary file first, then replace data.json.
    const tempFile = `${DATA_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(leads, null, 2), 'utf8');
    fs.renameSync(tempFile, DATA_FILE);
}

function verifyTriggerToken(req, res, next) {
    const expected = process.env.TRIGGER_TOKEN;
    const supplied = req.get('x-trigger-token');

    if (!expected) {
        return res.status(503).json({
            success: false,
            message: 'Server trigger authentication is not configured'
        });
    }

    if (!supplied) {
        return res.status(401).json({
            success: false,
            message: 'Missing trigger token'
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

// Public health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Backend is running!'
    });
});

// Save a new lead from the React form
app.post('/api/save', (req, res) => {
    try {
        const leads = readLeads();

        const entry = {
            ...req.body,
            submittedAt: new Date().toISOString()
        };

        leads.push(entry);
        writeLeads(leads);

        res.status(201).json({
            success: true,
            message: 'Lead saved successfully!'
        });
    } catch (error) {
        console.error('Save lead error:', error);
        res.status(500).json({
            success: false,
            message: 'Unable to save lead'
        });
    }
});

// Protected: read all leads without deleting them
app.get('/api/leads', verifyTriggerToken, (req, res) => {
    try {
        res.json(readLeads());
    } catch (error) {
        console.error('Fetch leads error:', error);
        res.status(500).json({
            success: false,
            message: 'Unable to read leads'
        });
    }
});

// Protected: atomically fetch and clear the current batch.
// This avoids the GET-then-DELETE race where a newly submitted lead could be lost.
app.post('/api/leads/consume', verifyTriggerToken, (req, res) => {
    try {
        const leads = readLeads();
        writeLeads([]);

        res.json({
            success: true,
            count: leads.length,
            data: leads,
            message: leads.length
                ? 'Leads fetched and cleared successfully'
                : 'No leads available'
        });
    } catch (error) {
        console.error('Consume leads error:', error);
        res.status(500).json({
            success: false,
            message: 'Unable to consume leads'
        });
    }
});

// Protected manual clear endpoint (kept for compatibility)
app.delete('/api/leads', verifyTriggerToken, (req, res) => {
    try {
        writeLeads([]);
        res.json({
            success: true,
            message: 'Server data cleared successfully'
        });
    } catch (error) {
        console.error('Delete leads error:', error);
        res.status(500).json({
            success: false,
            message: 'Unable to clear leads'
        });
    }
});

// Serve React production build AFTER all API routes
app.use(express.static(FRONTEND_PATH));

// React SPA fallback LAST. API requests that do not exist return JSON 404,
// never the React index.html page.
app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({
            success: false,
            message: 'API route not found'
        });
    }

    res.sendFile(path.join(FRONTEND_PATH, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Application running on port ${PORT}`);
    console.log(`Frontend build path: ${FRONTEND_PATH}`);
});
