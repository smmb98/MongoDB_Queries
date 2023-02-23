FROM node:14.16.0

WORKDIR /app
COPY ./package*.json ./
RUN npm ci
COPY . .

CMD ["npm", "start"]