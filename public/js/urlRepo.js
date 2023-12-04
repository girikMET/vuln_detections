const urlParameters = new URLSearchParams(window.location.search);
const repoPath = urlParameters.get('path');

if (repoPath) {
   const repoName = repoPath.split('/')[0];
   const repoSource = repoPath.split('/')[1].split('.')[0];
   const scanTitle = document.getElementById('scanTitle');
   scanTitle.innerHTML = `Vulnerability Scan Results - <a style="color: bule;">${repoName}/${repoSource}</a>`;
} else {
   console.error('Path parameter is missing.');
}