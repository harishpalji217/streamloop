FROM node:20-bookworm-slim

# Install system dependencies including FFmpeg
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files and prisma directory first
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies (will run prisma generate automatically via postinstall)
RUN npm install

# Copy application source code
COPY . .

# Ensure upload directory exists
RUN mkdir -p /app/public/uploads

# Build the Next.js application
RUN npm run build

EXPOSE 10000

ENV PORT=10000
ENV NODE_ENV=production

# On container start: push database schema and start Next.js
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && npm start -- -p 10000"]
