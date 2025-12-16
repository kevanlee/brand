const express = require('express');
const multer = require('multer');
const AdmZip = require('adm-zip');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });
app.use(express.static('public'));

// Helper to persist the latest dataset for overlap analysis
const saveLatestDataset = (rows, source) => {
  const latestPath = path.join('uploads', `latest-${source}.json`);
  fs.writeFileSync(latestPath, JSON.stringify(rows, null, 2));
  return latestPath;
};

// Helper to load the latest dataset by source
const loadLatestDataset = (source) => {
  const latestPath = path.join('uploads', `latest-${source}.json`);
  if (fs.existsSync(latestPath)) {
    const raw = fs.readFileSync(latestPath, 'utf-8');
    return JSON.parse(raw);
  }
  return null;
};

app.post('/api/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded');

  const filePath = req.file.path;
  const originalName = req.file.originalname.toLowerCase();
  const source = (req.body.source || 'audience').toLowerCase();

  const isSubstackSource = source === 'substack';
  const isCrmSource = source === 'crm';

  if (!isSubstackSource && !isCrmSource) {
    return res.status(400).send('Invalid source. Use "substack" or "crm".');
  }

  const parseCsv = (csvPath) => new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });

  let subscribers = [];

  if (originalName.endsWith('.zip')) {
    const zip = new AdmZip(filePath);
    const csvEntry = zip.getEntries().find(e => /\.csv$/i.test(e.entryName));
    if (!csvEntry) return res.status(400).send('No CSV in ZIP');
    const outPath = path.join('uploads', Date.now() + '-' + csvEntry.entryName);
    fs.writeFileSync(outPath, csvEntry.getData());
    subscribers = await parseCsv(outPath);
    fs.unlinkSync(outPath);
  } else if (originalName.endsWith('.csv')) {
    subscribers = await parseCsv(filePath);
  } else {
    return res.status(400).send('Upload a CSV or ZIP file');
  }

  // ---- Keep only the columns we care about ----
  const allowedKeys = ['email', 'name', 'website', 'company', 'status'];

  // Normalize header matching (handle case differences like "Email" or "EMAIL")
  const filteredRows = subscribers.map(row => {
    const normalizedRow = {};
    for (const key of Object.keys(row)) {
      const lowerKey = key.toLowerCase();
      if (allowedKeys.includes(lowerKey)) {
        normalizedRow[lowerKey] = row[key];
      }
    }
    return normalizedRow;
  });

  // Save only the first 100 rows for now
  const limitedRows = filteredRows.slice(0, 100);
  const outPath = path.join('uploads', `${source}-${Date.now()}.json`);
  fs.writeFileSync(outPath, JSON.stringify(limitedRows, null, 2));

  // Keep a latest pointer for overlap analysis
  saveLatestDataset(limitedRows, source);

  // --- REMINDER ---
  // Only first 100 rows saved for performance.
  // When ready for production, remove `.slice(0, 100)` to capture all rows.

  fs.unlinkSync(filePath);

  res.json({
    source,
    count: filteredRows.length,
    saved: limitedRows.length,
    file: outPath,
    sample: limitedRows.slice(0, 5)
  });
}); // <-- this closing brace was missing!

app.get('/api/overlap', (_req, res) => {
  const substack = loadLatestDataset('substack') || [];
  const crm = loadLatestDataset('crm') || [];

  const substackEmails = new Set(substack.map(r => (r.email || '').toLowerCase()).filter(Boolean));
  const crmEmails = new Set(crm.map(r => (r.email || '').toLowerCase()).filter(Boolean));

  const overlapEmails = [...substackEmails].filter(email => crmEmails.has(email));

  const sampleOverlap = substack
    .filter(r => r.email && overlapEmails.includes(r.email.toLowerCase()))
    .slice(0, 5)
    .map(r => ({
      email: r.email,
      name: r.name || 'Unknown',
      company: r.company || r.website || 'Not provided'
    }));

  const response = {
    substackCount: substack.length,
    crmCount: crm.length,
    overlapCount: overlapEmails.length,
    overlapRate: substackEmails.size ? Math.round((overlapEmails.length / substackEmails.size) * 100) : 0,
    sampleOverlap
  };

  res.json(response);
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
