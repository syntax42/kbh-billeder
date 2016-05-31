FROM node:6.1
EXPOSE 9000
COPY . /tmp/
WORKDIR /tmp/
RUN npm install --no-spin --production
CMD node server.js
