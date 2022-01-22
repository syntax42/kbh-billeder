const es = require('../services/elasticsearch');
const config = require('../../../shared/config');

module.exports.get = (req, res, next) => {
  const {seriesUrl} = req.params;

  es.get({
    index: config.es.seriesIndex,
    id: `series/${seriesUrl}`
  })
    .then((seriesDoc) => {
      res.render('series.pug', {
        req,
        series: {
          id: seriesDoc._id.slice('series/'.length),
          ...seriesDoc._source,
        },
      });
    })
    .catch((error) => {
      if(error.status === 404) {
        return next();
      }
      next(error);
    });
};
