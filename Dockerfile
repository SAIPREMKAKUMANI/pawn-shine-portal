# Stage 1: Build the frontend application
FROM node:20-alpine AS builder

WORKDIR /app

# Increase Node.js memory limit for the build (prevents OOM on small instances)
ENV NODE_OPTIONS="--max-old-space-size=1024"

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm ci || npm install

# Copy source code and build the application
COPY . .
RUN npm run build

# Stage 2: Serve the application using Nginx
FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy the custom nginx configuration file
COPY nginx-ui.conf /etc/nginx/conf.d/default.conf

# Copy the built assets from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose ports 80 (HTTP) and 443 (HTTPS)
EXPOSE 80 443


# Run nginx
CMD ["nginx", "-g", "daemon off;"]
