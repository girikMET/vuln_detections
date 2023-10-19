#!/bin/bash

# Name of the CSV file
file="metrics.csv"

# Initialize CSV headers
echo "Timestamp,Process ID,CPU Utilization (%),Used Memory (MB),Free Memory (MB),RX Packets,TX Packets,%user,%system,tps,kB_read/s,kB_wrtn/s" > $file

while true; do
    # Get the process ID of vulnerabilities_scanner
    pid=$(ps -eaf | grep vulnerabilities_scanner | grep -v grep | awk '{print $2}')

    # If vulnerabilities_scanner is running, collect metrics
    if [ ! -z "$pid" ]; then
        echo "Capturing metrics for vulnerabilities_scanner PID: $pid"

        while [ -e /proc/$pid ]; do
            # Timestamp
            timestamp=$(date +"%Y-%m-%d %H:%M:%S")

            # CPU Utilization
            cpu_util=$(top -b -n 1 | grep "Cpu(s)" | awk '{print $2 + $4}')

            # Memory Usage (assuming you're interested in used and free memory)
            memory_used=$(free -m | grep Mem | awk '{print $3}')
            memory_free=$(free -m | grep Mem | awk '{print $4}')

            # Network details (assuming eth0 as the primary interface, adjust if different)
            rx_packets=$(ifconfig eth0 | grep "RX packets" | awk '{print $2}' | cut -d: -f2)
            tx_packets=$(ifconfig eth0 | grep "TX packets" | awk '{print $2}' | cut -d: -f2)

            # iostat details
            iostat_output=$(iostat -x 1 2 | tail -n 1)
            cpu_user=$(echo $iostat_output | awk '{print $4}')
            cpu_system=$(echo $iostat_output | awk '{print $6}')
            tps=$(echo $iostat_output | awk '{print $2}')
            kb_read_per_sec=$(echo $iostat_output | awk '{print $3}')
            kb_wrtn_per_sec=$(echo $iostat_output | awk '{print $4}')

            # Writing data to CSV
            echo "$timestamp,$pid,$cpu_util,$memory_used,$memory_free,$rx_packets,$tx_packets,$cpu_user,$cpu_system,$tps,$kb_read_per_sec,$kb_wrtn_per_sec" >> $file

            # Wait for 1 second before collecting metrics again
            sleep 1
        done

    else
        echo "vulnerabilities_scanner is not running. Checking again in 1 seconds."
        sleep 1
    fi
done