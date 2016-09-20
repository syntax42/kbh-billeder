FROM node:6.1
EXPOSE 9000
COPY . /tmp/
WORKDIR /tmp/
# Dependencies needed for the node-canvas to install correctly
RUN apt-get update
RUN DEBIAN_FRONTEND=noninteractive; apt-get install -y -q --force-yes libcairo2-dev libpango1.0-dev libgif-dev build-essential g++
# --no-color is needed to prevent strange chars in the CI logs
# --no-spin is needed to prevent duplicated lines in the CI logs
# --unsafe-perm is needed for the lifecycle scripts to run
RUN npm install --no-color --no-spin --unsafe-perm
# Fix bug https://github.com/npm/npm/issues/9863
RUN cd $(npm root -g)/npm \
  && npm install fs-extra \
  && sed -i -e s/graceful-fs/fs-extra/ -e s/fs\.rename/fs.move/ ./lib/utils/rename.js
CMD node server.js
