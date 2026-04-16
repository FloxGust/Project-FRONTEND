FROM node:20-alpine

WORKDIR /app

# copy เฉพาะ dependency ก่อน
COPY package.json package-lock.json ./

# ใช้ cache layer ตรงนี้
RUN npm ci

# ค่อย copy source code
COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]