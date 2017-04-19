/* global config */
const config = require('collections-online/lib/config');
const helpers = require('collections-online/shared/helpers');

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

// TODO: Delete this when metadata.catalog has transitioned to .collection
helpers.getDocumentURL = (metadata) => {
  let path = [metadata.collection || metadata.catalog];
  if(Object.keys(config.types).length > 1) {
    path.push(metadata.type);
  }
  path.push(metadata.id);
  return '/' + path.join('/');
};

helpers.determinePlayers = metadata => {
  return [{
    type: 'image',
    thumbnailUrl: helpers.getThumbnailURL(metadata, 2000, 'bottom-right'),
    title: helpers.documentTitle(metadata)
  }];
};

helpers.generateSitemapElements = (metadata) => {
  throw new Exception('Not yet implemented');
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
  return !metadata.license || metadata.license.id !== 7;
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
  console.log('cleanDocumentId called with', id);
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
  getTags: metadata => {
    return metadata.tags;
  },
  getVisionTags: metadata => {
    return metadata.tags_vision;
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

helpers.geoTagging = {
  getLocation: metadata => {
    return {
      latitude: metadata.latitude,
      longitude: metadata.longitude,
      heading: parseFloat(metadata.heading, 10)
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
