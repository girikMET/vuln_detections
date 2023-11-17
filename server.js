import { spawn, exec } from 'child_process';
import path from 'path';
import express from 'express';
import { config } from 'dotenv';
import util from 'util'; 
config();
const app = express();
const PORT = process.env.PORT || 3000;
const executeScript = util.promisify(exec);

app.use(express.static(path.join(process.cwd(), 'public')));
app.use(express.json());

app.get('/config', (req, res) => {
  res.json({
    GitHubToken: process.env.GitHubToken
  });
});

function handleRoute(req, res, fileName) {
  res.sendFile(path.join(process.cwd(), 'public', fileName));
}

app.post('/scan-repo', async (req, res) => {
  const { repoUrl } = req.body;
  try {
    const { stdout, stderr } = await executeScript(`python3 trivy_detection.py --repo ${repoUrl}`);
    res.status(200).end();
  } catch (error) {
    console.error(`Error executing the script: ${error}`);
    res.status(500).end();
  }
});

app.get('/:page', (req, res) => {
  const { page } = req.params;

  if (page === 'scan-repo' || page.endsWith('.json')) {
    console.log(page);
  } else {
    handleRoute(req, res, `${page}.html`);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});