# syntax=docker/dockerfile:1
# Keep base image in sync with @playwright/test in package.json.
# https://playwright.dev/docs/docker
FROM mcr.microsoft.com/playwright:v1.59.1-jammy

WORKDIR /app

# Dependency layer: invalidates only when lockfiles change
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# Tests, config, and sources (see .dockerignore)
COPY . .

ENV CI=true

# Image includes browser binaries; CMD runs the suite (Railway/CI)
CMD ["npx", "playwright", "test"]
