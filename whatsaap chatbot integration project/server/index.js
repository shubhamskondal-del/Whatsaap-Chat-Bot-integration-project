
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

const PORT = process.env.PORT || 3001;
const DATA_FILE = path.join(__dirname, 'data.json');
const FRONTEND_PATH = path.join(__dirname, '../client/dist');

app.use(express.json({ limit: '20kb' }));

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Backend is running!'
    });
});

// Save lead
app.post('/api/save', (req, res) => {
    try {
        let leads = [];

        if (fs.existsSync(DATA_FILE)) {
            try {
                leads = JSON.parse(
                    fs.readFileSync(DATA_FILE, 'utf8')
                );
                if (!Array.isArray(leads)) leads = [];
            } catch {
                leads = [];
            }
        }

        const entry = {
            ...req.body,
            submittedAt: new Date().toISOString()
        };

        leads.push(entry);

        fs.writeFileSync(
            DATA_FILE,
            JSON.stringify(leads, null, 2)
        );

        res.json({
            success: true,
            message: 'Lead saved successfully!'
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Unable to save lead'
        });
    }
});

// Serve React production build
app.use(express.static(FRONTEND_PATH));

// React routing fallback (Express 4)
app.get('*', (req, res) => {
    res.sendFile(
        path.join(FRONTEND_PATH, 'index.html')
    );
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Application running on port ${PORT}`);
});
