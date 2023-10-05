const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.static(path.join(__dirname, 'public')));

function handleRoute(req, res, fileName) {
  res.sendFile(path.join(__dirname, 'public', fileName));
}

app.get('/:page', (req, res) => {
  const page = req.params.page;
  handleRoute(req, res, `${page}.html`, context);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});