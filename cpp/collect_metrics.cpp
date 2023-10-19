#include <iostream>
#include <fstream>
#include <unistd.h>
#include <vector>
#include <sstream>
#include <ctime>
#include <sys/stat.h>
#include <sys/types.h>

std::string exec(const char* cmd) {
    char buffer[128];
    std::string result = "";
    FILE* pipe = popen(cmd, "r");
    if (!pipe) throw std::runtime_error("popen() failed!");
    while (fgets(buffer, sizeof(buffer), pipe) != NULL) {
        result += buffer;
    }
    pclose(pipe);
    return result;
}

int main() {
    // Name of the CSV file
    std::string file = "metrics.csv";

    // Initialize CSV headers
    std::ofstream csv_file(file);
    csv_file << "Timestamp,Process ID,CPU Utilization (%),Used Memory (MB),Free Memory (MB),RX Packets,TX Packets,%user,%system,tps,kB_read/s,kB_wrtn/s\n";
    csv_file.close();

    while (true) {
        std::string pid = exec("pidof vulnerabilities_scanner");

        // If vulnerabilities_scanner is running, collect metrics
        if (!pid.empty()) {
            std::cout << "Capturing metrics for vulnerabilities_scanner PID: " << pid << std::endl;

            while (access(("/proc/" + pid).c_str(), F_OK) == 0) {
                // Timestamp
                auto t = std::time(nullptr);
                auto tm = *std::localtime(&t);
                // std::ostringstream timestamp;
                // timestamp << std::put_time(&tm, "%Y-%m-%d %H:%M:%S");
                char timestamp_str[100];
                strftime(timestamp_str, sizeof(timestamp_str), "%Y-%m-%d %H:%M:%S", &tm);
                std::string timestamp(timestamp_str);


                // CPU Utilization
                std::string cpu_util = exec("top -b -n 1 | grep 'Cpu(s)' | awk '{print $2 + $4}'");

                // Memory Usage
                std::string memory_used = exec("free -m | grep Mem | awk '{print $3}'");
                std::string memory_free = exec("free -m | grep Mem | awk '{print $4}'");

                // Network details
                std::string rx_packets = exec("ifconfig eth0 | grep 'RX packets' | awk '{print $2}' | cut -d: -f2");
                std::string tx_packets = exec("ifconfig eth0 | grep 'TX packets' | awk '{print $2}' | cut -d: -f2");

                // iostat details
                std::vector<std::string> iostat_values;
                std::string iostat_output = exec("iostat -x 1 2 | tail -n 1");
                std::istringstream iss(iostat_output);
                for (std::string s; iss >> s; )
                    iostat_values.push_back(s);

                // Writing data to CSV
                std::ofstream csv_file(file, std::ios::app);
                csv_file << timestamp << "," << pid << "," << cpu_util << "," << memory_used << "," << memory_free << "," << rx_packets << "," << tx_packets;
                for (const auto& val : iostat_values)
                    csv_file << "," << val;
                csv_file << "\n";
                csv_file.close();

                // Wait for 1 second before collecting metrics again
                sleep(1);
            }

        } else {
            std::cout << "vulnerabilities_scanner is not running. Checking again in 1 seconds." << std::endl;
            sleep(1);
        }
    }

    return 0;
}