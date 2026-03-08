FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY prisma ./prisma
RUN npx prisma generate

COPY . .

EXPOSE 3000

CMD sh -c "npx prisma migrate deploy && if [ \"$SKIP_SEED\" != 'true' ]; then node prisma/seed.js; fi && node src/index.js"
