'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.applyOperation = applyOperation;

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _uid = require('../utils/uid');

var _uid2 = _interopRequireDefault(_uid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Debug.
 *
 * @type {Function}
 */

var debug = (0, _debug2.default)('slate:operation');

/**
 * Operations.
 *
 * @type {Object}
 */

var OPERATIONS = {
  // Text operations.
  insert_text: insertText,
  remove_text: removeText,
  // Mark operations.
  add_mark: addMark,
  remove_mark: removeMark,
  set_mark: setMark,
  // Node operations.
  insert_node: insertNode,
  join_node: joinNode,
  move_node: moveNode,
  remove_node: removeNode,
  set_node: setNode,
  split_node: splitNode,
  // Selection operations.
  set_selection: setSelection
};

/**
 * Apply an `operation` to the current state.
 *
 * @param {Transform} transform
 * @param {Object} operation
 * @return {Transform}
 */

function applyOperation(transform, operation) {
  var state = transform.state,
      operations = transform.operations;
  var type = operation.type;

  var fn = OPERATIONS[type];

  if (!fn) {
    throw new Error('Unknown operation type: "' + type + '".');
  }

  debug(type, operation);

  transform.state = fn(state, operation);
  transform.operations = operations.concat([operation]);
  return transform;
}

/**
 * Add mark to text at `offset` and `length` in node by `path`.
 *
 * @param {State} state
 * @param {Object} operation
 * @return {State}
 */

function addMark(state, operation) {
  var path = operation.path,
      offset = operation.offset,
      length = operation.length,
      mark = operation.mark;
  var _state = state,
      document = _state.document;

  var node = document.assertPath(path);
  node = node.addMark(offset, length, mark);
  document = document.updateDescendant(node);
  state = state.merge({ document: document });
  return state;
}

/**
 * Insert a `node` at `index` in a node by `path`.
 *
 * @param {State} state
 * @param {Object} operation
 * @return {State}
 */

function insertNode(state, operation) {
  var path = operation.path,
      index = operation.index,
      node = operation.node;
  var _state2 = state,
      document = _state2.document;

  var parent = document.assertPath(path);
  var isParent = document == parent;
  var nodes = parent.nodes.splice(index, 0, node);
  parent = parent.merge({ nodes: nodes });
  document = isParent ? parent : document.updateDescendant(parent);
  state = state.merge({ document: document });
  return state;
}

/**
 * Insert `text` at `offset` in node by `path`.
 *
 * @param {State} state
 * @param {Object} operation
 * @return {State}
 */

function insertText(state, operation) {
  var path = operation.path,
      offset = operation.offset,
      text = operation.text,
      marks = operation.marks;
  var _state3 = state,
      document = _state3.document;

  var node = document.assertPath(path);
  node = node.insertText(offset, text, marks);
  document = document.updateDescendant(node);
  state = state.merge({ document: document });
  return state;
}

/**
 * Join a node by `path` with a node `withPath`.
 *
 * @param {State} state
 * @param {Object} operation
 * @return {State}
 */

function joinNode(state, operation) {
  var path = operation.path,
      withPath = operation.withPath;
  var _state4 = state,
      document = _state4.document;

  document = document.joinNode(path, withPath);
  state = state.merge({ document: document });
  return state;
}

/**
 * Move a node by `path` to a new parent by `path` and `index`.
 *
 * @param {State} state
 * @param {Object} operation
 * @return {State}
 */

function moveNode(state, operation) {
  var path = operation.path,
      newPath = operation.newPath,
      newIndex = operation.newIndex;
  var _state5 = state,
      document = _state5.document;

  var node = document.assertPath(path);

  var parent = document.getParent(node);
  var isParent = document == parent;
  var index = parent.nodes.indexOf(node);
  parent = parent.removeNode(index);
  document = isParent ? parent : document.updateDescendant(parent);

  var target = document.assertPath(newPath);
  var isTarget = document == target;
  target = target.insertNode(newIndex, node);
  document = isTarget ? target : document.updateDescendant(target);

  state = state.merge({ document: document });
  return state;
}

/**
 * Remove mark from text at `offset` and `length` in node by `path`.
 *
 * @param {State} state
 * @param {Object} operation
 * @return {State}
 */

function removeMark(state, operation) {
  var path = operation.path,
      offset = operation.offset,
      length = operation.length,
      mark = operation.mark;
  var _state6 = state,
      document = _state6.document;

  var node = document.assertPath(path);
  node = node.removeMark(offset, length, mark);
  document = document.updateDescendant(node);
  state = state.merge({ document: document });
  return state;
}

/**
 * Remove a node by `path`.
 *
 * @param {State} state
 * @param {Object} operation
 * @return {State}
 */

function removeNode(state, operation) {
  var path = operation.path;
  var _state7 = state,
      document = _state7.document;

  var node = document.assertPath(path);
  var parent = document.getParent(node);
  var index = parent.nodes.indexOf(node);
  var isParent = document == parent;
  parent = parent.removeNode(index);
  document = isParent ? parent : document.updateDescendant(parent);
  state = state.merge({ document: document });
  return state;
}

/**
 * Remove text at `offset` and `length` in node by `path`.
 *
 * @param {State} state
 * @param {Object} operation
 * @return {State}
 */

function removeText(state, operation) {
  var path = operation.path,
      offset = operation.offset,
      length = operation.length;
  var _state8 = state,
      document = _state8.document;

  var node = document.assertPath(path);
  node = node.removeText(offset, length);
  document = document.updateDescendant(node);
  document = document.normalize();
  state = state.merge({ document: document });
  return state;
}

/**
 * Set `properties` on mark on text at `offset` and `length` in node by `path`.
 *
 * @param {State} state
 * @param {Object} operation
 * @return {State}
 */

function setMark(state, operation) {
  var path = operation.path,
      offset = operation.offset,
      length = operation.length,
      mark = operation.mark,
      properties = operation.properties;
  var _state9 = state,
      document = _state9.document;

  var node = document.assertPath(path);
  node = node.updateMark(offset, length, mark, properties);
  document = document.updateDescendant(node);
  state = state.merge({ document: document });
  return state;
}

/**
 * Set `properties` on a node by `path`.
 *
 * @param {State} state
 * @param {Object} operation
 * @return {State}
 */

function setNode(state, operation) {
  var path = operation.path,
      properties = operation.properties;
  var _state10 = state,
      document = _state10.document;

  var node = document.assertPath(path);
  node = node.merge(properties);
  document = document.updateDescendant(node);
  document = document.normalize();
  state = state.merge({ document: document });
  return state;
}

/**
 * Set `properties` on the selection.
 *
 * @param {State} state
 * @param {Object} operation
 * @return {State}
 */

function setSelection(state, operation) {
  var properties = _extends({}, operation.properties);
  var _state11 = state,
      document = _state11.document,
      selection = _state11.selection;


  if (properties.anchorPath !== undefined) {
    properties.anchorKey = properties.anchorPath === null ? null : document.assertPath(properties.anchorPath).key;
    delete properties.anchorPath;
  }

  if (properties.focusPath !== undefined) {
    properties.focusKey = properties.focusPath === null ? null : document.assertPath(properties.focusPath).key;
    delete properties.focusPath;
  }

  selection = selection.merge(properties);
  selection = selection.normalize(document);
  state = state.merge({ selection: selection });
  return state;
}

/**
 * Split a node by `path` at `offset`.
 *
 * @param {State} state
 * @param {Object} operation
 * @return {State}
 */

function splitNode(state, operation) {
  var path = operation.path,
      offset = operation.offset;
  var _state12 = state,
      document = _state12.document;


  document = document.splitNode(path, offset);

  state = state.merge({ document: document });
  return state;
}