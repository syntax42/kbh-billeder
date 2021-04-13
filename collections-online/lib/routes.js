'use strict';

const search = require('./controllers/search');
const api = require('./controllers/api');
const json = require('./controllers/json');
const sitemap = require('./controllers/sitemap');
const robots = require('./controllers/robots');
const motifTagging = require('./controllers/motif-tagging');
const index = require('./controllers/index');
const doc = require('./controllers/document');
const config = require('./config');

/**
 * Application routes
 */
module.exports = function(app) {
  // Static urls
  app.route('/suggest.json').get(json.suggest);
  app.route('/robots.txt').get(robots.robotsTxt);
  app.route('/sitemap.xml').get(sitemap.index);

  // A safe proxy for the elastic search index.
  app.get('/api', api.index);
  app.route('/api/*').get(api.proxy).post(api.proxy);

  // Do pretty redirects, to aviod breaking old links to the site
  app.route('/').get(search.redirect).get(index.frontpage);

  // Search results
  app.route('/' + encodeURIComponent(config.search.path))
    .get(search.clientSideResult);

  app.route('/:catalog/sitemap.xml').get(sitemap.catalog);

  // Add a router for series
  app.get('/serie/:id', (req, res) => {
    console.log("id", req.params.id);
    //TODO: get series from es or error here
    res.render("series.pug", {
      req,
      metadata: {
        title: 'Vesterbrogade - Billedserie',
      },
      series: {
        title: "Vesterbrogade",
        assets: [ "magasin-museum-19870", "kbh-museum-8366" ],
        previewAssets: [
          {
            collection: "magasin-museum",
            creation_time: { displaystring: "1969", year: 1969, timestamp: "1969-01-01", month: null, day: null },
            creation_time_estimated: null,
            creation_time_from: null,
            creation_time_to: null,
            description: "Magasin Torv foran forretningen på Kgs. Nytorv får plantet træer. Magasin Torv skal være en skyggefuld oase både for forretningens kunder og byens borgere. ",
            file_format: "TIFF Image",
            id: 19870,
            short_title: "Der plantes træer foran Magasin",
            tags: ["arbejdsliv", "arbejdsmand", "vejtræ", "striktrøje"]
          },
          {
            collection: "kbh-museum",
            creation_time: { displaystring: "1969", year: 1969, timestamp: "1969-01-01", month: null, day: null },
            creation_time_estimated: null,
            creation_time_from: null,
            creation_time_to: null,
            description: "Magasin Torv foran forretningen på Kgs. Nytorv får plantet træer. Magasin Torv skal være en skyggefuld oase både for forretningens kunder og byens borgere. ",
            file_format: "TIFF Image",
            id: 8366,
            short_title: "Der plantes træer foran Magasin",
            tags: ["arbejdsliv", "arbejdsmand", "vejtræ", "striktrøje"]
          }
        ],
        description: "Vesterbrogade 67, Carl P. Dreyers Vinhandel med tilhørende vinstue. Th. S. Christensens Frugt & Vildt-forretning. Bygningen nedbrudt efteråret 1902. Billedet stemplet Chr. Neuhaus Eftf. Oluf W. Jørgensen, Kjøbmagergade 14.",
        date1: { year: 1902 },
        date2: { year: 1942 },
        tags: [ "hej", "verden" ],
      }
    });
  });

  // Register a router for every type
  const types = Object.keys(config.types);
  types.forEach((type) => {
    // Register all routes related to the particular type
    const router = require('../../' + config.types[type].router);
    // Register the types router on the app
    let path;
    if(types.length > 1) {
      path = '/:collection([a-zA-Z\-]+)/' + type + '/:id(\\d+)';
    } else {
      path = '/:collection([a-zA-Z\-]+)/:id(\\d+)';
    }
    app.use(path, router);
    // Allowing a /json call that returns raw json
    app.get(path + '/json', (req, res, next) => {
      return doc.json(req, type).then((response) => {
        res.json(response);
      }, next);
    });
  });

  if(config.features.motifTagging) {
    app.route('/motif-tag-suggestions').get(motifTagging.typeaheadSuggestions);
  }
};
