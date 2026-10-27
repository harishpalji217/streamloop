FROM node:20-bookworm-slim

# Install system dependencies including FFmpeg
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV DATABASE_URL="file:/app/prisma/dev.db"
ENV PORT=7860
ENV NODE_ENV=production

# Copy package files and prisma directory first
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies including devDependencies (Tailwind, PostCSS, TypeScript needed for build)
RUN npm install --include=dev

# Copy application source code
COPY . .

# Ensure upload directory exists and has full write permissions
RUN mkdir -p /app/public/uploads && mkdir -p /app/prisma && chmod -R 777 /app

# Build the Next.js application
RUN npm run build

EXPOSE 7860

# Run as non-root user 1000 for Hugging Face Spaces compatibility
USER 1000

# On container start: push database schema and start Next.js on port 7860
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && npm start -- -p 7860"]
