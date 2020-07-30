/* global config */
const config = require('collections-online/lib/config');
const helpers = require('collections-online/shared/helpers');
// Remove brackets ({}) from the cumulus key to check the asset has the correct relation (backside).
const backsideAssetCumulusKey = helpers.getAssetField('backside').cumulusKey.slice(1, -1);

helpers.documentTitle = (metadata, fallback) => {
  let title = metadata.short_title || fallback || 'Billede uden titel';
  return helpers.capitalizeFirstLetter(title);
};

helpers.documentDescription = (metadata, fallback) => {
  let description = metadata.description || fallback || '';
  return helpers.capitalizeFirstLetter(description);
};

helpers.documentSecondaryDescription = (metadata, fallback) => {
  let description = metadata.secondary_description || fallback || '';
  return helpers.capitalizeFirstLetter(description);
};

helpers.documentLicense = (metadata) => {
  return metadata.license && metadata.license.id;
};

helpers.getBacksideAssets = (metadata) => {
  if (metadata.related && metadata.related.assets) {
    return metadata.related.assets.filter(asset => asset.id).filter(asset => asset.relation === backsideAssetCumulusKey);
  }
  return [];
};

// TODO: Delete this when metadata.catalog has transitioned to .collection
helpers.getDocumentURL = (metadata) => {
  let path = [metadata.collection || metadata.catalog];
  if(Object.keys(config.types).length > 1) {
    path.push(metadata.type);
  }
  path.push(metadata.id);
  return '/' + path.join('/');
};

/**
 * Determine which players are available for a given asset.
 *
 * We currently support either video (with an optional backside) or video.
 *
 * @param metadata
 * @returns {Array}
 */
helpers.determinePlayers = metadata => {
  const players = [];

  // Is this a video?
  if (metadata.file_format && metadata.file_format === 'MPEG-4 Video') {
    const license = helpers.licenseMapped(metadata);
    const licenseUrl = license ? license.url : null;
    players.push({
      type: 'video',
      thumbnailLocation: helpers.getThumbnailURL(metadata, 2000, 'bottom-right'),
      title: helpers.documentTitle(metadata),
      description: helpers.documentTitle(metadata),
      contentLocation: helpers.getDirectDownloadURL(metadata),
      licenseUrl
    });
  }
  
  // Is this Audio?
  if (metadata.file_format && metadata.file_format === 'MP3 Format') {
    const license = helpers.licenseMapped(metadata);
    const licenseUrl = license ? license.url : null;
    players.push({
      type: 'audio',
      title: helpers.documentTitle(metadata),
      description: helpers.documentTitle(metadata),
      contentLocation: helpers.getDirectDownloadURL(metadata),
      licenseUrl
    });
  } 
  
  else {
    // Default to image.
    players.push({
      type: 'image',
      thumbnailUrl: helpers.getThumbnailURL(metadata, 2000, 'bottom-right'),
      title: helpers.documentTitle(metadata),
      description: helpers.documentDescription(metadata),
      tags: helpers.motifTagging.getTags(metadata)
    });

    // Add backside if we have one
    if (helpers.hasBacksideAsset(metadata)) {
      players.push({
        type: 'backside',
        thumbnailUrl: helpers.getThumbnailURL(metadata, 2000, 'bottom-right'),
        backsides: helpers.getBacksideAssets(metadata)
      });
    }
  }
  return players;
};

/**
 * Generate a site-map entry for single asset.
 *
 * @param req
 *   Express request
 *
 * @param metadata
 *   ES asset data
 */
