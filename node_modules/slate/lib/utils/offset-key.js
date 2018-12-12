'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

/**
 * Offset key parser regex.
 */

var PARSER = /^(\w+)(?:-(\d+))?$/;

/**
 * Offset key attribute name.
 */

var ATTRIBUTE = 'data-offset-key';
var SELECTOR = '[' + ATTRIBUTE + ']';

/**
 * Find the start and end bounds from an `offsetKey` and `ranges`.
 *
 * @param {Number} index
 * @param {List} ranges
 * @return {Object}
 */

function findBounds(index, ranges) {
  var range = ranges.get(index);
  var start = ranges.slice(0, index).reduce(function (memo, r) {
    return memo += r.text.length;
  }, 0);

  return {
    start: start,
    end: start + range.text.length
  };
}

/**
 * From a `element`, find the closest parent's offset key.
 *
 * @param {Element} element
 * @param {Number} offset
 * @return {Object}
 */

function findKey(element, offset) {
  if (element.nodeType == 3) element = element.parentNode;

  var parent = element.closest(SELECTOR);
  var children = element.querySelectorAll(SELECTOR);
  var offsetKey = void 0;

  // Get the key from a parent if one exists.
  if (parent) {
    offsetKey = parent.getAttribute(ATTRIBUTE);
  }

  // COMPAT: In Firefox, and potentially other browsers, when performing a
  // "select all" action, a parent element is selected instead of the text. In
  // this case, we need to select the proper inner text nodes. (2016/07/26)
  else if (children.length) {
      var child = children[0];

      if (offset != 0) {
        child = children[children.length - 1];
        offset = child.textContent.length;
      }

      offsetKey = child.getAttribute(ATTRIBUTE);
    }

    // Otherwise, for void node scenarios, a cousin element will be selected, and
    // we need to select the first text node cousin we can find.
    else {
        while (element = element.parentNode) {
          var cousin = element.querySelector(SELECTOR);
          if (!cousin) continue;
          offsetKey = cousin.getAttribute(ATTRIBUTE);
          offset = cousin.textContent.length;
          break;
        }
      }

  // If we still didn't find an offset key, error. This is a bug.
  if (!offsetKey) {
    throw new Error('Unable to find offset key for ' + element + ' with offset "' + offset + '".');
  }

  // Parse the offset key.
  var parsed = parse(offsetKey);

  return {
    key: parsed.key,
    index: parsed.index,
    offset: offset
  };
}

/**
 * Find the selection point from an `offsetKey` and `ranges`.
 *
 * @param {Object} offsetKey
 * @param {List} ranges
 * @return {Object}
 */

function findPoint(offsetKey, ranges) {
  var key = offsetKey.key,
      index = offsetKey.index,
      offset = offsetKey.offset;

  var _findBounds = findBounds(index, ranges),
      start = _findBounds.start,
      end = _findBounds.end;

  // Don't let the offset be outside of the start and end bounds.


  offset = start + offset;
  offset = Math.max(offset, start);
  offset = Math.min(offset, end);

  return {
    key: key,
    index: index,
    start: start,
    end: end,
    offset: offset
  };
}

/**
 * Parse an offset key `string`.
 *
 * @param {String} string
 * @return {Object}
 */

function parse(string) {
  var matches = PARSER.exec(string);
  if (!matches) throw new Error('Invalid offset key string "' + string + '".');

  var _matches = _slicedToArray(matches, 3),
      original = _matches[0],
      key = _matches[1],
      index = _matches[2];

  return {
    key: key,
    index: parseInt(index, 10)
  };
}

/**
 * Stringify an offset key `object`.
 *
 * @param {Object} object
 *   @property {String} key
 *   @property {Number} index
 * @return {String}
 */

function stringify(object) {
  return object.key + '-' + object.index;
}

/**
 * Export.
 */

exports.default = {
  findBounds: findBounds,
  findKey: findKey,
  findPoint: findPoint,
  parse: parse,
  stringify: stringify
};