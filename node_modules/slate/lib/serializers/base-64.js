'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _raw = require('./raw');

var _raw2 = _interopRequireDefault(_raw);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Encode a JSON `object` as base-64 `string`.
 *
 * @param {Object} object
 * @return {String} encoded
 */

function encode(object) {
  var string = JSON.stringify(object);
  var encoded = window.btoa(window.encodeURIComponent(string));
  return encoded;
}

/**
 * Decode a base-64 `string` to a JSON `object`.
 *
 * @param {String} string
 * @return {Object} object
 */

function decode(string) {
  var decoded = window.decodeURIComponent(window.atob(string));
  var object = JSON.parse(decoded);
  return object;
}

/**
 * Deserialize a State `string`.
 *
 * @param {String} string
 * @return {State} state
 */

function deserialize(string) {
  var raw = decode(string);
  var state = _raw2.default.deserialize(raw);
  return state;
}

/**
 * Deserialize a Node `string`.
 *
 * @param {String} string
 * @return {Node} node
 */

function deserializeNode(string) {
  var raw = decode(string);
  var node = _raw2.default.deserializeNode(raw);
  return node;
}

/**
 * Serialize a `state`.
 *
 * @param {State} state
 * @return {String} encoded
 */

function serialize(state) {
  var raw = _raw2.default.serialize(state);
  var encoded = encode(raw);
  return encoded;
}

/**
 * Serialize a `node`.
 *
 * @param {Node} node
 * @return {String} encoded
 */

function serializeNode(node) {
  var raw = _raw2.default.serializeNode(node);
  var encoded = encode(raw);
  return encoded;
}

/**
 * Export.
 */

exports.default = {
  deserialize: deserialize,
  deserializeNode: deserializeNode,
  serialize: serialize,
  serializeNode: serializeNode
};