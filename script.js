const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'visits.json');

// Middleware to parse JSON bodies
app.use(express.json());

// Function to read the visits data
async function readVisits() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist or is empty, return an empty object
    return {};
  }
}

// Function to write the visits data
async function writeVisits(visits) {
  await fs.writeFile(DATA_FILE, JSON.stringify(visits, null, 2));
}

// Endpoint to track a visit
app.post('/track-visit', async (req, res) => {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const visits = await readVisits();

  if (!visits[today]) {
    visits[today] = 0;
  }
  visits[today]++;

  await writeVisits(visits);
  res.json({ success: true, visits: visits[today] });
});

// Endpoint to get all visits
app.get('/visits', async (req, res) => {
  const visits = await readVisits();
  res.json(visits);
});

// Endpoint to get visits for a specific date
app.get('/visits/:date', async (req, res) => {
  const { date } = req.params;
  const visits = await readVisits();
  res.json({ date, visits: visits[date] || 0 });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});