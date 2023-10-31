const {
  spawn,
  exec
} = require('child_process');
const path = require('path');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
require('dotenv').config();
app.get('/config', (req, res) => {
  res.json({
     GitHubToken: process.env.GitHubToken
  });
});

function handleRoute(req, res, fileName) {
  res.sendFile(path.join(__dirname, 'public', fileName));
}

app.post('/scan-repo', (req, res) => {
  const {
     repoUrl
  } = req.body;
  const executeScript = () => {
     return new Promise((resolve, reject) => {
        exec(`python3 trivy_detection.py --repo ${repoUrl}`, (error, stdout, stderr) => {
           if (error) {
              console.error(`Error executing the script: ${error}`);
              reject();
           } else {
              resolve();
           }
        });
     });
  };
  executeScript()
     .then(() => {
        res.status(200).end();
     })
     .catch(() => {
        res.status(500).end();
     });
});

app.get('/:page', (req, res) => {
  const page = req.params.page;
  if (page == 'scan-repo' || page.endsWith == '.json') {
     console.log(page);
  } else {
     handleRoute(req, res, `${page}.html`);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});