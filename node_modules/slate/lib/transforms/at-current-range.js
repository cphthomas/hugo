'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addMark = addMark;
exports._delete = _delete;
exports.deleteBackward = deleteBackward;
exports.deleteForward = deleteForward;
exports.insertBlock = insertBlock;
exports.insertFragment = insertFragment;
exports.insertInline = insertInline;
exports.insertText = insertText;
exports.setBlock = setBlock;
exports.setInline = setInline;
exports.splitBlock = splitBlock;
exports.splitInline = splitInline;
exports.removeMark = removeMark;
exports.toggleMark = toggleMark;
exports.unwrapBlock = unwrapBlock;
exports.unwrapInline = unwrapInline;
exports.wrapBlock = wrapBlock;
exports.wrapInline = wrapInline;
exports.wrapText = wrapText;

var _normalize = require('../utils/normalize');

var _normalize2 = _interopRequireDefault(_normalize);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Add a `mark` to the characters in the current selection.
 *
 * @param {Transform} transform
 * @param {Mark} mark
 * @return {Transform}
 */

function addMark(transform, mark) {
  mark = _normalize2.default.mark(mark);

  var state = transform.state;
  var document = state.document,
      selection = state.selection;


  if (selection.isExpanded) {
    return transform.addMarkAtRange(selection, mark);
  } else if (selection.marks) {
    var marks = selection.marks.add(mark);
    var sel = selection.merge({ marks: marks });
    return transform.moveTo(sel);
  } else {
    var _marks = document.getMarksAtRange(selection).add(mark);
    var _sel = selection.merge({ marks: _marks });
    return transform.moveTo(_sel);
  }
}

/**
 * Delete at the current selection.
 *
 * @param {Transform} transform
 * @return {Transform}
 */

function _delete(transform) {
  var state = transform.state;
  var document = state.document,
      selection = state.selection;

  var after = void 0;

  if (selection.isCollapsed) return transform;

  var startText = state.startText;
  var startKey = selection.startKey,
      startOffset = selection.startOffset,
      endKey = selection.endKey,
      endOffset = selection.endOffset;

  var block = document.getClosestBlock(startText);
  var highest = block.getHighestChild(startText);
  var previous = block.getPreviousSibling(highest);
  var next = block.getNextSibling(highest);

  if (previous && startOffset == 0 && (endKey != startKey || endOffset == startText.length)) {
    if (previous.kind == 'text') {
      if (next && next.kind == 'text') {
        after = selection.merge({
          anchorKey: previous.key,
          anchorOffset: previous.length,
          focusKey: previous.key,
          focusOffset: previous.length
        });
      } else {
        after = selection.collapseToEndOf(previous);
      }
    } else {
      var last = previous.getLastText();
      after = selection.collapseToEndOf(last);
    }
  } else {
    after = selection.collapseToStart();
  }

  return transform.unsetSelection().deleteAtRange(selection).moveTo(after);
}

/**
 * Delete backward `n` characters at the current selection.
 *
 * @param {Transform} transform
 * @param {Number} n (optional)
 * @return {Transform}
 */

function deleteBackward(transform) {
  var n = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
  var state = transform.state;
  var document = state.document,
      selection = state.selection;

  var after = void 0;

  var startKey = selection.startKey;

  var startNode = document.getDescendant(startKey);

  if (selection.isExpanded) {
    after = selection.collapseToStart();
  } else if (selection.isAtStartOf(document)) {
    after = selection;
  } else if (selection.isAtStartOf(startNode)) {
    var previous = document.getPreviousText(startNode);
    var prevBlock = document.getClosestBlock(previous);
    var prevInline = document.getClosestInline(previous);

    if (prevBlock && prevBlock.isVoid) {
      after = selection;
    } else if (prevInline && prevInline.isVoid) {
      var prevPrev = document.getPreviousText(previous);
      after = selection.collapseToEndOf(prevPrev);
    } else {
      after = selection.collapseToEndOf(previous);
    }
  } else if (selection.isAtEndOf(startNode) && startNode.length == 1) {
    var block = document.getClosestBlock(startKey);
    var highest = block.getHighestChild(startKey);
    var _previous = block.getPreviousSibling(highest);
    var next = block.getNextSibling(highest);

    if (_previous) {
      if (_previous.kind == 'text') {
        if (next && next.kind == 'text') {
          after = selection.merge({
            anchorKey: _previous.key,
            anchorOffset: _previous.length,
            focusKey: _previous.key,
            focusOffset: _previous.length
          });
        } else {
          after = selection.collapseToEndOf(_previous);
        }
      } else {
        var last = _previous.getLastText();
        after = selection.collapseToEndOf(last);
      }
    } else {
      after = selection.moveBackward(n);
    }
  } else {
    after = selection.moveBackward(n);
  }

  return transform.unsetSelection().deleteBackwardAtRange(selection, n).moveTo(after);
}

