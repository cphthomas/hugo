'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _immutable = require('immutable');

/**
 * The leaf node of a cache tree.
 *
 * An object, so that immutable maps will key it by reference.
 *
 * @type {Object}
 */

var LEAF = {};

/**
 * Memoize all of the `properties` on a `object`.
 *
 * @param {Object} object
 * @param {Array} properties
 * @return {Record}
 */

function memoize(object, properties) {
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    var _loop = function _loop() {
      var property = _step.value;

      var original = object[property];

      if (!original) {
        throw new Error('Object does not have a property named "' + property + '".');
      }

      object[property] = function () {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        var keys = [property].concat(args, [LEAF]);
        var cache = this.__cache = this.__cache || new _immutable.Map();

        if (cache.hasIn(keys)) return cache.getIn(keys);

        var value = original.apply(this, args);
        this.__cache = cache.setIn(keys, value);
        return value;
      };
    };

    for (var _iterator = properties[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      _loop();
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }
}

/**
 * Export.
 */

exports.default = memoize;