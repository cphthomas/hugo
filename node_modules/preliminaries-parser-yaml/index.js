/*!
 * preliminaries <https://github.com/josephearl/preliminaries.git>
 *
 * Copyright (c) 2017, Joseph Earl.
 * Copyright (c) 2014-2017, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var YAML = require('js-yaml');

var yamlParser = function(register) {
  if (register) {
    var preliminaries = require('preliminaries');
    preliminaries.registerParser('yaml', yamlParser);
  }
  return yamlParser;
};

/**
 * Standard YAML delimiters
 */
yamlParser.delims = '---';

/**
 * Parse YAML front matter
 *
 * @param  {String} `str` The string to parse.
 * @param  {Object} `options` Options.
 * @return {Object} Parsed object of data.
 * @api public
 */

yamlParser.parse = function(str, options) {
  try {
    return YAML.safeLoad(str, options);
  } catch (err) {
    throw new SyntaxError(msg('js-yaml', err));
  }
};

/**
 * Stringify front matter
 *
 * @param  {Object} `data` The data to stringify.
 * @param  {Object} `options` Options.
 * @return {String} Stringified data.
 * @api public
 */

yamlParser.stringify = function(data, options) {
  var res = YAML.safeDump(data, options);
  return res;
};

/**
 * Expose `yamlParser`
 */

module.exports = yamlParser;

/**
 * Normalize error messages
 */

function msg(lang, err) {
  return 'preliminaries parser [' + lang + ']: ' + err;
}