helpers.generateSitemapElements = (req, metadata) => {
  // Pull out the data we need for the _image_.
  const documentTitle = helpers.documentTitle(metadata);
  const documentDescription = helpers.documentDescription(metadata);
  const relativeThumbnailUrl = helpers.getThumbnailURL(metadata, 2000, 'bottom-right');
  const thumbnailUrl = helpers.getAbsoluteURL(req, relativeThumbnailUrl);
  const license = helpers.licenseMapped(metadata);
  const licenseUrl = license ? license.url : null;

  // Get the available players for the asset and go trough them to produce image
  // sections for the sitemap.
  // See https://www.google.com/schemas/sitemap-image/1.1/
  const players = helpers.determinePlayers(metadata);

  const elements = [];
  players.forEach(player => {

    if (player.type === 'image') {
      elements.push({
        type: 'image',
        location: thumbnailUrl,
        title: documentTitle,
        documentDescription,
        licenseUrl
      });
    }

    // Backsides are related assets, so if we have one we have to go trough
    // a couple of additional steps to get a hold of the thumbnails.
    if (player.type === 'backside') {
      // See https://www.google.com/schemas/sitemap-image/1.1/
      player.backsides.forEach((backside) => {
        // To speed things up we avoid loading the related assets via ES,
        // instead we syntizice whatever we need from the "parent" asset.
        // Inherit the collection.
        backside.collection = metadata.collection;
        // Remove the collection from the asset id, eg we go from
        // kbh-museum-49054 to 49054.
        backside.id = backside.id.substring(backside.collection.length+1);

        const backsideRelativeThumbnailUrl = helpers.getThumbnailURL(backside, 2000, 'bottom-right');
        const backsideThumbnailUrl = helpers.getAbsoluteURL(req, backsideRelativeThumbnailUrl);
        elements.push({
          type: 'image',
          location: backsideThumbnailUrl,
          title: player.title || `Bagsiden af billedet "${documentTitle}"`,
          description: false,
          licenseUrl
        });
      });
    }

  });
  return elements;
};

function getFileDimensionsString(metadata, size) {
  let width = metadata.width_px;
  let height = metadata.height_px;
  if(typeof(size) === 'number') {
    let ratio = width / height;
    if(ratio > 1) {
      width = size;
      height = size / ratio;
    } else {
      width = size * ratio;
      height = size;
    }
  }
  return Math.round(width) + ' × ' + Math.round(height);
}

function generateSizeDownloadOption(optionKey, option) {
  return {
    label: metadata => {
      let dimensions = getFileDimensionsString(metadata, option.size);
      return option.labelPrefix + ' (' + dimensions + ') JPEG';
    },
    filter: (metadata, derived) => {
      return derived.maxSize >= option.size;
    },
    url: metadata => helpers.getDownloadURL(metadata, optionKey),
  };
}

if(config.downloadOptions) {
  // Loop though the download options defined in the configuration and make them
  // available as an iteratable array of 3-method objects
  const AVAILABLE_DOWNLOAD_OPTIONS = Object.keys(config.downloadOptions)
  .map(optionKey => {
    const option = config.downloadOptions[optionKey];
    if(option.size) {
      return generateSizeDownloadOption(optionKey, option);
    } else if(optionKey === 'original-jpeg') {
      return {
        label: metadata => {
          let label = option.labelPrefix;
          return label + ' (' + getFileDimensionsString(metadata) + ') JPEG';
        },
        filter: metadata => {
          return metadata.file_format !== 'JPEG Image';
        },
        url: metadata => helpers.getDownloadURL(metadata, optionKey),
      };
    } else if(optionKey === 'original') {
      return {
        label: metadata => {
          const type = metadata.file_format;
          // TODO: Consider translating the file_format
          const label = option.labelPrefix;
          return label + ' (' + getFileDimensionsString(metadata) + ') ' + type;
        },
        filter: metadata => {
          return true; // Let's always allow download of the original
        },
        url: metadata => helpers.getDownloadURL(metadata),
      };
    } else {
      throw new Error('Expected "orignal", "original-jpeg" or a size field');
    }
  });

  helpers.getDownloadOptions = (metadata) => {
    let derived = {
      maxSize: Math.max(metadata.width_px, metadata.height_px)
    };

    return AVAILABLE_DOWNLOAD_OPTIONS.filter(option => {
      return option.filter(metadata, derived);
    }).map(option => {
      return {
        label: option.label(metadata, derived),
        url: option.url(metadata, derived)
      };
    });
  };
}

helpers.isDownloadable = (metadata) => {
  // diable download for video and audio assets
  if(helpers.determineMediaTypes(metadata) === 'audio' || helpers.determineMediaTypes(metadata) === 'video') {
    return false;
  }

  return !metadata.license || metadata.license.id !== 7;
};

helpers.hasBacksideAsset = (metadata) => {
  let backsideAssets = helpers.getBacksideAssets(metadata);
  return backsideAssets.length > 0;
};