/**
 * Delete forward `n` characters at the current selection.
 *
 * @param {Transform} transform
 * @param {Number} n (optional)
 * @return {Transform}
 */

function deleteForward(transform) {
  var n = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
  var state = transform.state;
  var document = state.document,
      selection = state.selection,
      startText = state.startText;
  var startKey = selection.startKey,
      startOffset = selection.startOffset;

  var after = void 0;

  var block = document.getClosestBlock(startKey);
  var inline = document.getClosestInline(startKey);
  var highest = block.getHighestChild(startKey);
  var previous = block.getPreviousSibling(highest);
  var next = block.getNextSibling(highest);

  if (selection.isExpanded) {
    after = selection.collapseToStart();
  } else if (block && block.isVoid || inline && inline.isVoid) {
    var nextText = document.getNextText(startKey);
    var prevText = document.getPreviousText(startKey);
    after = next ? selection.collapseToStartOf(nextText) : selection.collapseToEndOf(prevText);
  } else if (previous && startOffset == 0 && startText.length == 1) {
    if (previous.kind == 'text') {
      if (next && next.kind == 'text') {
        after = selection.merge({
          anchorKey: previous.key,
          anchorOffset: previous.length,
          focusKey: previous.key,
          focusOffset: previous.length
        });
      } else {
        after = selection.collapseToEndOf(previous);
      }
    } else {
      var last = previous.getLastText();
      after = selection.collapseToEndOf(last);
    }
  } else {
    after = selection;
  }

  return transform.unsetSelection().deleteForwardAtRange(selection, n).moveTo(after);
}

/**
 * Insert a `block` at the current selection.
 *
 * @param {Transform} transform
 * @param {String || Object || Block} block
 * @return {Transform}
 */

function insertBlock(transform, block) {
  var state = transform.state;
  var _state = state,
      document = _state.document,
      selection = _state.selection;

  var keys = document.getTexts().map(function (text) {
    return text.key;
  });

  transform.unsetSelection();
  transform.insertBlockAtRange(selection, block);
  state = transform.state;
  document = state.document;

  var text = document.getTexts().find(function (n) {
    return !keys.includes(n.key);
  });
  var after = selection.collapseToEndOf(text);

  return transform.moveTo(after);
}

/**
 * Insert a `fragment` at the current selection.
 *
 * @param {Transform} transform
 * @param {Document} fragment
 * @return {Transform}
 */

function insertFragment(transform, fragment) {
  var state = transform.state;
  var _state2 = state,
      document = _state2.document,
      selection = _state2.selection;


  if (!fragment.length) return transform;

  var lastText = fragment.getLastText();
  var lastInline = fragment.getClosestInline(lastText);
  var beforeTexts = document.getTexts();
  var appending = selection.hasEdgeAtEndOf(document.getDescendant(selection.endKey));

  transform.unsetSelection();
  transform.insertFragmentAtRange(selection, fragment);
  state = transform.state;
  document = state.document;

  var keys = beforeTexts.map(function (text) {
    return text.key;
  });
  var news = document.getTexts().filter(function (n) {
    return !keys.includes(n.key);
  });
  var text = appending ? news.last() : news.takeLast(2).first();
  var after = void 0;

  if (text && lastInline) {
    after = selection.collapseToEndOf(text);
  } else if (text) {
    after = selection.collapseToStartOf(text).moveForward(lastText.length);
  } else {
    after = selection.collapseToStart().moveForward(lastText.length);
  }

  return transform.moveTo(after);
}

