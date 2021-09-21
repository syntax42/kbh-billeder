FROM node:14.17.6

RUN apt-get update && apt-get install -y \
    libcairo2-dev \
    libpango1.0-dev \
    libgif-dev \
    && rm -rf /var/lib/apt/lists/* # Keeps the image size down

WORKDIR /app

COPY package*.json ./
RUN npm install

# build frontend bundle
COPY gulpfile.js .
COPY collections-online collections-online
COPY config config
COPY config.js .
COPY app app
COPY shared shared

RUN node node_modules/.bin/gulp build

# copy in server files
COPY server.js .
COPY plugins plugins
COPY controllers controllers
COPY services services
COPY indexing indexing
COPY updates updates
COPY routes routes

COPY .env . ## TODO - dont inject env during build time

ENV NODE_ENV=production

EXPOSE 9000

CMD node server.js
