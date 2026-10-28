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
ENV HOSTNAME="0.0.0.0"
ENV NODE_ENV=production

# Copy package files and prisma directory first
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies including devDependencies (Tailwind, PostCSS, TypeScript needed for build)
RUN npm install --include=dev

# Copy application source code
COPY . .

# Ensure upload directory and prisma directory exist with full permissions
RUN mkdir -p /app/public/uploads && mkdir -p /app/prisma && chmod -R 777 /app

# Push database schema during build to pre-generate SQLite dev.db
RUN npx prisma db push --accept-data-loss

# Build the Next.js application
RUN npm run build

EXPOSE 7860

# Start Next.js bound to 0.0.0.0 on port 7860 (or $PORT if provided by host)
CMD ["sh", "-c", "export DATABASE_URL=\"${DATABASE_URL:-file:/app/prisma/dev.db}\" && npx prisma db push --accept-data-loss && npx next start -H 0.0.0.0 -p ${PORT:-7860}"]
