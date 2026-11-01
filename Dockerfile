FROM node:22-slim
RUN apt-get update && apt-get install -y --no-install-recommends openssl jq && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json package-lock.json prisma.config.ts ./
COPY prisma ./prisma
RUN npm ci
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]
