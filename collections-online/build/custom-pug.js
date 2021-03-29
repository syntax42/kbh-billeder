module.exports = function(config) {
  let pug = require('../lib/pug')(config);
  let prefix = `
    const path = require('path');
    const config = require(path.join(process.cwd(), 'collections-online/shared/config'));
  `;
  let postfix = '\nmodule.exports = template;';

  var originalCompileClient = pug.compileClient;
  pug.compileClient = function(contents, opts) {
    return prefix + originalCompileClient(contents, opts) + postfix;
  };

  return pug;
};
