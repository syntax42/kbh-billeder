'use strict';

const fields = [
  'tags',
  'tags_vision'
]

module.exports = function(state, metadata) {
  fields.forEach(field => {
    if(typeof(metadata[field]) === 'string') {
      metadata[field] = metadata[field].split(',');
    }
  });
  return metadata;
};
