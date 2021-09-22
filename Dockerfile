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
COPY config config
COPY config.js .
COPY app app
COPY shared shared
COPY build build
COPY lib lib
COPY bower.json .
COPY bower_components bower_components

RUN node node_modules/.bin/gulp build

# copy in server files
COPY server.js .
COPY plugins plugins
COPY controllers controllers
COPY services services
COPY indexing indexing
COPY updates updates
COPY routes routes

# TODO - dont inject env during build time
COPY .env .

EXPOSE 9000

CMD node start.js
