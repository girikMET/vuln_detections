#include <iostream>
#include <fstream>
#include <sstream>
#include <vector>
#include <sys/stat.h>
#include <unistd.h>
#include <cstdio>
#include <jsoncpp/json/json.h>
#include <boost/algorithm/string/split.hpp>
#include <boost/algorithm/string/classification.hpp>

using namespace std;

class TrivyScanner {
  private: void create_directory_if_not_exists(const string & directory_path) {
    struct stat st {};
    if (stat(directory_path.c_str(), & st) == -1) {
      mkdir(directory_path.c_str(), 0700);
    }
  }

  void run_trivy_scan(const string & scan_type,
    const string & target,
      const string & directory,
        const string & filename) {
    string command = "trivy -q -f json " + scan_type + " " + target + " > trivy_scan_results.json";
    system(command.c_str());

    command = "jq .Results trivy_scan_results.json > results/" + directory + "/" + filename + ".json";
    system(command.c_str());

    ifstream trivy_csv_fd("results/" + directory + "/" + filename + ".json");
    Json::Value jsonObj;
    trivy_csv_fd >> jsonObj;

    ofstream fd;
    fd.open("results/" + directory + "/" + filename + ".csv");
    fd << "VulnerabilityID,Severity,PkgName,InstalledVersion,FixedVersion,PublishedDate,LastModifiedDate\n";

    if (!jsonObj.isNull()) {
      for (const auto & vulobject: jsonObj) {
        if (vulobject.isMember("Vulnerabilities")) {
          for (const auto & typevulobject: vulobject["Vulnerabilities"]) {
            fd << typevulobject["VulnerabilityID"].asString() << "," <<
              typevulobject["Severity"].asString() << "," <<
              typevulobject["PkgName"].asString() << "," <<
              typevulobject["InstalledVersion"].asString() << "," <<
              typevulobject["FixedVersion"].asString() << "," <<
              typevulobject["PublishedDate"].asString() << "," <<
              typevulobject["LastModifiedDate"].asString() << "\n";
          }
        }
      }
    }
    fd.close();
  }

  public: void scan(const string & repo,
    const string & image) {
    create_directory_if_not_exists("results");

    if (!repo.empty()) {
      if (repo.find("https://github.com/") != string::npos) {
        vector < string > parts;
        boost::split(parts, repo, boost::is_any_of("/"));

        if (parts.size() >= 2) {
          string directory = parts[parts.size() - 2];
          string filename = parts[parts.size() - 1];
          create_directory_if_not_exists("results/" + directory);
          run_trivy_scan("repo", repo, directory, filename);
        }
      } else {
        cout << "Please check provided gitHub repository url is wrong" << endl;
      }
    } else if (!image.empty()) {
      vector < string > image_parts;
      boost::split(image_parts, image, boost::is_any_of(":"));

      string image_name;
      string image_tag;

      if (image_parts.size() == 2) {
        image_name = image_parts[0];
        image_tag = image_parts[1];
      } else {
        image_name = image;
        image_tag = "latest"; // default tag
      }

      string directory_path = "results/" + image_name;
      create_directory_if_not_exists(directory_path);
      run_trivy_scan("i", image, image_name, image_tag);
    } else {
      cout << "Please provide either --image or --repo argument." << endl;
    }
    remove("trivy_scan_results.json");
  }
};

int main(int argc, char * argv[]) {
  string repo_arg, image_arg;

  for (int i = 1; i < argc; i++) {
    if (string(argv[i]) == "--image" && i + 1 < argc) {
      image_arg = argv[i + 1];
    }
    if (string(argv[i]) == "--repo" && i + 1 < argc) {
      repo_arg = argv[i + 1];
    }
  }

  TrivyScanner scanner;
  scanner.scan(repo_arg, image_arg);
  return 0;
}