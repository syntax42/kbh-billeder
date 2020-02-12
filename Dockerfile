FROM node:8.15
EXPOSE 9000

# Dependencies needed for and the node-canvas to install correctly and
# supervisor + nginx for deployment
RUN apt-get update && apt-get install -y \
    libcairo2-dev \
    libpango1.0-dev \
    libgif-dev \
    build-essential \
    g++ \
    supervisor \
    nginx \
&& rm -rf /var/lib/apt/lists/* # Keeps the image size down

COPY . /tmp/
WORKDIR /tmp/

# --no-color is needed to prevent strange chars in the CI logs
# --no-spin is needed to prevent duplicated lines in the CI logs
# --unsafe-perm is needed for the lifecycle scripts to run
RUN npm install --no-color --no-spin --unsafe-perm

CMD ["/usr/bin/supervisord", "-n", "-c", "/tmp/configurations/supervisord.conf"]
