'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _uid = require('uid');

var _uid2 = _interopRequireDefault(_uid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Create a unique identifier.
 *
 * @return {String} uid
 */

function uid() {
  return (0, _uid2.default)(4);
}

/**
 * Export.
 */

exports.default = uid;