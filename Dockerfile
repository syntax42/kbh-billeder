FROM node:14.16
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
    curl \
    gnupg2 \
    ca-certificates \
    lsb-release \
&& rm -rf /var/lib/apt/lists/* # Keeps the image size down

RUN echo "deb http://nginx.org/packages/debian `lsb_release -cs` nginx" \ | tee /etc/apt/sources.list.d/nginx.list
RUN curl -fsSL https://nginx.org/keys/nginx_signing.key | apt-key add -

RUN apt-get update && apt-get install -y \
    nginx \
&& rm -rf /var/lib/apt/lists/* # Keeps the image size down

WORKDIR /tmp/
COPY . .

# --no-color is needed to prevent strange chars in the CI logs
# --no-spin is needed to prevent duplicated lines in the CI logs
# --unsafe-perm is needed for the lifecycle scripts to run
RUN npm install --no-color --no-spin --unsafe-perm

CMD ["/usr/bin/supervisord", "-n", "-c", "/tmp/configurations/supervisord.conf"]
