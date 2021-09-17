FROM node:14.17.6

RUN apt-get update && apt-get install -y \
    libcairo2-dev \
    libpango1.0-dev \
    libgif-dev \
    && rm -rf /var/lib/apt/lists/* # Keeps the image size down

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .


ENV NODE_ENV=production

EXPOSE 9000

CMD node server.js
