const { spawn, exec } = require('child_process');
const path = require('path');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

function handleRoute(req, res, fileName) {
  res.sendFile(path.join(__dirname, 'public', fileName));
}

app.post('/validate-repo', (req, res) => {
  const { repoUrl } = req.body;
    exec(`python3 trivy_detection.py --repo ${repoUrl}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing the script: ${error}`);
        res.status(500).send('Internal Server Error');
        return;
      }
    });
});

app.get('/check-url', (req, res) => {
  const url = req.query.url;
  const validUrl = require('valid-url');
  if (validUrl.isUri(url) && url.startsWith('https://github.com/')) {
      res.json({ message: 'Valid GitHub Repository URL' });
  } else {
      res.json({ message: 'Invalid GitHub Repository URL' });
  }
});

app.get('/:page', (req, res) => {
  const page = req.params.page;
  if (page == 'validate-repo') {
    console.log(page);
  } else {
    handleRoute(req, res, `${page}.html`);
  }  
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});