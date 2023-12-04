document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('imageScanningForm');
    form.addEventListener('submit', function (event) {
       event.preventDefault();
       const imageUrl = document.getElementById('containerImageUrl').value;
       if (!isValidContainerImageUrl(imageUrl)) {
          alert('Invalid container image URL. Please enter a valid URL.');
          return;
       }
       let parts = imageUrl.split(':');
       let dirName = parts[0];
       let fileName = parts.length > 1 ? parts[1] : 'latest';
       let destinationURL = '/scanResults?path=' + dirName + '/' + fileName + '.json';
 
       fetch('/scan-image', {
             method: 'POST',
             headers: {
                'Content-Type': 'application/json',
             },
             body: JSON.stringify({
                imageUrl: imageUrl
             }),
          })
          .then(response => {
             if (response.status === 200) {
                window.location.href = destinationURL;
             } else {
                console.error('Failed to scan image. Status:', response.status);
                return response.json();
             }
          })
          .then(data => {
             if (data) {
                document.getElementById('imageScanResult').textContent = JSON.stringify(data);
             }
          })
          .catch(error => console.error('Error:', error));
    });
 });
 
 function isValidContainerImageUrl(url) {
    const regex = /^[a-zA-Z0-9]+(?:[\/._-][a-zA-Z0-9]+)*(:[a-zA-Z0-9]+)?$/;
    return regex.test(url);
 }