helpers.getZoomTilesId = (metadata) => {
  return metadata.zoom_tile_id;
};

helpers.hasRelations = metadata => {
  // Filter out backside assets.
  if (metadata.related.assets) {
    return metadata.related.assets.filter(asset => asset.relation !== backsideAssetCumulusKey).length > 0;
  }
  return false;
};

helpers.isWatermarkRequired = (metadata) => {
  if(metadata.license) {
    const licenseMapped = config.licenseMapping[metadata.license.id];
    return licenseMapped && licenseMapped.watermark;
  } else {
    return false;
  }
};

helpers.cleanDocumentId = (id) => {
  // We simply return the id ..
  return id;
};

helpers.modifySearchQueryBody = (body, parameters) => {
  const q = (parameters.filters && parameters.filters.q) || '';
  // Boost the vision tags negatively
  // https://www.elastic.co/guide/en/elasticsearch/reference/2.3/query-dsl-boosting-query.html
  return {
    'query': {
      'boosting': {
        'positive': body.query,
        'negative': {
          'query_string': {
            'default_operator': 'OR',
            'default_field': 'tags_vision',
            'query': q
          }
        },
        'negative_boost' : 0.5
      }
    },
    'sort': body['sort']
  };
};

helpers.motifTagging = {
  getTags: metadata => metadata.tags || [],
  getVerifiedTags: metadata => metadata.tags_verified || [],
  getVisionTags: metadata => metadata.tags_vision || [],

  hasTags: metadata => {
    const { getTags, getVerifiedTags } = helpers.motifTagging;

    return getTags(metadata).length > 0 || getVerifiedTags(metadata).length > 0
  },

  addTag: (metadata, tag) => {
    // Add it to the tags if not already there
    if(metadata.tags.indexOf(tag) === -1) {
      metadata.tags.push(tag);
    }
    // Remove it from the vision tags if there
    helpers.motifTagging.removeVisionTag(metadata, tag);
  },
  removeTag: (metadata, tag) => {
    // Is it there?
    const tagIndex = metadata.tags.indexOf(tag);
    if(tagIndex > -1) {
      // Remove it
      metadata.tags.splice(tagIndex, 1);
    }
  },
  removeVisionTag: (metadata, tag) => {
    // Is it there?
    const visionTagIndex = metadata.tags_vision.indexOf(tag);
    if(visionTagIndex > -1) {
      // Remove it
      metadata.tags_vision.splice(visionTagIndex, 1);
    }
  }
};

const MONTHS = [
  'januar', 'februar', 'marts', 'april', 'maj', 'juni',
  'juli', 'august', 'september', 'oktober', 'november', 'december'
];

helpers.formatDate = function(date) {
  var points = [];
  if(typeof(date) === 'number' || typeof(date) === 'string') {
    date = new Date(date);
    if(isNaN(date)) {
      throw Error("Could not parse date " + date);
    }

    date = {
      day: date.getDate(),
      month: date.getMonth() + 1,
      year: date.getFullYear()
    };
  }
  if(date.day && date.month) {
    points.push(date.day + '.');
  }
  if(date.month) {
    var month = MONTHS[date.month-1];
    if(!date.day) {
      // Capitalize if the month is displayed first
      month = helpers.capitalizeFirstLetter(month);
    }
    points.push(month);
  }
  if(date.year) {
    points.push(date.year);
  }
  return points.join(' ');
};

helpers.geoTagging = {
  getLocation: metadata => {
    return {
      latitude: metadata.latitude,
      longitude: metadata.longitude,
      heading: parseFloat(metadata.heading, 10),
      isApproximate: metadata.location_is_approximate
    }
  },
  getAddress: metadata => {
    return helpers.geoTagging.getAddressRaw(metadata).filter(s => s).join(', ');
  },
  getAddressForMaps: metadata => {
    return helpers.geoTagging.getAddressRaw(metadata).filter(s => s).join('+');
  },
  getAddressRaw: metadata => {
    return [
      metadata.place,
      metadata.street_name,
      metadata.street_number,
      metadata.floor,
      metadata.district,
      metadata.zipcode,
      metadata.city,
      metadata.country
    ];
  },
  enabled: metadata => !metadata.google_maps_coordinates
};

module.exports = helpers;
