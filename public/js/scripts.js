function showNotImplementedMessage() {
    event.preventDefault();
    alert("File System Scanning feature is still in progress and has not been implemented yet. Please check back later for updates.");
}
document.addEventListener('DOMContentLoaded', function() {
    const repositoryUrlInput = document.getElementById('githubUrl');
    const generateReportBtn = document.getElementById('generateReportBtn');
    generateReportBtn.disabled = true;
    repositoryUrlInput.addEventListener('input', function() {
        const isValidUrl = validateRepositoryUrl(repositoryUrlInput.value);
        generateReportBtn.disabled = !isValidUrl;
        generateReportBtn.value = isValidUrl ? 'Validate' : 'Submit';
    });

    function validateRepositoryUrl(url) {
        const regex = /^(https?:\/\/)?(www\.)?github\.com\/[^\s\/]+\/[^\s\/]+$/;
        return regex.test(url);
    }
    let isFormSubmitted = false;
    document.getElementById('repositoryForm').addEventListener('submit', async function(e) {
        if (!isFormSubmitted) {
            e.preventDefault();
            const repositoryUrl = repositoryUrlInput.value;
            const isValidUrl = validateRepositoryUrl(repositoryUrl);
            if (isValidUrl) {
                await checkRepositoryExists(repositoryUrl);
            } else {
                alert('Invalid repository URL');
            }
        } else {
            isFormSubmitted = false;
        }
    });
    async function checkRepositoryExists(repositoryUrl) {
        const strippedUrl = repositoryUrl.replace(/^(https?:\/\/)?(www\.)?github\.com\//, '');
        const apiUrl = `https://api.github.com/repos/${strippedUrl}`;
        try {
            const response = await fetch(apiUrl);
            if (response.ok) {
                generateReportBtn.disabled = false;
                generateReportBtn.value = 'Submit';
                isFormSubmitted = false;
                alert('The entered repository exist, please proceed further');
                window.location.href = '/scan_results';
                const response = await fetch('/validate-repo', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        repoUrl: repositoryUrl,
                    }),
                });
                if (response.ok) {
                    const result = await response.json();
                    console.log('Validation successful:', result);
                }
            } else {
                console.log('Repository does not exist:', repositoryUrl);
                generateReportBtn.value = 'Validate';
                alert('The repository does not exist.');
            }
        } catch (error) {
            console.error('Error checking repository:', error);
            // alert('An error occurred while checking the repository. Please try again later.');
        }
    }
});