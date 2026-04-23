# Pin image tag to the same major Playwright version as package.json.
# https://playwright.dev/docs/docker
FROM mcr.microsoft.com/playwright:v1.59.1-jammy

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

ENV CI=true

# Image already includes browser binaries matching v1.59.1
CMD ["npx", "playwright", "test"]
