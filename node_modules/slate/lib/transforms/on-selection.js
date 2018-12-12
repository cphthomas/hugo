"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.blur = blur;
exports.collapseToAnchor = collapseToAnchor;
exports.collapseToEnd = collapseToEnd;
exports.collapseToFocus = collapseToFocus;
exports.collapseToStart = collapseToStart;
exports.collapseToEndOf = collapseToEndOf;
exports.collapseToEndOfNextBlock = collapseToEndOfNextBlock;
exports.collapseToEndOfNextText = collapseToEndOfNextText;
exports.collapseToEndOfPreviousBlock = collapseToEndOfPreviousBlock;
exports.collapseToEndOfPreviousText = collapseToEndOfPreviousText;
exports.collapseToStartOf = collapseToStartOf;
exports.collapseToStartOfNextBlock = collapseToStartOfNextBlock;
exports.collapseToStartOfNextText = collapseToStartOfNextText;
exports.collapseToStartOfPreviousBlock = collapseToStartOfPreviousBlock;
exports.collapseToStartOfPreviousText = collapseToStartOfPreviousText;
exports.extendBackward = extendBackward;
exports.extendForward = extendForward;
exports.extendToEndOf = extendToEndOf;
exports.extendToStartOf = extendToStartOf;
exports.focus = focus;
exports.moveBackward = moveBackward;
exports.moveForward = moveForward;
exports.moveTo = moveTo;
exports.moveToOffsets = moveToOffsets;
exports.moveToRangeOf = moveToRangeOf;
exports.unsetSelection = unsetSelection;

/**
 * Blur the selection.
 *
 * @param {Transform} transform
 * @return {Transform}
 */

function blur(transform) {
  var state = transform.state;
  var selection = state.selection;

  var sel = selection.blur();
  return transform.setSelectionOperation(sel);
}

/**
 * Move the focus point to the anchor point.
 *
 * @param {Transform} transform
 * @return {Transform}
 */

function collapseToAnchor(transform) {
  var state = transform.state;
  var selection = state.selection;

  var sel = selection.collapseToAnchor();
  return transform.setSelectionOperation(sel);
}

/**
 * Move the anchor point to the
 *  focus point.
 * @param {Transform} transform
 * @return {Transform}
 */

function collapseToEnd(transform) {
  var state = transform.state;
  var selection = state.selection;

  var sel = selection.collapseToEnd();
  return transform.setSelectionOperation(sel);
}

/**
 * Move the anchor point to the
 *  focus point.
 * @param {Transform} transform
 * @return {Transform}
 */

function collapseToFocus(transform) {
  var state = transform.state;
  var selection = state.selection;

  var sel = selection.collapseToFocus();
  return transform.setSelectionOperation(sel);
}

/**
 * Move the focus point to the anchor point.
 *
 * @param {Transform} transform
 * @return {Transform}
 */

function collapseToStart(transform) {
  var state = transform.state;
  var selection = state.selection;

  var sel = selection.collapseToStart();
  return transform.setSelectionOperation(sel);
}

/**
 * Move to the end of a `node`.
 *
 * @param {Transform} transform
 * @param {Node} node
 * @return {Transform}
 */

function collapseToEndOf(transform, node) {
  var state = transform.state;
  var selection = state.selection;

  var sel = selection.collapseToEndOf(node);
  return transform.setSelectionOperation(sel);
}

/**
 * Move the selection to the end of the next block.
 *
 * @param {Transform} tansform
 * @return {Transform}
 */

function collapseToEndOfNextBlock(transform) {
  var state = transform.state;
  var document = state.document,
      selection = state.selection;

  var blocks = document.getBlocksAtRange(selection);
  var last = blocks.last();
  var next = document.getNextBlock(last);
  if (!next) return transform;

  var sel = selection.collapseToEndOf(next);
  return transform.setSelectionOperation(sel);
}

