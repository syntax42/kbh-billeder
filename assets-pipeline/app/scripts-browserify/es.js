const request = require('request');

const url = `${location.origin}/api/_search`;

module.exports = {
  search: ({body, query}) => {
    const queryData = Object.keys(query)
      .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(query[key])}`)
      .join('&');

    return new Promise((resolve, reject) => {
      request({
        method: 'post',
        url: `${url}?${queryData}`,
        json: body,
      }, (error, response, body) => {
        if(error) {
          return reject(error);
        }
        resolve(body);
      });
    });
  },
};
