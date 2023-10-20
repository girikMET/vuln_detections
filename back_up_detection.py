import os, json, urllib3, pandas as pd, argparse, subprocess
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
        subprocess.Popen(f'trivy --ignore-unfixed -q -f json {scan_type} ' + target, stdout=trivy_scan_out, stderr=None, shell=True).wait()
        subprocess.Popen(f'jq .Results trivy_scan_results.json > public/meta/results/{directory}/{filename}.json', stdout=None, stderr=None, shell=True).wait()

    fd = open(f'public/meta/results/{directory}/{filename}.csv', 'w+')
    fd.write("VulnerabilityID,Severity,PkgName,PkgPath,InstalledVersion,FixedVersion,PublishedDate,LastModifiedDate\n")

    with open(f'public/meta/results/{directory}/{filename}.json') as trivy_csv_fd:
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
        print(f"please check provided gitHub repository url is wrong")

elif args.image:
    create_directory_if_not_exists(f'public/meta/results/{args.image}')
    run_trivy_scan('i', args.image, args.image, args.image)

else:
    print("Please provide either --image or --repo argument.")

for file in os.listdir():
    if file.endswith('results.json'):
        os.remove(file)