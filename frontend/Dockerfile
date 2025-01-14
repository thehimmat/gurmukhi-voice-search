# Development stage
FROM node:latest as development
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ENV NODE_ENV=development
CMD ["npm", "start"]

# Production stage (if needed)
FROM node:latest as production
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
RUN npm run build 