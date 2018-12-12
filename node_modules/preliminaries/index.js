/*!
 * preliminaries <https://github.com/josephearl/preliminaries.git>
 *
 * Copyright (c) 2017, Joseph Earl.
 * Copyright (c) 2014-2017, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var preliminaries = function(register) {
  if (register) {
    preliminaries.registerParser('json', jsonParser);
  }
  return preliminaries;
};

/**
 * Expose `parsers`
 *
 * @type {Object}
 */

preliminaries.parsers = [];

/**
 * Parsers by first delimiter
 *
 * @type {Object}
 */
preliminaries.parsersLangByFirstDelim = [];

/**
 * Parses a `string` of front matter with the given `options`,
 * and returns an object.
 *
 * ```js
 * preliminaries.parse('---\ntitle: foo\n---\nbar');
 * //=> {data: {title: 'foo'}, content: 'bar'}
 * ```
 *
 * @param {String} `string` The string to parse.
 * @param {Object} `options`
 *   @option {Array} [options] `delims` Custom delimiters formatted as an array. The default is `['---', '---']`.
 *   @option {Function} [options] `parser` Parser function to use.
 * @return {Object} Valid JSON
 */

preliminaries.parse = function(str, options) {
  if (typeof str !== 'string') {
    throw new Error('preliminaries expects a string');
  }
  var opts = options || {};

  // Default results to build up
  var res = {data: {}, content: str};
  if (str === '') {
    return res;
  }
  
  // Strip byte order marks
  str = stripBom(str);
  var len = str.length;

  // Default language and delimiters
  var delims = '---';
  var lang = 'json';

  // If no delimiters are set and if no parser and no language is defined,
  // try to infer the language by matching the first delimiter with parsers
  var inferred = null;
  if (!opts.delims && !opts.parser && !opts.lang) {
    var infer = true;
    // don't infer if the document has a language in the front matter like `---yaml`
    var dlen = delims.length;
    if (len >= dlen + 1 && str.substr(0, dlen) === delims) {
      var c = str.charAt(dlen);
      if (c !== '\n' && (c !== '\r' && str.charAt(dlen + 1) !== '\n')) {
        infer = false;
      }
    }
    var idlen = str.indexOf('\n');
    if (infer && idlen > 0) {
      var ia = str.substr(0, idlen);
      ia = ia.charAt(ia.length - 1) === '\r' ? ia.substr(0, ia.length - 1) : ia;
      ia = ia.trim();
      inferred = preliminaries.parsersLangByFirstDelim[ia];
      if (ia && inferred) {
        lang = inferred;
        opts.delims = preliminaries.parsers[lang].delims;
      }
    }
  }

  delims = opts.delims = arrayify(opts.delims || delims);
  lang = opts.lang || lang;

  // If the first delim isn't the first thing, return
  var a = delims[0];
  if (!isFirst(str, a)) {
    return res;
  }

  var alen = a.length;
  var b = '\n' + (delims[1] || delims[0]);
  
  // If the next character after the first delim
  // is a character in the first delim, then just
  // return the default object. it's either a bad
  // delim or not a delimiter at all.
  var aftera = str.charAt(alen + 1);
  if (aftera && a.indexOf(aftera) !== -1) {
    return res;
  }

  // Find the index of the next delimiter before
  // going any further. If not found, return.
  var end = str.indexOf(b, alen + 1);
  if (end === -1) {
    end = len;
  }

  // Detect a language from after the first delimiters, if defined
  var detected = str.slice(alen, str.indexOf('\n'));
  // Measure the lang before trimming whitespace
  var start = alen + detected.length;
  detected = detected.trim();
  // Check languages match
  if (!opts.parser && detected) {
    if (opts.lang && detected !== opts.lang) {
      throw new Error('preliminaries detected a different language: ' + detected + ' to the one specified: ' + opts.lang);
    }
    if (inferred && detected !== inferred) {
      throw new Error('preliminaries detected a different language: ' + detected + ' to the one inferred: ' + inferred);
    }
  }

  lang = opts.lang = detected || lang;

  // Get the front matter (data) string
  var data = str.slice(start, end).trim();
  if (data) {
    // If data exists, see if we have a matching parser
    var parser = opts.parser || preliminaries.parsers[lang];
    if (parser && typeof parser.parse === 'function') {
      // Run the parser on the data string
      res.data = parser.parse(data, opts);
    } else {
      throw new Error('preliminaries cannot find a parser for: ' + str);
    }
  }

  // Grab the content from the string, stripping
  // an optional new line after the second delim
  var con = str.substr(end + b.length);
  if (con.charAt(0) === '\n') {
    con = con.substr(1);
  } else if (con.charAt(0) === '\r' && con.charAt(1) === '\n') {
    con = con.substr(2);
  }

  res.content = con;
  return res;
};

