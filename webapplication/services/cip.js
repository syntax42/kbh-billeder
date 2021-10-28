'use strict';

var cip = require('cip-js');
var Q = require('q');
// Used to parse a UTF16-LE to UTF16-BE string.
var Iconv  = require('iconv').Iconv;
var config = require('../../shared/config');
var cipClient = new cip.CIPClient(config.cip.client);

cipClient.initSession = function(forceInit) {
  if (!this.isConnected() || forceInit) {
    if (!config.cip.username || !config.cip.password) {
      throw new Error('Please set CIP username and password!');
    }
    return this.sessionOpen(config.cip.username, config.cip.password)
    .then(() => {
      console.log('Opened CIP session', this.jsessionid);
      return this;
    }, (err) => {
      if (!err) {
        throw new Error('Could not open CIP session: ' +
                        'Check connection, username and password.');
      } else {
        throw err;
      }
    });
  } else {
    return new Q(this);
  }
};

cipClient.sessionRenew = function() {
  return cipClient.sessionClose().then(() => {
    return cipClient.sessionOpen(config.cip.username, config.cip.password);
  }).then(() => {
    console.log('Renewed the CIP session, id is now', cipClient.jsessionid);
  });
};

cipClient.getRecentAssets = function(cipClient, catalog, fromDate) {
  var searchString = '"Record Modification Date" >= ' + fromDate;
  return cipClient.criteriaSearch({
    catalog: catalog
  }, searchString, null);
};

cipClient.setFieldValues = function(catalogAlias, id, values) {
  values.id = parseInt(id);

  return this.request(`/metadata/setfieldvalues/${catalogAlias}`, {}, {
    items: [values]
  });
};

cipClient.findCatalog = function(catalogs, alias) {
  for (var i = 0; i < catalogs.length; ++i) {
    if (catalogs[i].alias === alias) {
      return catalogs[i];
    }
  }
  return null;
};

cipClient.getRelatedAssets = function(asset, relation) {
  if (asset && relation) {
    return asset.getRelatedAssets(relation);
  } else {
    throw new Error('The asset or relation was not provided.');
  }
};

var utf16BE2LE = new Iconv('UTF-16BE', 'UTF-16LE');

// We need to use this jshint option, because the three functions reference
// each other circularly value -> list -> element -> value -> ...
/* jshint latedef:nofunc */

function parseBinaryValue(buf, type) {
  if (type === 'UChr') {
    return utf16BE2LE.convert(buf).toString('utf16le');
  } else if (type === 'list') {
    return parseBinaryList(buf);
  } else if (type === 'gUid') {
    if (buf.length !== 16) {
      throw new Error('Expected a gUid buffer to be of length 16.');
    }
    var parts = [
      buf.slice(0, 4).toString('hex'),
      buf.slice(4, 6).toString('hex'),
      buf.slice(6, 8).toString('hex'),
      buf.slice(8, 10).toString('hex'),
      buf.slice(10, 16).toString('hex')
    ];
    return parts.join('-');
  } else if (type === 'Long') {
    if (buf.length !== 4) {
      throw new Error('Expected a Long buffer to be of length 4.');
    }
    return buf.readUInt32BE(0);
  } else {
    throw new Error('binary_value: Unimplemented type ' + type);
  }
}

function parseBinaryElement(buf, type) {
  var fieldCount = buf.readUInt32BE(0);
  // console.log(depth_tabs(), 'Parsing binary element type', type, 'size',
  //     buf.length, 'with', fieldCount, 'fields.');

  var result = {
    'type': type
  };

  var offset = 4;
  // depth++;
  for (var f = 0; f < fieldCount; f++) {
    // console.log(depth_tabs(), 'Parsing binary field indexed', f);
    // console.log(depth_tabs(), buf.slice(offset), buf.slice(offset).toString());
    var fieldSize = buf.readUInt32BE(offset);
    // console.log(depth_tabs(), 'Field size:', fieldSize);
    var fieldName = buf.slice(offset + 4, offset + 8).toString('utf8');
    // console.log(depth_tabs(), 'Field name:', fieldName);
    var fieldType = buf.slice(offset + 8, offset + 12).toString('utf8');
    // console.log(depth_tabs(), 'Field type:', fieldType);
    var fieldBuffer = buf.slice(offset + 12, offset + fieldSize + 12);
    var fieldValue = parseBinaryValue(fieldBuffer, fieldType);
    // The CIP has a bug where a null-terminated string's size
    // does not include the two null bytes in the field size.
    // If we read the 4 bytes just after the field value's buffer and
    // they are all zero's, this is probably not the length of the next
    // field's value, thus this the two first are assumed to be null bytes
    // from the string.
    // To make sure we don't read outside the stream, we check the bounds.
    if (f < fieldCount - 1) {
      var checked = buf.readUInt32BE(offset + fieldSize + 12);
      if (fieldType === 'UChr' && checked === 0 && f !== fieldCount - 1) {
        fieldSize += 2;
      }
    }
    // console.log(depth_tabs(), 'Field value:', fieldValue);
    result[fieldName] = fieldValue;

    offset += fieldSize + 12;
  }
  // depth--;

  return result;
}

function parseBinaryList(buf) {
  var listLength = buf.readUInt32BE(0);
  // console.log( depth_tabs(), 'Parsing a list of length', listLength );
  var result = [];

  var offset = 4;
  // depth++;
  for (var i = 0; i < listLength; i++) {
    // console.log( depth_tabs(), 'Parsing a list element indexed', i );
    var elementSize = buf.readUInt32BE(offset);
    // console.log( depth_tabs(), 'List element indexed', i, 'has size', elementSize );
    var elementType = buf.slice(offset + 4, offset + 8).toString('utf8');
    // console.log( depth_tabs(), 'List element indexed', i, 'has type', elementType );
    var elementBuffer = buf.slice(offset + 8, offset + elementSize + 8);
    var element = parseBinaryElement(elementBuffer, elementType);
    result.push(element);
    offset += elementSize + 8;
  }
  // depth--;

  return result;
}

// Parse binary field value (64 encoded string) to object.
cipClient.binaryToObject = function(binaryBase64Encoded) {
  if (binaryBase64Encoded) {
    var buf = new Buffer(binaryBase64Encoded, 'base64');
    // We expect that we start with a list.
    var type = buf.slice(0, 4).toString('utf8');
    var elementBuffer = buf.slice(4);
    return parseBinaryValue(elementBuffer, type);
  } else {
    return null;
  }
};

cipClient.parseBinaryRelations = function(binaryBase64Encoded) {
  var result = [];
  var relatedAssets = this.binaryToObject(binaryBase64Encoded);
  if (relatedAssets) {
    // Perform a transformation.
    for (var r in relatedAssets) {
      var relatedAsset = relatedAssets[r];
      if (relatedAsset.type !== 'reco') {
        continue;
      }

      for (var ref in relatedAsset.Refs) {
        var reference = relatedAsset.Refs[ref];
        if (reference.type !== 'reco') {
          continue;
        }

        result.push({
          id: reference.RcID,
          filename: relatedAsset.Name,
          relation: reference.RlID
        });
      }
    }
  }
  return result;
};

module.exports = cipClient;
