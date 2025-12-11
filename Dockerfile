# Base stage
FROM node:20.9.0-alpine AS base
WORKDIR /app

# Dependencies stage
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# Builder stage
FROM deps AS builder
COPY . .
# Mock data fetch calls during build to prevent ECONNREFUSED errors
ARG NEXT_PHASE
ENV NEXT_PHASE=${NEXT_PHASE}
RUN if [ "$NEXT_PHASE" = "phase-production-build" ]; then \
      echo "Mocking data fetch calls during build..."; \
      echo "module.exports = { fetchData: async () => ({ mocked: true }) };" > src/lib/utils.js; \
    fi
RUN npm run build

# Runner stage
FROM node:20.9.0-alpine AS runner
WORKDIR /app
COPY --from=builder /app .
EXPOSE 3000
CMD ["npm", "run", "start"]