/**
 * Move the selection to the end of the next text.
 *
 * @param {Transform} tansform
 * @return {Transform}
 */

function collapseToEndOfNextText(transform) {
  var state = transform.state;
  var document = state.document,
      selection = state.selection;

  var texts = document.getTextsAtRange(selection);
  var last = texts.last();
  var next = document.getNextText(last);
  if (!next) return transform;

  var sel = selection.collapseToEndOf(next);
  return transform.setSelectionOperation(sel);
}

/**
 * Move the selection to the end of the previous block.
 *
 * @param {Transform} tansform
 * @return {Transform}
 */

function collapseToEndOfPreviousBlock(transform) {
  var state = transform.state;
  var document = state.document,
      selection = state.selection;

  var blocks = document.getBlocksAtRange(selection);
  var first = blocks.first();
  var previous = document.getPreviousBlock(first);
  if (!previous) return transform;

  var sel = selection.collapseToEndOf(previous);
  return transform.setSelectionOperation(sel);
}

/**
 * Move the selection to the end of the previous text.
 *
 * @param {Transform} tansform
 * @return {Transform}
 */

function collapseToEndOfPreviousText(transform) {
  var state = transform.state;
  var document = state.document,
      selection = state.selection;

  var texts = document.getTextsAtRange(selection);
  var first = texts.first();
  var previous = document.getPreviousText(first);
  if (!previous) return transform;

  var sel = selection.collapseToEndOf(previous);
  return transform.setSelectionOperation(sel);
}

/**
 * Move to the start of a `node`.
 *
 * @param {Transform} transform
 * @param {Node} node
 * @return {Transform}
 */

function collapseToStartOf(transform, node) {
  var state = transform.state;
  var selection = state.selection;

  var sel = selection.collapseToStartOf(node);
  return transform.setSelectionOperation(sel);
}

/**
 * Move the selection to the start of the next block.
 *
 * @param {Transform} tansform
 * @return {Transform}
 */

function collapseToStartOfNextBlock(transform) {
  var state = transform.state;
  var document = state.document,
      selection = state.selection;

  var blocks = document.getBlocksAtRange(selection);
  var last = blocks.last();
  var next = document.getNextBlock(last);
  if (!next) return transform;

  var sel = selection.collapseToStartOf(next);
  return transform.setSelectionOperation(sel);
}

/**
 * Move the selection to the start of the next text.
 *
 * @param {Transform} tansform
 * @return {Transform}
 */

function collapseToStartOfNextText(transform) {
  var state = transform.state;
  var document = state.document,
      selection = state.selection;

  var texts = document.getTextsAtRange(selection);
  var last = texts.last();
  var next = document.getNextText(last);
  if (!next) return transform;

  var sel = selection.collapseToStartOf(next);
  return transform.setSelectionOperation(sel);
}

/**
 * Move the selection to the start of the previous block.
 *
 * @param {Transform} tansform
 * @return {Transform}
 */

function collapseToStartOfPreviousBlock(transform) {
  var state = transform.state;
  var document = state.document,
      selection = state.selection;

  var blocks = document.getBlocksAtRange(selection);
  var first = blocks.first();
  var previous = document.getPreviousBlock(first);
  if (!previous) return transform;

  var sel = selection.collapseToStartOf(previous);
  return transform.setSelectionOperation(sel);
}

/**
 * Move the selection to the start of the previous text.
 *
 * @param {Transform} tansform
 * @return {Transform}
 */

function collapseToStartOfPreviousText(transform) {
  var state = transform.state;
  var document = state.document,
      selection = state.selection;

  var texts = document.getTextsAtRange(selection);
  var first = texts.first();
  var previous = document.getPreviousText(first);
  if (!previous) return transform;

  var sel = selection.collapseToStartOf(previous);
  return transform.setSelectionOperation(sel);
}

/**
 * Extend the focus point backward `n` characters.
 *
 * @param {Transform} transform
 * @param {Number} n (optional)
 * @return {Transform}
 */

