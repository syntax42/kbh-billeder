FROM node:14.17.6

WORKDIR /build

ARG NODE_ENV=production

# install dependencies
COPY shared shared
RUN npm install --prefix shared

COPY assets-pipeline/package*.json assets-pipeline/
RUN npm install --prefix assets-pipeline

# build assets
COPY assets-pipeline assets-pipeline
RUN npm run build --prefix assets-pipeline


FROM node:14.17.6

WORKDIR /app

# install non-node dependencies
RUN apt-get update && apt-get install -y \
    libcairo2-dev \
    libpango1.0-dev \
    libgif-dev \
    && rm -rf /var/lib/apt/lists/* # Keeps the image size down

# install dependencies
COPY webapplication webapplication
RUN npm install --prefix webapplication

# copy in built bundle and assets
COPY assets-pipeline assets-pipeline
COPY --from=0 /build/assets-pipeline/generated /app/assets-pipeline/generated

# copy shared including its depedendencies
COPY --from=0 /build/shared /app/shared

EXPOSE 9000

CMD node webapplication/start.js
