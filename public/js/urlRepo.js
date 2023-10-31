const urlParameters = new URLSearchParams(window.location.search);
const repoPath = urlParameters.get('path');

if (repoPath) {
   const repoName = repoPath.split('/')[0];
   const repoSource = repoPath.split('/')[1].split('.')[0];
   const scanTitle = document.getElementById('scanTitle');
   scanTitle.innerHTML = `Vulnerability Scan Results for Repository - <a href="https://github.com/${repoName}/${repoSource}" target="_blank" style="color: bule;">https://github.com/${repoName}/${repoSource}</a>`;
} else {
   console.error('Path parameter is missing.');
}