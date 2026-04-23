# Pin image tag to the same major Playwright version as package.json.
# https://playwright.dev/docs/docker
FROM mcr.microsoft.com/playwright:v1.59.1-jammy

WORKDIR /app

# Dependencies first (better layer cache)
COPY package.json package-lock.json* ./
RUN npm ci

# All project sources (see .dockerignore for exclusions).
# Covers tests, pages, utils, dataProvider, Environment, properties/, SampleFiles/, etc.
COPY . .

ENV CI=true

# Image already includes browser binaries matching v1.59.1
CMD ["npx", "playwright", "test"]
