'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _applyOperation = require('./apply-operation');

var _operations = require('./operations');

var _atRange = require('./at-range');

var _atCurrentRange = require('./at-current-range');

var _byKey = require('./by-key');

var _onSelection = require('./on-selection');

var _onHistory = require('./on-history');

var _normalize = require('./normalize');

/**
 * Export.
 *
 * @type {Object}
 */

/**
 * On history.
 */

/**
 * By key.
 */

/**
 * At range.
 */

/**
 * Apply operation.
 */

exports.default = {

  /**
   * Apply operation.
   */

  applyOperation: _applyOperation.applyOperation,

  /**
   * Operations.
   */

  addMarkOperation: _operations.addMarkOperation,
  insertNodeOperation: _operations.insertNodeOperation,
  insertTextOperation: _operations.insertTextOperation,
  moveNodeOperation: _operations.moveNodeOperation,
  removeMarkOperation: _operations.removeMarkOperation,
  removeNodeOperation: _operations.removeNodeOperation,
  removeTextOperation: _operations.removeTextOperation,
  setMarkOperation: _operations.setMarkOperation,
  setNodeOperation: _operations.setNodeOperation,
  setSelectionOperation: _operations.setSelectionOperation,
  splitNodeOperation: _operations.splitNodeOperation,

  /**
   * At range.
   */

  deleteAtRange: _atRange.deleteAtRange,
  deleteBackwardAtRange: _atRange.deleteBackwardAtRange,
  deleteForwardAtRange: _atRange.deleteForwardAtRange,
  insertBlockAtRange: _atRange.insertBlockAtRange,
  insertFragmentAtRange: _atRange.insertFragmentAtRange,
  insertInlineAtRange: _atRange.insertInlineAtRange,
  insertTextAtRange: _atRange.insertTextAtRange,
  addMarkAtRange: _atRange.addMarkAtRange,
  setBlockAtRange: _atRange.setBlockAtRange,
  setInlineAtRange: _atRange.setInlineAtRange,
  splitBlockAtRange: _atRange.splitBlockAtRange,
  splitInlineAtRange: _atRange.splitInlineAtRange,
  removeMarkAtRange: _atRange.removeMarkAtRange,
  toggleMarkAtRange: _atRange.toggleMarkAtRange,
  unwrapBlockAtRange: _atRange.unwrapBlockAtRange,
  unwrapInlineAtRange: _atRange.unwrapInlineAtRange,
  wrapBlockAtRange: _atRange.wrapBlockAtRange,
  wrapInlineAtRange: _atRange.wrapInlineAtRange,
  wrapTextAtRange: _atRange.wrapTextAtRange,

  /**
   * At current range.
   */

  delete: _atCurrentRange._delete,
  deleteBackward: _atCurrentRange.deleteBackward,
  deleteForward: _atCurrentRange.deleteForward,
  insertBlock: _atCurrentRange.insertBlock,
  insertFragment: _atCurrentRange.insertFragment,
  insertInline: _atCurrentRange.insertInline,
  insertText: _atCurrentRange.insertText,
  addMark: _atCurrentRange.addMark,
  setBlock: _atCurrentRange.setBlock,
  setInline: _atCurrentRange.setInline,
  splitBlock: _atCurrentRange.splitBlock,
  splitInline: _atCurrentRange.splitInline,
  removeMark: _atCurrentRange.removeMark,
  toggleMark: _atCurrentRange.toggleMark,
  unwrapBlock: _atCurrentRange.unwrapBlock,
  unwrapInline: _atCurrentRange.unwrapInline,
  wrapBlock: _atCurrentRange.wrapBlock,
  wrapInline: _atCurrentRange.wrapInline,
  wrapText: _atCurrentRange.wrapText,

  /**
   * By key.
   */

  addMarkByKey: _byKey.addMarkByKey,
  insertNodeByKey: _byKey.insertNodeByKey,
  insertTextByKey: _byKey.insertTextByKey,
  moveNodeByKey: _byKey.moveNodeByKey,
  removeMarkByKey: _byKey.removeMarkByKey,
  removeNodeByKey: _byKey.removeNodeByKey,
  removeTextByKey: _byKey.removeTextByKey,
  setMarkByKey: _byKey.setMarkByKey,
  setNodeByKey: _byKey.setNodeByKey,
  splitNodeByKey: _byKey.splitNodeByKey,
  unwrapInlineByKey: _byKey.unwrapInlineByKey,
  unwrapBlockByKey: _byKey.unwrapBlockByKey,

  /**
   * On selection.
   */

  blur: _onSelection.blur,
  collapseToAnchor: _onSelection.collapseToAnchor,
  collapseToEnd: _onSelection.collapseToEnd,
  collapseToEndOf: _onSelection.collapseToEndOf,
  collapseToEndOfNextBlock: _onSelection.collapseToEndOfNextBlock,
  collapseToEndOfNextText: _onSelection.collapseToEndOfNextText,
  collapseToEndOfPreviousBlock: _onSelection.collapseToEndOfPreviousBlock,
  collapseToEndOfPreviousText: _onSelection.collapseToEndOfPreviousText,
  collapseToFocus: _onSelection.collapseToFocus,
  collapseToStart: _onSelection.collapseToStart,
  collapseToStartOf: _onSelection.collapseToStartOf,
  collapseToStartOfNextBlock: _onSelection.collapseToStartOfNextBlock,
  collapseToStartOfNextText: _onSelection.collapseToStartOfNextText,
  collapseToStartOfPreviousBlock: _onSelection.collapseToStartOfPreviousBlock,
  collapseToStartOfPreviousText: _onSelection.collapseToStartOfPreviousText,
  extendBackward: _onSelection.extendBackward,
  extendForward: _onSelection.extendForward,
  extendToEndOf: _onSelection.extendToEndOf,
  extendToStartOf: _onSelection.extendToStartOf,
  focus: _onSelection.focus,
  moveBackward: _onSelection.moveBackward,
  moveForward: _onSelection.moveForward,
  moveTo: _onSelection.moveTo,
  moveToOffsets: _onSelection.moveToOffsets,
  moveToRangeOf: _onSelection.moveToRangeOf,
  unsetSelection: _onSelection.unsetSelection,

  /**
   * History.
   */

  redo: _onHistory.redo,
  save: _onHistory.save,
  undo: _onHistory.undo,

  /**
   * Normalize.
   */

  normalizeDocument: _normalize.normalizeDocument,
  normalizeSelection: _normalize.normalizeSelection

};

/**
 * Normalize.
 */

/**
 * On selection.
 */

/**
 * At current range.
 */

/**
 * Operations.
 */