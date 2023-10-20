function loadVulnerabilityData(json_file_path) {
    fetch(json_file_path)
        .then(response => response.json())
        .then(data => {
            const tableBody = document.querySelector('#vulnerabilityTable tbody');
            data.forEach(item => {
                const row = document.createElement('tr');
                
                // Highlight rows based on severity
                if(item.Severity === 'CRITICAL') {
                    row.style.backgroundColor = '#ffcccc'; // red
                } else if(item.Severity === 'HIGH') {
                    row.style.backgroundColor = '#fffccc'; // orange
                }

                row.innerHTML = `
                    <td><a href="https://cve.mitre.org/cgi-bin/cvename.cgi?name=${item.VulnerabilityID}" target="_blank">${item.VulnerabilityID}</a></td>
                    <td>${item.Severity}</td>
                    <td>${item.PkgName}</td>
                    <td>${item.PkgPath}</td>
                    <td>${item.InstalledVersion}</td>
                    <td>${item.FixedVersion}</td>
                    <td>${item.PublishedDate}</td>
                    <td>${item.LastModifiedDate}</td>
                `;
                tableBody.appendChild(row);
            });
            const headers = document.querySelectorAll('#vulnerabilityTable th');
            headers.forEach(header => header.addEventListener('click', handleSortClick));
        })
        .catch(error => {
            console.error('Error fetching JSON data:', error);
        });
}

function handleSortClick(event) {
    const column = event.target.dataset.column;
    const order = event.target.dataset.order || 'asc';
    sortTable(column, order);
    if (order === 'asc') {
        event.target.dataset.order = 'desc';
    } else {
        event.target.dataset.order = 'asc';
    }
}

function sortTable(column, order) {
    const tableBody = document.querySelector('#vulnerabilityTable tbody');
    const rows = Array.from(tableBody.querySelectorAll('tr'));
    rows.sort((a, b) => {
        const cellA = a.querySelector(`td:nth-child(${column})`).textContent;
        const cellB = b.querySelector(`td:nth-child(${column})`).textContent;
        if(order === 'asc') {
            return cellA > cellB ? 1 : -1;
        } else {
            return cellA < cellB ? 1 : -1;
        }
    });
    rows.forEach(row => tableBody.appendChild(row));
}

const urlParams = new URLSearchParams(window.location.search);
const path = urlParams.get('path');
json_file_path = 'meta/results/' + path;

if (json_file_path) {
    loadVulnerabilityData(json_file_path);
} else {
    console.error('Path parameter is missing.');
}