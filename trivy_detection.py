import os, json, urllib3, pandas as pd, argparse, subprocess
from datetime import timedelta
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

def create_directory_if_not_exists(directory_path):
    if not os.path.exists(directory_path):
        os.makedirs(directory_path)

directory_path = "public/meta/results"
create_directory_if_not_exists(directory_path)

def run_trivy_scan(scan_type, target):
    with open("trivy_scan_results.json", "w+") as trivy_scan_out:
        print(scan_type, target)
        subprocess.Popen(f'trivy -q -f json {scan_type} ' + target, stdout=trivy_scan_out, stderr=None, shell=True).wait()
        subprocess.Popen('jq .Results trivy_scan_results.json > trivy_results.json', stdout=None, stderr=None, shell=True).wait()
    
    if target.startswith("https://github.com/"):
        parts = target.strip('/').split('/')
        username = parts[-2]
        repository = parts[-1]
        target = f"{username}--{repository}"

    fd = open(f'public/meta/results/{target}.csv', 'w+')
    fd.write("VulnerabilityID,Severity,PkgName,PkgPath,InstalledVersion,FixedVersion,PublishedDate,LastModifiedDate\n")
    with open("trivy_results.json") as trivy_csv_fd:
        json_object = json.load(trivy_csv_fd)
        if json_object is not None:
            for vulobject in json_object:
                if 'Vulnerabilities' in vulobject:
                    for typevulobject in vulobject['Vulnerabilities']:
                        output = "{},{},{},{},{},{},{},{}".format(
                            typevulobject.get('VulnerabilityID', 'N/A'),
                            typevulobject.get('Severity', 'N/A'),
                            typevulobject.get('PkgName', 'N/A'),
                            typevulobject.get('PkgPath', 'N/A'),
                            typevulobject.get('InstalledVersion', 'N/A'),
                            typevulobject.get('FixedVersion', 'N/A'),
                            typevulobject.get('PublishedDate', 'N/A'),
                            typevulobject.get('LastModifiedDate', 'N/A')
                        )
                        fd.write(output + "\n")
    fd.close()

parser = argparse.ArgumentParser(description='Parse the Arguments Parameters')
parser.add_argument('--image', default='', required=False)
parser.add_argument('--repo', default='', required=False)
args = parser.parse_args()

if args.image:
    run_trivy_scan('i', args.image)
elif args.repo:
    run_trivy_scan('repo', args.repo)
else:
    print("Please provide either --image or --repo argument.")

for file in os.listdir():
    if file.endswith('.json'):
        os.remove(file)