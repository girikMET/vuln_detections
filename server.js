import path from 'path';
import util from 'util';
import express from 'express';
import { config } from 'dotenv';
import fetch from 'node-fetch';
import validator from 'validator';
import { spawn, exec } from 'child_process';
const pathToEnv = path.resolve('./', '.env');
config({ path: pathToEnv });
const app = express();
const PORT = process.env.PORT || 3000;
const executeScript = util.promisify(exec);
app.use(express.static(path.join(process.cwd(), 'public')));
app.use(express.json());

app.get('/check-repo', async (req, res) => {
  const repositoryUrl = req.query.url;
  const apiUrl = `https://api.github.com/repos/${repositoryUrl}`;
  try {
     const response = await fetch(apiUrl, {
        headers: {
           'Authorization': `token ${process.env.GitHubToken}`
        }
     });
     if (response.ok) {
        res.json({
           exists: true
        });
     } else {
        res.json({
           exists: false
        });
     }
  } catch (error) {
     res.status(500).json({
        error: 'Internal Server Error'
     });
  }
});

function handleRoute(req, res, fileName) {
  res.sendFile(path.join(process.cwd(), 'public', fileName));
}

app.post('/scan-repo', async (req, res) => {
  const {
     repoUrl
  } = req.body;
  try {
     const {
        stdout,
        stderr
     } = await executeScript(`python3 trivy_detection.py --repo ${repoUrl}`);
     res.status(200).end();
  } catch (error) {
     console.error(`Error executing the script: ${error}`);
     res.status(500).end();
  }
});

app.post('/scan-image', async (req, res) => {
  const {
     imageUrl
  } = req.body;
  const sanitizedImageUrl = validator.escape(imageUrl);
  try {
     const {
        stdout,
        stderr
     } = await executeScript(`python3 trivy_detection.py --image ${sanitizedImageUrl}`);
     res.status(200).end();
  } catch (error) {
     console.error(`Error executing the script: ${error}`);
     res.status(500).end();
  }
});

app.get('/:page', (req, res) => {
  const {
     page
  } = req.params;
  if (page === 'scan-repo' || page.endsWith('.json')) {} else {
     handleRoute(req, res, `${page}.html`);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});