'use strict';

const ds = require('../../services/documents');
const documentController = require('../document');
const config = require('../../config');

const layouts = require('../../layouts');
const assetSection = layouts.section('asset');

/**
 * Renders an asset's landing page
 */
exports.index = function(req, res, next) {
  return documentController.get(req, 'asset').then((metadata) => {
    // Read collection from the metadata catalog if not specified
    metadata.collection = metadata.collection || metadata.catalog;
    return documentController.getRelatedMetadata(metadata).then(related => {
      metadata.related = related;
      return metadata;
    });
  })
    .then(function(metadata) {
      const assetSeries = [
        {
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
        },
        {
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
      ];
      res.render('asset.pug', {
        metadata,
        assetSection: assetSection(),
        assetSeries,
        req,
      });
    })
    .then(null, function(error) {
      if (error.message === 'Not Found') {
        error.status = 404;
      }
      next(error);
    });
};