/**
 * Insert a `inline` at the current selection.
 *
 * @param {Transform} transform
 * @param {String || Object || Block} inline
 * @return {Transform}
 */

function insertInline(transform, inline) {
  var state = transform.state;
  var _state3 = state,
      document = _state3.document,
      selection = _state3.selection,
      startText = _state3.startText;

  var after = void 0;

  var hasVoid = document.hasVoidParent(startText);
  var keys = document.getTexts().map(function (text) {
    return text.key;
  });

  transform.unsetSelection();
  transform.insertInlineAtRange(selection, inline);
  state = transform.state;
  document = state.document;

  if (hasVoid) {
    after = selection;
  } else {
    var text = document.getTexts().find(function (n) {
      if (keys.includes(n.key)) return false;
      var parent = document.getParent(n);
      if (parent.kind != 'inline') return false;
      return true;
    });

    after = selection.collapseToEndOf(text);
  }

  return transform.moveTo(after);
}

/**
 * Insert a `text` string at the current selection.
 *
 * @param {Transform} transform
 * @param {String} text
 * @param {Set} marks (optional)
 * @return {Transform}
 */

function insertText(transform, text, marks) {
  var state = transform.state;
  var document = state.document,
      selection = state.selection;
  var startKey = selection.startKey;

  var isVoid = document.hasVoidParent(startKey);
  var after = void 0;

  if (isVoid) {
    after = selection;
  } else if (selection.isExpanded) {
    after = selection.collapseToStart().moveForward(text.length);
  } else {
    after = selection.moveForward(text.length);
  }

  marks = marks || selection.marks;

  return transform.unsetSelection().insertTextAtRange(selection, text, marks).moveTo(after);
}

/**
 * Set `properties` of the block nodes in the current selection.
 *
 * @param {Transform} transform
 * @param {Object} properties
 * @return {Transform}
 */

function setBlock(transform, properties) {
  var state = transform.state;
  var selection = state.selection;

  return transform.setBlockAtRange(selection, properties);
}

/**
 * Set `properties` of the inline nodes in the current selection.
 *
 * @param {Transform} transform
 * @param {Object} properties
 * @return {Transform}
 */

function setInline(transform, properties) {
  var state = transform.state;
  var selection = state.selection;

  return transform.setInlineAtRange(selection, properties);
}

/**
 * Split the block node at the current selection, to optional `depth`.
 *
 * @param {Transform} transform
 * @param {Number} depth (optional)
 * @return {Transform}
 */

function splitBlock(transform) {
  var depth = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
  var state = transform.state;
  var _state4 = state,
      document = _state4.document,
      selection = _state4.selection;


  transform.unsetSelection();
  transform.splitBlockAtRange(selection, depth);

  state = transform.state;
  document = state.document;

  var startKey = selection.startKey;

  var startNode = document.getDescendant(startKey);
  var nextNode = document.getNextText(startNode);
  var after = selection.collapseToStartOf(nextNode);

  return transform.moveTo(after);
}

/**
 * Split the inline nodes at the current selection, to optional `depth`.
 *
 * @param {Transform} transform
 * @param {Number} depth (optional)
 * @return {Transform}
 */

function splitInline(transform) {
  var depth = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Infinity;
  var state = transform.state;
  var _state5 = state,
      document = _state5.document,
      selection = _state5.selection;

  var after = selection;

  transform.unsetSelection();
  transform.splitInlineAtRange(selection, depth);
  state = transform.state;
  document = state.document;

  var startKey = selection.startKey;

  var inlineParent = document.getClosestInline(startKey);

  if (inlineParent) {
    var startNode = document.getDescendant(startKey);
    var nextNode = document.getNextText(startNode);
    after = selection.collapseToStartOf(nextNode);
  }

  return transform.moveTo(after);
}

/**
 * Remove a `mark` from the characters in the current selection.
 *
 * @param {Transform} transform
 * @param {Mark} mark
 * @return {Transform}
 */