function extendBackward(transform, n) {
  var state = transform.state;
  var document = state.document,
      selection = state.selection;

  var sel = selection.extendBackward(n).normalize(document);
  return transform.setSelectionOperation(sel);
}

/**
 * Extend the focus point forward `n` characters.
 *
 * @param {Transform} transform
 * @param {Number} n (optional)
 * @return {Transform}
 */

function extendForward(transform, n) {
  var state = transform.state;
  var document = state.document,
      selection = state.selection;

  var sel = selection.extendForward(n).normalize(document);
  return transform.setSelectionOperation(sel);
}

/**
 * Extend the focus point to the end of a `node`.
 *
 * @param {Transform} transform
 * @param {Node} node
 * @return {Transform}
 */

function extendToEndOf(transform, node) {
  var state = transform.state;
  var document = state.document,
      selection = state.selection;

  var sel = selection.extendToEndOf(node).normalize(document);
  return transform.setSelectionOperation(sel);
}

/**
 * Extend the focus point to the start of a `node`.
 *
 * @param {Transform} transform
 * @param {Node} node
 * @return {Transform}
 */

function extendToStartOf(transform, node) {
  var state = transform.state;
  var document = state.document,
      selection = state.selection;

  var sel = selection.extendToStartOf(node).normalize(document);
  return transform.setSelectionOperation(sel);
}

/**
 * Focus the selection.
 *
 * @param {Transform} transform
 * @return {Transform}
 */

function focus(transform) {
  var state = transform.state;
  var selection = state.selection;

  var sel = selection.focus();
  return transform.setSelectionOperation(sel);
}

/**
 * Move the selection backward `n` characters.
 *
 * @param {Transform} transform
 * @param {Number} n (optional)
 * @return {Transform}
 */

function moveBackward(transform, n) {
  var state = transform.state;
  var document = state.document,
      selection = state.selection;

  var sel = selection.moveBackward(n).normalize(document);
  return transform.setSelectionOperation(sel);
}

/**
 * Move the selection forward `n` characters.
 *
 * @param {Transform} transform
 * @param {Number} n (optional)
 * @return {Transform}
 */

function moveForward(transform, n) {
  var state = transform.state;
  var document = state.document,
      selection = state.selection;

  var sel = selection.moveForward(n).normalize(document);
  return transform.setSelectionOperation(sel);
}

/**
 * Move the selection to a specific anchor and focus point.
 *
 * @param {Transform} transform
 * @param {Object} properties
 * @return {Transform}
 */

function moveTo(transform, properties) {
  return transform.setSelectionOperation(properties);
}

/**
 * Move the selection to `anchor` and `focus` offsets.
 *
 * @param {Transform} transform
 * @param {Number} anchor
 * @param {Number} focus (optional)
 * @return {Transform}
 */

function moveToOffsets(transform, anchor, fokus) {
  var state = transform.state;
  var document = state.document,
      selection = state.selection;

  var sel = selection.moveToOffsets(anchor, fokus);
  return transform.setSelectionOperation(sel);
}

/**
 * Move to the entire range of `start` and `end` nodes.
 *
 * @param {Transform} transform
 * @param {Node} start
 * @param {Node} end (optional)
 * @return {Transform}
 */

function moveToRangeOf(transform, start, end) {
  var state = transform.state;
  var document = state.document,
      selection = state.selection;

  var sel = selection.moveToRangeOf(start, end).normalize(document);
  return transform.setSelectionOperation(sel);
}

/**
 * Unset the selection, removing an association to a node.
 *
 * @param {Transform} transform
 * @return {Transform}
 */

function unsetSelection(transform) {
  return transform.setSelectionOperation({
    anchorKey: null,
    anchorOffset: 0,
    focusKey: null,
    focusOffset: 0,
    isFocused: false,
    isBackward: false
  });
}