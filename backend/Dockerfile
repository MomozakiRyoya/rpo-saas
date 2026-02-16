# Build stage
FROM node:22-slim AS builder

WORKDIR /app

# Install OpenSSL for Prisma
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build application
RUN npm run build

# Verify build output
RUN ls -la /app/dist && \
    test -f /app/dist/main.js && \
    echo "✅ Build successful: main.js found" || \
    (echo "❌ Build failed: main.js not found" && ls -laR /app && exit 1)

# Production stage
FROM node:22-slim

WORKDIR /app

# Install OpenSSL for Prisma
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Copy node_modules from builder (includes all dependencies and generated Prisma client)
COPY --from=builder /app/node_modules ./node_modules

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Copy prisma schema for migrations
COPY prisma ./prisma/

# Copy start script
COPY start.sh ./

# Make start script executable
RUN chmod +x start.sh

# Verify all required files are present
RUN echo "📋 Verifying production files..." && \
    ls -la /app && \
    ls -la /app/dist && \
    test -f /app/dist/main.js && \
    echo "✅ All files verified" || \
    (echo "❌ Verification failed" && exit 1)

# Expose port
EXPOSE 3000

# Start command
CMD ["./start.sh"]
