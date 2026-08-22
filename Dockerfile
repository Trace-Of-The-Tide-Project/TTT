# syntax = docker/dockerfile:1

# Adjust NODE_VERSION as desired
ARG NODE_VERSION=22.12.0
FROM node:${NODE_VERSION}-slim AS base

LABEL fly_launch_runtime="Next.js"

# Next.js app lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV="production"


# Throw-away build stage to reduce size of final image
FROM base AS build

# Install packages needed to build node modules
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential node-gyp openssl pkg-config python-is-python3

# Install node modules
COPY package-lock.json package.json ./
RUN npm ci --include=dev

# Copy application code
COPY . .

# NEXT_PUBLIC_* vars are inlined into the client bundle at build time, so they
# must arrive as build args (not just runtime secrets/env).
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}

# Build application (full build incl. static generation, so machines boot straight into `next start`)
RUN npx next build

# Remove development dependencies
RUN npm prune --omit=dev


# Final stage for app image
FROM base

# Install packages needed for deployment
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y openssl && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives

# Copy built application
COPY --from=build /app /app

# Start the server by default, this can be overwritten at runtime
EXPOSE 3000
CMD [ "npm", "run", "start" ]