/**
 * Stringify an object to front matter, and
 * concatenate it to the given string.
 *
 * ```js
 * preliminaries.stringify('foo bar baz', {title: 'Home'});
 * ```
 * Results in:
 *
 * ```yaml
 * ---
 * {
 * title: Home
 * }
 * ---
 * foo bar baz
 * ```
 *
 * @param {String} `str` The content string to append to stringified front matter.
 * @param {Object} `data` Front matter to stringify.
 * @param {Object} `options` Options to pass to the parser.
 * @return {String}
 */

preliminaries.stringify = function(str, data, options) {
  var opts = options || {};
  var lang = opts.lang || 'json';

  // Whether to stringify the language or not
  var slang = typeof opts.stringifyIncludeLang !== 'undefined' ? opts.stringifyIncludeLang : !opts.delims && !opts.stringifyUseParserDelims;

  var parser = opts.parser || preliminaries.parsers[lang];
  if (parser && typeof parser.stringify === 'function') {
    var delims = opts.delims = arrayify(opts.delims || (opts.stringifyUseParserDelims && parser.delims ? parser.delims : '---'));
    var res = delims[0] + (slang ? lang : '') + '\n';
    res += parser.stringify(data, opts);
    res += (delims[1] || delims[0]) + '\n';
    res += str + '\n';
    return res;
  } else {
    throw new Error('preliminaries cannot find a parser for: ' + str);
  }
};

/**
 * Register a parser
 *
 * @param  {String} `lang` The language to register the parser for.
 * @param  {Object} `parser` The parser.
 */

preliminaries.registerParser = function(lang, parser) {
  if (typeof lang !== 'string') {
    throw new Error('preliminaries expects a language string');
  }
  if (preliminaries.parsers[lang]) {
    throw new Error('preliminaries cannot register the parser because a parser is already registered for language: xyz');
  }
  if (parser.delims) {
    var a = arrayify(parser.delims)[0];
    if (preliminaries.parsersLangByFirstDelim[a]) {
      throw new Error('preliminaries cannot register the parser because the delimiters clash with an already registered parser for language: ' + preliminaries.parsersLangByFirstDelim[a]);
    }
    preliminaries.parsersLangByFirstDelim[a] = lang;
  }
  preliminaries.parsers[lang] = parser;
};

/**
 * Unegister a parser
 *
 * @param  {String} `lang` The language to unregister the parser from.
 */

preliminaries.unregisterParser = function(lang) {
  if (typeof lang !== 'string') {
    throw new Error('preliminaries expects a language string');
  }
  var parser = preliminaries.parsers[lang];
  if (parser) {
    delete preliminaries.parsers[lang];
    if (parser.delims) {
      delete preliminaries.parsersLangByFirstDelim[arrayify(parser.delims)[0]];
    }
  }
};

/**
 * Return true if the given `string` has front matter.
 *
 * @param  {String} `string`
 * @param  {Object} `options`
 * @return {Boolean} True if front matter exists.
 */

preliminaries.test = function(str, options) {
  var delims = arrayify(options && options.delims || '---');
  return isFirst(str, delims[0]);
};

var jsonParser = {};

/**
 * Standard json delimiters
 */
jsonParser.delims = ['{', '}'];

/**
 * Parse JSON front matter
 *
 * @param  {String} `str` The string to parse.
 * @return {Object} Parsed object of data.
 */

jsonParser.parse = function(str, options) {
  var opts = options || {};
  var delims = arrayify(opts.delims || '---');
  try {
    var standard = delims.length === 2 && delims[0] === '{' && delims[1] === '}';
    var inp = standard ? '{' : '';
    inp += str;
    inp += standard ? '}' : '';
    return JSON.parse(inp);
  } catch (err) {
    throw new SyntaxError(msg('JSON', err));
  }
};

/**
 * Stringify front matter
 *
 * @param  {Object} `data` The data to stringify.
 * @return {String} Stringified data.
 */

jsonParser.stringify = function(data, options) {
  var delims = arrayify(options && options.delims || '---');
  var res = JSON.stringify(data);
  var standard = delims.length === 2 && delims[0] === '{' && delims[1] === '}';
  res = res.replace(/^{/, (standard ? '' : '{\n'));
  res = res.replace(/}$/, (standard ? '' : '\n}'));
  res += '\n';
  return res;
};

/**
 * Expose `preliminaries.jsonParser`
 */

preliminaries.jsonParser = jsonParser;

/**
 * Expose `preliminaries`
 */

module.exports = preliminaries;

/**
 * Return true if the given `ch` the first
 * thing in the string.
 */

function isFirst(str, ch) {
  return str.substr(0, ch.length) === ch;
}

/**
 * Utility to strip byte order marks
 */

function stripBom(str) {
  return str.charAt(0) === '\uFEFF' ? str.slice(1) : str;
}

/**
 * Typecast `val` to an array.
 */

function arrayify(val) {
  return !Array.isArray(val) ? [val] : val;
}

/**
 * Normalize error messages
 */

function msg(lang, err) {
  return 'preliminaries parser [' + lang + ']: ' + err;
}
