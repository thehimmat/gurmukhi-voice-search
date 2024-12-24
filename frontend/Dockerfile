FROM node:16-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy the rest of the application
COPY . .

# Start the development server instead of building
CMD ["npm", "start"] 