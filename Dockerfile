# Pin to the same Playwright version as package.json for matching browser builds.
# @see https://playwright.dev/docs/docker
FROM mcr.microsoft.com/playwright:v1.59.1-noble

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Full app source (tests import pages/, utils/, properties/, etc.). Partial COPY breaks on Railway/Linux.
COPY . .

ENV CI=true
ENV PLAYWRIGHT_HTML_OPEN=never

# Official image already includes browser binaries; no `playwright install` needed.
CMD ["npx", "playwright", "test"]
