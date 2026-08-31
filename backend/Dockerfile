FROM node:24-alpine

# Prisma precisa de OpenSSL pra baixar/rodar seus engines nativos no Alpine.
RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# npm install roda antes do COPY . . (de propósito, pra aproveitar o cache
# de camadas do Docker quando só o código muda, não as dependências) — mas
# isso significa que o postinstall do @prisma/client roda sem o
# prisma/schema.prisma ainda existir. Gera o client explicitamente depois.
RUN npx prisma generate

EXPOSE 3333

CMD ["npm", "run", "dev"]
