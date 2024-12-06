FROM node:20-alpine

WORKDIR /app

# Install curl for healthcheck
RUN apk add --no-cache curl

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the code
COPY . .

# Build the frontend
RUN npm run build

# Expose the port
EXPOSE 8081

# Create a health check endpoint
RUN echo '{"status":"healthy"}' > /app/health.json

# Start the server
CMD ["npm", "start"]