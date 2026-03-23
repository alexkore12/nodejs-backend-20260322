# Node.js Backend Dockerfile - Production Ready (2026)

# Stage 1: Builder
FROM node:20-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies
RUN npm ci

# Copy source
COPY . ./ 

# Stage 2: Production
FROM node:20-alpine as production

# Security: Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev && \
    npm cache clean --force

# Copy source
COPY --chown=nodejs:nodejs . .

# Environment variables
ENV NODE_ENV=production \
    PORT=3000

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Start the application
CMD ["npm", "start"]

# Development stage
FROM production as development

# Install dev dependencies
RUN npm ci && npm cache clean --force
RUN npm install nodemon --save-dev

ENV NODE_ENV=development

CMD ["nodemon", "index.js"]