function removeMark(transform, mark) {
  mark = _normalize2.default.mark(mark);

  var state = transform.state;
  var document = state.document,
      selection = state.selection;


  if (selection.isExpanded) {
    return transform.removeMarkAtRange(selection, mark);
  } else if (selection.marks) {
    var marks = selection.marks.remove(mark);
    var sel = selection.merge({ marks: marks });
    return transform.moveTo(sel);
  } else {
    var _marks2 = document.getMarksAtRange(selection).remove(mark);
    var _sel2 = selection.merge({ marks: _marks2 });
    return transform.moveTo(_sel2);
  }
}

/**
 * Add or remove a `mark` from the characters in the current selection,
 * depending on whether it's already there.
 *
 * @param {Transform} transform
 * @param {Mark} mark
 * @return {Transform}
 */

function toggleMark(transform, mark) {
  mark = _normalize2.default.mark(mark);

  var state = transform.state;

  var exists = state.marks.some(function (m) {
    return m.equals(mark);
  });

  if (exists) {
    return transform.removeMark(mark);
  } else {
    return transform.addMark(mark);
  }
}

/**
 * Unwrap the current selection from a block parent with `properties`.
 *
 * @param {Transform} transform
 * @param {Object or String} properties
 * @return {Transform}
 */

function unwrapBlock(transform, properties) {
  var state = transform.state;
  var selection = state.selection;

  return transform.unwrapBlockAtRange(selection, properties);
}

/**
 * Unwrap the current selection from an inline parent with `properties`.
 *
 * @param {Transform} transform
 * @param {Object or String} properties
 * @return {Transform}
 */

function unwrapInline(transform, properties) {
  var state = transform.state;
  var selection = state.selection;

  return transform.unwrapInlineAtRange(selection, properties);
}

/**
 * Wrap the block nodes in the current selection with a new block node with
 * `properties`.
 *
 * @param {Transform} transform
 * @param {Object or String} properties
 * @return {Transform}
 */

function wrapBlock(transform, properties) {
  var state = transform.state;
  var selection = state.selection;

  return transform.wrapBlockAtRange(selection, properties);
}

/**
 * Wrap the current selection in new inline nodes with `properties`.
 *
 * @param {Transform} transform
 * @param {Object or String} properties
 * @return {Transform}
 */

function wrapInline(transform, properties) {
  var state = transform.state;
  var _state6 = state,
      document = _state6.document,
      selection = _state6.selection;

  var after = void 0;

  var startKey = selection.startKey;

  var previous = document.getPreviousText(startKey);

  transform.unsetSelection();
  transform.wrapInlineAtRange(selection, properties);
  state = transform.state;
  document = state.document;

  // Determine what the selection should be after wrapping.
  if (selection.isCollapsed) {
    after = selection;
  } else if (selection.startOffset == 0) {
    var text = previous ? document.getNextText(previous) : document.getFirstText();
    after = selection.moveToRangeOf(text);
  } else if (selection.startKey == selection.endKey) {
    var _text = document.getNextText(selection.startKey);
    after = selection.moveToRangeOf(_text);
  } else {
    var anchor = document.getNextText(selection.anchorKey);
    var focus = document.getDescendant(selection.focusKey);
    after = selection.merge({
      anchorKey: anchor.key,
      anchorOffset: 0,
      focusKey: focus.key,
      focusOffset: selection.focusOffset
    });
  }

  after = after.normalize(document);
  return transform.moveTo(after);
}

/**
 * Wrap the current selection with prefix/suffix.
 *
 * @param {Transform} transform
 * @param {String} prefix
 * @param {String} suffix
 * @return {Transform}
 */

function wrapText(transform, prefix) {
  var suffix = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : prefix;
  var state = transform.state;
  var document = state.document,
      selection = state.selection;
  var anchorOffset = selection.anchorOffset,
      anchorKey = selection.anchorKey,
      focusOffset = selection.focusOffset,
      focusKey = selection.focusKey,
      isBackward = selection.isBackward;

  var after = void 0;

  if (anchorKey == focusKey) {
    after = selection.moveForward(prefix.length);
  } else {
    after = selection.merge({
      anchorOffset: isBackward ? anchorOffset : anchorOffset + prefix.length,
      focusOffset: isBackward ? focusOffset + prefix.length : focusOffset
    });
  }

  return transform.unsetSelection().wrapTextAtRange(selection, prefix, suffix).moveTo(after);
}