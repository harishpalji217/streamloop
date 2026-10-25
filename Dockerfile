FROM node:20-bookworm-slim

# Install system dependencies including FFmpeg
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV DATABASE_URL="file:/app/prisma/dev.db"
ENV PORT=10000

# Copy package files and prisma directory first
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies including devDependencies (Tailwind, PostCSS, TypeScript needed for build)
RUN npm install --include=dev

# Copy application source code
COPY . .

# Ensure upload directory exists
RUN mkdir -p /app/public/uploads

# Build the Next.js application
RUN npm run build

ENV NODE_ENV=production
EXPOSE 10000

# On container start: push database schema and start Next.js
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && npm start -- -p 10000"]
