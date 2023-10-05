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
  const domain_name = 'trivy.dev';  // Define your domain name here
  const context = { domain_name };  
  handleRoute(req, res, `${page}.html`, context);
});

// app.get('/hello', (req, res) => {
//   const pythonProcess = spawn('python3', ['hello.py']);

//   pythonProcess.stdout.on('data', (data) => {
//     res.send(`Python script output: ${data}`);
//   });

//   pythonProcess.stderr.on('data', (data) => {
//     res.status(500).send(`Error from Python script: ${data}`);
//   });

//   pythonProcess.on('close', (code) => {
//     console.log(`Python script exited with code ${code}`);
//   });
// });

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});