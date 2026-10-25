FROM node:20-bookworm-slim

# Install system dependencies including FFmpeg
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install package dependencies
COPY package*.json ./
RUN npm install

# Copy database schema and generate Prisma client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy the rest of the application code
COPY . .

# Ensure volume mount directory exists
RUN mkdir -p /app/public/uploads

# Build the Next.js application
RUN npm run build

# Expose port (Railway will provide PORT environment variable)
EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production

# Start application
CMD ["npm", "start"]
