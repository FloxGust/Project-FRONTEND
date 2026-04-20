FROM node:20-alpine

WORKDIR /app

# Copy dependency manifests first (if lockfile exists, include it)
COPY package*.json ./

# Use npm ci when lockfile exists, otherwise fallback to npm install
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copy source code
COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]