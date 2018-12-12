"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.normalizeDocument = normalizeDocument;
exports.normalizeSelection = normalizeSelection;

/**
 * Normalize the document.
 *
 * @param {Transform} transform
 * @return {Transform}
 */

function normalizeDocument(transform) {
  var state = transform.state;
  var _state = state,
      document = _state.document;

  document = document.normalize();
  state = state.merge({ document: document });
  transform.state = state;
  return transform;
}

/**
 * Normalize the selection.
 *
 * @param {Transform} transform
 * @return {Transform}
 */

function normalizeSelection(transform) {
  var state = transform.state;
  var _state2 = state,
      document = _state2.document,
      selection = _state2.selection;

  selection = selection.normalize(document);
  state = state.merge({ selection: selection });
  transform.state = state;
  return transform;
}