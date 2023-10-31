function showNotImplementedMessage() {
    event.preventDefault();
    alert("File System Scanning feature is still in progress and has not been implemented yet. Please check back later for updates.");
 }
 document.addEventListener('DOMContentLoaded', function () {
    const repositoryUrlInput = document.getElementById('githubUrl');
    const generateReportBtn = document.getElementById('generateReportBtn');
    if (generateReportBtn) {
       generateReportBtn.disabled = true;
 
       if (repositoryUrlInput) {
          repositoryUrlInput.addEventListener('input', function () {
             const isValidUrl = validateRepositoryUrl(repositoryUrlInput.value);
             generateReportBtn.disabled = !isValidUrl;
             generateReportBtn.value = isValidUrl ? 'Validate' : 'Submit';
          });
       }
    }
 
    function validateRepositoryUrl(url) {
       const regex = /^(https?:\/\/)?(www\.)?github\.com\/[^\s\/]+\/[^\s\/]+$/;
       return regex.test(url);
    }
 
    let isFormSubmitted = false;
    const repositoryForm = document.getElementById('repositoryForm');
    if (repositoryForm) {
       repositoryForm.addEventListener('submit', async function (e) {
          e.preventDefault();
 
          // Disable the button
          generateReportBtn.disabled = true;
 
          // Show a loading message
          const loadingMessage = document.createElement('div');
          loadingMessage.id = 'loadingMessage';
          loadingMessage.innerText = 'Loading... Please wait.';
          loadingMessage.style.color = 'white';
          document.body.appendChild(loadingMessage);
 
          const repositoryUrl = repositoryUrlInput ? repositoryUrlInput.value : '';
          const isValidUrl = validateRepositoryUrl(repositoryUrl);
          if (!isValidUrl) {
             alert('Invalid repository URL');
             return;
          }
 
          if (generateReportBtn.value === 'Validate') {
             await checkRepositoryExists(repositoryUrl);
          } else if (generateReportBtn.value === 'Submit') {
             await scanRepo(repositoryUrl);
          }
 
          // Remove the loading message
          if (document.getElementById('loadingMessage')) {
             document.body.removeChild(loadingMessage);
          }
 
          // Re-enable the button
          generateReportBtn.disabled = false;
       });
    }
 
    async function checkRepositoryExists(repositoryUrl) {
       let personalAccessToken;
       try {
          const tokenResponse = await fetch('/config');
          const config = await tokenResponse.json();
          personalAccessToken = config.GitHubToken;
       } catch (error) {
          console.error('Error fetching token:', error);
          return;
       }
       const strippedUrl = repositoryUrl.replace(/^(https?:\/\/)?(www\.)?github\.com\//, '');
       const apiUrl = `https://api.github.com/repos/${strippedUrl}`;
       try {
          const response = await fetch(apiUrl, {
             headers: {
                'Authorization': `token ${personalAccessToken.trim()}`
             }
          });
          console.log(response);
          if (response.ok) {
             if (generateReportBtn) {
                generateReportBtn.disabled = false;
                generateReportBtn.value = 'Submit';
             }
             alert('The entered repository exists, please proceed further.');
          } else {
             if (generateReportBtn) {
                generateReportBtn.value = 'Validate';
             }
             console.log('Entered Repository does not exist:', repositoryUrl);
             alert('Entered Repository does not exist: ' + repositoryUrl);
          }
       } catch (error) {
          console.error('Error checking repository:', error);
       }
    }
    async function scanRepo(repositoryUrl) {
       const strippedUrl = repositoryUrl.replace(/^(https?:\/\/)?(www\.)?github\.com\//, '');
       var destinationURL = '/scan_results?path=' + strippedUrl + '.json';
 
       const response = await fetch('/scan-repo', {
          method: 'POST',
          headers: {
             'Content-Type': 'application/json',
          },
          body: JSON.stringify({
             repoUrl: repositoryUrl,
          }),
       });
       if (response.status === 200) {
          window.location.href = destinationURL;
       } else {
          console.error('Failed to scan repo. Status:', response.status);
       }
    }
 });