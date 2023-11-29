import os
import json
import urllib3
import argparse
import subprocess
from datetime import timedelta
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

parser = argparse.ArgumentParser(description='Parse the Arguments Parameters')
parser.add_argument('--image')
parser.add_argument('--repo')
args = parser.parse_args()

def create_directory_if_not_exists(directory_path):
    if not os.path.exists(directory_path):
        os.makedirs(directory_path)

def run_trivy_scan(scan_type, target, directory, filename):
    with open("trivy_scan_results.json", "w+") as trivy_scan_out:
        subprocess.Popen(f'trivy -q -f json {scan_type} ' + target, stdout=trivy_scan_out, stderr=None, shell=True).wait()
        subprocess.Popen(f'jq .Results trivy_scan_results.json > public/meta/results/{directory}/{filename}.json', stdout=None, stderr=None, shell=True).wait()
    filtered_results = []
    with open(f'public/meta/results/{directory}/{filename}.json') as trivy_csv_fd:
        json_object = json.load(trivy_csv_fd)
        if json_object is not None:
            for vulobject in json_object:
                if 'Vulnerabilities' in vulobject:
                    for typevulobject in vulobject['Vulnerabilities']:
                        filtered_vulnerability = {
                            'VulnerabilityID': typevulobject.get('VulnerabilityID', 'N/A'),
                            'Severity': typevulobject.get('Severity', 'N/A'),
                            'PkgName': typevulobject.get('PkgName', 'N/A'),
                            'InstalledVersion': typevulobject.get('InstalledVersion', 'N/A'),
                            'FixedVersion': typevulobject.get('FixedVersion', 'N/A'),
                            'PublishedDate': typevulobject.get('PublishedDate', 'N/A'),
                            'LastModifiedDate': typevulobject.get('LastModifiedDate', 'N/A')
                        }
                        filtered_results.append(filtered_vulnerability)

    with open(f'public/meta/results/{directory}/{filename}.json', 'w') as filtered_json_fd:
        json.dump(filtered_results, filtered_json_fd, indent=2)

    with open(f'public/meta/results/{directory}/{filename}.csv', 'w') as fd:
        fd.write("VulnerabilityID,Severity,PkgName,InstalledVersion,FixedVersion,PublishedDate,LastModifiedDate\n")
        for filtered_vulnerability in filtered_results:
            output = "{},{},{},{},{},{},{}".format(
                filtered_vulnerability['VulnerabilityID'],
                filtered_vulnerability['Severity'],
                filtered_vulnerability['PkgName'],
                filtered_vulnerability['InstalledVersion'],
                filtered_vulnerability['FixedVersion'],
                filtered_vulnerability['PublishedDate'],
                filtered_vulnerability['LastModifiedDate']
            )
            fd.write(output + "\n")

create_directory_if_not_exists(f'public/meta/results')
if args.repo:
    repo_url = args.repo
    if repo_url.startswith("https://github.com/"):
            parts = repo_url.strip('/').split('/')
            directory = parts[-2]
            filename = parts[-1]
            create_directory_if_not_exists(f'public/meta/results/{directory}')
            run_trivy_scan('repo', repo_url, directory, filename)
    else:
        print(f"Please check the provided GitHub repository URL is wrong.")
elif args.image:
    parts = args.image.split(":")
    if len(parts) == 2:
        dir_name, filename = parts[0], parts[1]
    else:
        dir_name = parts[0]
        filename = "latest"
    create_directory_if_not_exists(f'public/meta/results/{dir_name}')
    run_trivy_scan('i', args.image, dir_name, filename)

else:
    print("Please provide either --image or --repo argument.")

for file in os.listdir():
    if file.endswith('results.json'):
        os.remove(file)