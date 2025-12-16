import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { google } from 'googleapis';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from parent directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const PORT = process.env.PORT || 3001;
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID || process.env.SHEET_ID || process.env.SPREADSHEET_ID;
const CREDENTIALS_PATH = path.join(__dirname, '..', 'credentials.json');

console.log('📁 Looking for credentials at:', CREDENTIALS_PATH);
console.log('📊 Spreadsheet ID:', SPREADSHEET_ID);

// Initialize Google Sheets API
let sheets;
let auth;

async function initGoogleSheets() {
  try {
    if (!fs.existsSync(CREDENTIALS_PATH)) {
      console.error('❌ credentials.json not found at:', CREDENTIALS_PATH);
      return false;
    }

    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
    console.log('✅ Credentials loaded');

    // Check if it's a service account
    if (credentials.type === 'service_account') {
      auth = new google.auth.GoogleAuth({
        keyFile: CREDENTIALS_PATH,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });
      console.log('✅ Using Service Account authentication');
    } else if (credentials.installed || credentials.web) {
      // OAuth2 - for API key based access
      const key = credentials.installed || credentials.web;
      auth = new google.auth.OAuth2(key.client_id, key.client_secret);
      console.log('✅ Using OAuth2 authentication');
    } else if (credentials.api_key || process.env.GOOGLE_API_KEY) {
      // API Key based access
      const apiKey = credentials.api_key || process.env.GOOGLE_API_KEY;
      sheets = google.sheets({ version: 'v4', auth: apiKey });
      console.log('✅ Using API Key authentication');
      return true;
    }

    sheets = google.sheets({ version: 'v4', auth });
    console.log('✅ Google Sheets API initialized');

    // Test connection
    if (SPREADSHEET_ID) {
      await initializeSheets();
    } else {
      console.log('⚠️ No SPREADSHEET_ID found in .env file');
    }

    return true;
  } catch (error) {
    console.error('❌ Error initializing Google Sheets:', error.message);
    return false;
  }
}

// Sheet names for data organization
const SHEETS = {
  APP_DATA: 'PersonaDevData',
  SYNC_LOG: 'SyncLog'
};

// Initialize sheets if they don't exist
async function initializeSheets() {
  if (!SPREADSHEET_ID) {
    console.log('⚠️ No spreadsheet ID provided');
    return;
  }

  try {
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
    const existingSheets = spreadsheet.data.sheets.map(s => s.properties.title);
    console.log('📋 Existing sheets:', existingSheets);

    const sheetsToCreate = Object.values(SHEETS).filter(name => !existingSheets.includes(name));

    if (sheetsToCreate.length > 0) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        resource: {
          requests: sheetsToCreate.map(title => ({
            addSheet: { properties: { title } }
          }))
        }
      });
      console.log(`✅ Created sheets: ${sheetsToCreate.join(', ')}`);

      // Add headers
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEETS.APP_DATA}!A1:C1`,
        valueInputOption: 'RAW',
        resource: { values: [['Timestamp', 'DataType', 'JSONData']] }
      });

      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEETS.SYNC_LOG}!A1:D1`,
        valueInputOption: 'RAW',
        resource: { values: [['Timestamp', 'Action', 'Device', 'Status']] }
      });
    }

    console.log('✅ Sheets initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing sheets:', error.message);
  }
}

// ===================== API ROUTES =====================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    sheets: !!sheets,
    spreadsheetId: SPREADSHEET_ID ? 'configured' : 'missing'
  });
});

