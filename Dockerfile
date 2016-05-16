FROM node:6.1
EXPOSE 9000
COPY . /tmp/
WORKDIR /tmp/
RUN npm install
RUN npm install -g gulp bower
RUN cd node_modules/collections-online && bower install --allow-root
RUN gulp
CMD node server.js
