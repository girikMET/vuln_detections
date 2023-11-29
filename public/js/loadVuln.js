export function loadVulnerabilityData(json_file_path) {
   fetch(json_file_path)
      .then(response => response.json())
      .then(data => {
         const container = document.querySelector('.container_giri');
         if (!data || (Array.isArray(data) && data.length === 0)) {
            const noVulnerabilitiesMessage = document.createElement('p');
            noVulnerabilitiesMessage.textContent = 'No vulnerabilities detected in this repository.';
            noVulnerabilitiesMessage.style.color = 'black';
            const containerDiv = document.createElement('div');
            containerDiv.className = 'container_giri';
            containerDiv.style.zIndex = '2';
            containerDiv.style.backgroundColor = 'white';
            container.appendChild(containerDiv);
            containerDiv.appendChild(noVulnerabilitiesMessage);
            containerDiv.appendChild(document.createElement('table')).id = 'vulnerabilityTable';
         } else {
            const table = document.createElement('table');
            table.id = 'vulnerabilityTable';
            table.className = 'table';
            const thead = document.createElement('thead');
            const trHead = document.createElement('tr');
            const thArray = [
               'Vulnerability ID', 'Severity', 'Package Name',
               'Installed Version', 'Fixed Version', 'Published Date', 'Last Modified Date'
            ];
            thArray.forEach((columnTitle, index) => {
               const th = document.createElement('th');
               th.textContent = columnTitle;
               th.dataset.column = (index + 1).toString();
               trHead.appendChild(th);
            });
            thead.appendChild(trHead);
            table.appendChild(thead);
            const tableBody = document.createElement('tbody');
            data.forEach(item => {
               const row = document.createElement('tr');
               // Highlight rows based on severity
               if (item.Severity === 'CRITICAL') {
                  row.style.backgroundColor = '#ffcccc';
               } else if (item.Severity === 'HIGH') {
                  row.style.backgroundColor = '#fffccc';
               } else if (item.Severity === 'MEDIUM') {
                  row.style.backgroundColor = '#ccffff';
               }
               const columnMapping = {
                  'Vulnerability ID': 'VulnerabilityID',
                  'Severity': 'Severity',
                  'Package Name': 'PkgName',
                  'Installed Version': 'InstalledVersion',
                  'Fixed Version': 'FixedVersion',
                  'Published Date': 'PublishedDate',
                  'Last Modified Date': 'LastModifiedDate'
               };
               thArray.forEach((columnTitle, index) => {
                  const td = document.createElement('td');
                  if (columnTitle === 'Vulnerability ID') {
                     td.textContent = item[columnMapping[columnTitle]];
                     td.style.color = 'blue';
                     td.style.cursor = "pointer"; // make it appear clickable
                     td.addEventListener('click', function () {
                        openLinkSelectionDialog(item[columnMapping[columnTitle]]);
                     });
                  } else {
                     td.textContent = item[columnMapping[columnTitle]];
                  }
                  row.appendChild(td);
               });
               tableBody.appendChild(row);
            });
            table.appendChild(tableBody);
            container.appendChild(table);
            const headers = document.querySelectorAll('#vulnerabilityTable th');
            headers.forEach(header => header.addEventListener('click', handleSortClick));
         }
      })
      .catch(error => {
         console.error('Error fetching JSON data:', error);
      });
}

export function openLinkSelectionDialog(vulnerabilityId) {
   const choice = confirm("Open in NVD? Click 'Cancel' for Mitre.");
   if (choice) {
      window.open(`https://nvd.nist.gov/vuln/detail/${vulnerabilityId}`, "_blank");
   } else {
      window.open(`https://cve.mitre.org/cgi-bin/cvename.cgi?name=${vulnerabilityId}`, "_blank");
   }
}

export function handleSortClick(event) {
   const column = event.target.dataset.column;
   const order = event.target.dataset.order || 'asc';
   sortTable(column, order);
   if (order === 'asc') {
      event.target.dataset.order = 'desc';
   } else {
      event.target.dataset.order = 'asc';
   }
}

export function sortTable(column, order) {
   const tableBody = document.querySelector('#vulnerabilityTable tbody');
   const rows = Array.from(tableBody.querySelectorAll('tr'));
   rows.sort((a, b) => {
      const cellA = a.querySelector(`td:nth-child(${column})`).textContent;
      const cellB = b.querySelector(`td:nth-child(${column})`).textContent;
      if (order === 'asc') {
         return cellA > cellB ? 1 : -1;
      } else {
         return cellA < cellB ? 1 : -1;
      }
   });
   rows.forEach(row => tableBody.appendChild(row));
}

export function initialize() {
   const urlParams = new URLSearchParams(window.location.search);
   const path = urlParams.get('path');
   const jsonFilePath = path ? `meta/results/${path}` : null;

   if (jsonFilePath) {
      loadVulnerabilityData(jsonFilePath);
   } else {
      console.error('Path parameter is missing.');
   }
}