const express = require('express');
const multer = require('multer');
const AdmZip = require('adm-zip');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });
app.use(express.static('public'));

app.post('/api/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded');

  const filePath = req.file.path;
  const originalName = req.file.originalname.toLowerCase();

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
  const allowedKeys = ['email', 'name', 'website'];

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
  const outPath = path.join('uploads', `subscribers-${Date.now()}.json`);
  fs.writeFileSync(outPath, JSON.stringify(limitedRows, null, 2));

  // --- REMINDER ---
  // Only first 100 rows saved for performance.
  // When ready for production, remove `.slice(0, 100)` to capture all rows.

  fs.unlinkSync(filePath);

  res.json({
    count: filteredRows.length,
    saved: limitedRows.length,
    file: outPath,
    sample: limitedRows.slice(0, 5)
  });
}); // <-- this closing brace was missing!

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
