FROM node:7.2
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

# If a collections online sha1 is given, install this particular version
# Fix bug https://github.com/npm/npm/issues/9863
RUN cd $(npm root -g)/npm \
  && npm install fs-extra \
  && sed -i -e s/graceful-fs/fs-extra/ -e s/fs\.rename/fs.move/ ./lib/utils/rename.js
ARG collections_online_sha1=
RUN if [ -n "$collections_online_sha1" ]; then \
      npm install "git+https://github.com/collections-online/collections-online.git#$collections_online_sha1" --no-color --no-spin --unsafe-perm; \
    fi

CMD ["/usr/bin/supervisord", "-n", "-c", "/tmp/configurations/supervisord.conf"]