// ========== FULL DATA SYNC ==========
// This is the main endpoint - stores entire app data as JSON
app.post('/api/sync', async (req, res) => {
  const { data, device = 'web' } = req.body;

  if (!SPREADSHEET_ID) {
    return res.status(400).json({ 
      success: false, 
      error: 'No spreadsheet ID configured. Please add GOOGLE_SHEET_ID to your .env file' 
    });
  }

  try {
    const timestamp = new Date().toISOString();
    const jsonData = JSON.stringify(data);

    // Append new row with the full data
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEETS.APP_DATA}!A:C`,
      valueInputOption: 'RAW',
      resource: {
        values: [[timestamp, 'FULL_SYNC', jsonData]]
      }
    });

    // Log the sync
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEETS.SYNC_LOG}!A:D`,
      valueInputOption: 'RAW',
      resource: {
        values: [[timestamp, 'SYNC', device, 'SUCCESS']]
      }
    });

    console.log(`✅ Data synced at ${timestamp} from ${device}`);
    res.json({ success: true, timestamp });
  } catch (error) {
    console.error('❌ Sync error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get latest data
app.get('/api/sync', async (req, res) => {
  if (!SPREADSHEET_ID) {
    return res.status(400).json({ 
      success: false, 
      error: 'No spreadsheet ID configured' 
    });
  }

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEETS.APP_DATA}!A:C`
    });

    const rows = response.data.values || [];
    if (rows.length <= 1) {
      // No data yet
      return res.json({ success: true, data: null, message: 'No data found' });
    }

    // Get the latest row (last row)
    const latestRow = rows[rows.length - 1];
    const [timestamp, dataType, jsonData] = latestRow;

    if (jsonData) {
      const data = JSON.parse(jsonData);
      console.log(`✅ Retrieved data from ${timestamp}`);
      res.json({ success: true, data, timestamp });
    } else {
      res.json({ success: true, data: null, message: 'No data found' });
    }
  } catch (error) {
    console.error('❌ Fetch error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all sync history
app.get('/api/sync/history', async (req, res) => {
  if (!SPREADSHEET_ID) {
    return res.status(400).json({ success: false, error: 'No spreadsheet ID configured' });
  }

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEETS.SYNC_LOG}!A:D`
    });

    const rows = response.data.values || [];
    const history = rows.slice(1).map(([timestamp, action, device, status]) => ({
      timestamp, action, device, status
    })).reverse(); // Latest first

    res.json({ success: true, history });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Export data in custom format
app.get('/api/export/:format', async (req, res) => {
  const { format } = req.params;

  if (!SPREADSHEET_ID) {
    return res.status(400).json({ success: false, error: 'No spreadsheet ID configured' });
  }

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEETS.APP_DATA}!A:C`
    });

    const rows = response.data.values || [];
    if (rows.length <= 1) {
      return res.json({ success: false, error: 'No data to export' });
    }

    const latestRow = rows[rows.length - 1];
    const data = JSON.parse(latestRow[2]);

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=personadev-backup.json');
      res.json(data);
    } else if (format === 'pdev') {
      // Custom PersonaDev format with metadata
      const exportData = {
        _format: 'PersonaDev',
        _version: '2.0.0',
        _exportedAt: new Date().toISOString(),
        _creator: 'Sonu Prasad',
        data
      };
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=personadev-backup.pdev');
      res.json(exportData);
    } else {
      res.status(400).json({ success: false, error: 'Invalid format. Use json or pdev' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Import data
app.post('/api/import', async (req, res) => {
  const { data, device = 'web' } = req.body;

  let importData = data;

  // Handle PersonaDev format
  if (data._format === 'PersonaDev') {
    importData = data.data;
  }

  try {
    const timestamp = new Date().toISOString();

    if (SPREADSHEET_ID) {
      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEETS.APP_DATA}!A:C`,
        valueInputOption: 'RAW',
        resource: {
          values: [[timestamp, 'IMPORT', JSON.stringify(importData)]]
        }
      });

      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEETS.SYNC_LOG}!A:D`,
        valueInputOption: 'RAW',
        resource: {
          values: [[timestamp, 'IMPORT', device, 'SUCCESS']]
        }
      });
    }

    res.json({ success: true, data: importData, timestamp });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== LEGACY ENDPOINTS (for backwards compatibility) ==========
// These just return empty arrays/objects since we're using full sync now

app.get('/api/tasks', (req, res) => res.json([]));
app.get('/api/checkins', (req, res) => res.json({}));
app.get('/api/exercises', (req, res) => res.json([]));
app.get('/api/books', (req, res) => res.json([]));
app.get('/api/languages', (req, res) => res.json([]));
app.get('/api/goals', (req, res) => res.json([]));
app.get('/api/reminders', (req, res) => res.json([]));
app.get('/api/screentime', (req, res) => res.json({}));
app.get('/api/youtube', (req, res) => res.json({}));
app.get('/api/streak', (req, res) => res.json({ streak: 0, lastCheckIn: null }));
app.get('/api/settings', (req, res) => res.json({ notifications: true }));

// Start server
initGoogleSheets().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🚀 PersonaDev Server running on http://localhost:${PORT}`);
    console.log(`📊 Spreadsheet ID: ${SPREADSHEET_ID || 'NOT SET'}`);
    console.log(`\n💡 Make sure your .env file has:`);
    console.log(`   GOOGLE_SHEET_ID=your_spreadsheet_id`);
    console.log(`\n📱 Ready for sync requests!\n`);
  });
});
