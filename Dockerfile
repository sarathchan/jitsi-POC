# Use an official Node.js runtime as a parent image
FROM node:16

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install app dependencies
RUN npm install

# Bundle app source code inside the Docker image
COPY . .

# Expose ports for both the Express and WebSocket servers
EXPOSE 5000 8090

# Define environment variables
ENV NODE_ENV=production

# Copy the start script
COPY start.sh /usr/src/app/start.sh
RUN chmod +x /usr/src/app/start.sh

# Run the start.sh script to launch both apps
CMD ["./start.sh"]
