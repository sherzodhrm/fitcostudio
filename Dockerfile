FROM node:20-slim
WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose the standard Cloud Run port
EXPOSE 3000

# Start the Express server
CMD ["npm", "start"]
