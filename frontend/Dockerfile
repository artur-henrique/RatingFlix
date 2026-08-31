FROM node:24-alpine

WORKDIR /app

COPY package*.json .npmrc ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
