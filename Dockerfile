# Using ubuntu as a base image
FROM ubuntu:latest

ENV DEBIAN_FRONTEND=noninteractive

## Installing the Dependencies for project
RUN apt-get update && apt-get install -y python3 python3-pip tzdata git nodejs npm
RUN ln -fs /usr/share/zoneinfo/America/New_York /etc/localtime && dpkg-reconfigure --frontend noninteractive tzdata

# Clone the repository
RUN git clone https://github.com/girikMET/vuln_detections.git /vuln_detections

# Set the working directory inside the container
WORKDIR /vuln_detections

# Install dependencies
RUN npm install package.json

# Expose the required port
EXPOSE 3000

# Command to run the application
CMD ["node", "server.js"]