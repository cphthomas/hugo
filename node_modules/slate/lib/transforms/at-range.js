'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addMarkAtRange = addMarkAtRange;
exports.deleteAtRange = deleteAtRange;
exports.deleteBackwardAtRange = deleteBackwardAtRange;
exports.deleteForwardAtRange = deleteForwardAtRange;
exports.insertBlockAtRange = insertBlockAtRange;
exports.insertFragmentAtRange = insertFragmentAtRange;
exports.insertInlineAtRange = insertInlineAtRange;
exports.insertTextAtRange = insertTextAtRange;
exports.removeMarkAtRange = removeMarkAtRange;
exports.setBlockAtRange = setBlockAtRange;
exports.setInlineAtRange = setInlineAtRange;
exports.splitBlockAtRange = splitBlockAtRange;
exports.splitInlineAtRange = splitInlineAtRange;
exports.toggleMarkAtRange = toggleMarkAtRange;
exports.unwrapBlockAtRange = unwrapBlockAtRange;
exports.unwrapInlineAtRange = unwrapInlineAtRange;
exports.wrapBlockAtRange = wrapBlockAtRange;
exports.wrapInlineAtRange = wrapInlineAtRange;
exports.wrapTextAtRange = wrapTextAtRange;

var _block = require('../models/block');

var _block2 = _interopRequireDefault(_block);

var _inline = require('../models/inline');

var _inline2 = _interopRequireDefault(_inline);

var _normalize = require('../utils/normalize');

var _normalize2 = _interopRequireDefault(_normalize);

var _selection = require('../models/selection');

var _selection2 = _interopRequireDefault(_selection);

var _text = require('../models/text');

var _text2 = _interopRequireDefault(_text);

var _isInRange = require('../utils/is-in-range');

var _isInRange2 = _interopRequireDefault(_isInRange);

var _uid = require('../utils/uid');

var _uid2 = _interopRequireDefault(_uid);

var _immutable = require('immutable');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Add a new `mark` to the characters at `range`.
 *
 * @param {Transform} transform
 * @param {Selection} range
 * @param {Mixed} mark
 * @return {Transform}
 */

function addMarkAtRange(transform, range, mark) {
  if (range.isCollapsed) return transform;

  var state = transform.state;
  var document = state.document;
  var startKey = range.startKey,
      startOffset = range.startOffset,
      endKey = range.endKey,
      endOffset = range.endOffset;

  var texts = document.getTextsAtRange(range);

  texts.forEach(function (text) {
    var key = text.key;

    var index = 0;
    var length = text.length;

    if (key == startKey) index = startOffset;
    if (key == endKey) length = endOffset;
    if (key == startKey && key == endKey) length = endOffset - startOffset;

    transform.addMarkByKey(key, index, length, mark);
  });

  return transform;
}

/**
 * Delete everything in a `range`.
 *
 * @param {Transform} transform
 * @param {Selection} range
 * @return {Transform}
 */

function deleteAtRange(transform, range) {
  if (range.isCollapsed) return transform;

  var startKey = range.startKey,
      startOffset = range.startOffset,
      endKey = range.endKey,
      endOffset = range.endOffset;


  if (startKey == endKey) {
    var index = startOffset;
    var length = endOffset - startOffset;
    return transform.removeTextByKey(startKey, index, length);
  }

  var state = transform.state;
  var _state = state,
      document = _state.document;

  // split the nodes at range, within the common ancestor

  var ancestor = document.getCommonAncestor(startKey, endKey);
  var startChild = ancestor.getHighestChild(startKey);
  var endChild = ancestor.getHighestChild(endKey);
  var startOff = (startChild.key === startKey ? 0 : startChild.getOffset(startKey)) + startOffset;
  var endOff = (endChild.key === endKey ? 0 : endChild.getOffset(endKey)) + endOffset;

  transform.splitNodeByKey(startChild.key, startOff);
  transform.splitNodeByKey(endChild.key, endOff);

  state = transform.state;
  document = state.document;
  var startBlock = document.getClosestBlock(startKey);
  var endBlock = document.getClosestBlock(document.getNextText(endKey));

  // remove all of the nodes between range
  ancestor = document.getCommonAncestor(startKey, endKey);
  startChild = ancestor.getHighestChild(startKey);
  endChild = ancestor.getHighestChild(endKey);
  var startIndex = ancestor.nodes.indexOf(startChild);
  var endIndex = ancestor.nodes.indexOf(endChild);
  var middles = ancestor.nodes.slice(startIndex + 1, endIndex + 1);

  middles.forEach(function (child) {
    transform.removeNodeByKey(child.key);
  });

  // "normalize" the document so blocks in the range are also removed
  if (startBlock.key !== endBlock.key) {
    endBlock.nodes.forEach(function (child, i) {
      var newKey = startBlock.key;
      var newIndex = startBlock.nodes.size + i;
      transform.moveNodeByKey(child.key, newKey, newIndex);
    });

    var lonely = document.getFurthest(endBlock, function (p) {
      return p.nodes.size == 1;
    }) || endBlock;
    transform.removeNodeByKey(lonely.key);
  }

  transform.normalizeDocument();
  return transform;
}

/**
 * Delete backward `n` characters at a `range`.
 *
 * @param {Transform} transform
 * @param {Selection} range
 * @param {Number} n (optional)
 * @return {Transform}
 */

function deleteBackwardAtRange(transform, range) {
  var n = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
  var state = transform.state;
  var document = state.document;
  var _range = range,
      startKey = _range.startKey,
      focusOffset = _range.focusOffset;

  var text = document.getDescendant(startKey);
  var block = document.getClosestBlock(startKey);
  var inline = document.getClosestInline(startKey);

  if (range.isExpanded) {
    return transform.deleteAtRange(range);
  }

  if (block && block.isVoid) {
    return transform.removeNodeByKey(block.key);
  }

  if (inline && inline.isVoid) {
    return transform.removeNodeByKey(inline.key);
  }

  if (range.isAtStartOf(document)) {
    return transform;
  }

  if (range.isAtStartOf(text)) {
    var prev = document.getPreviousText(text);
    var prevBlock = document.getClosestBlock(prev);
    var prevInline = document.getClosestInline(prev);

    if (prevBlock && prevBlock.isVoid) {
      return transform.removeNodeByKey(prevBlock.key);
    }

    if (prevInline && prevInline.isVoid) {
      return transform.removeNodeByKey(prevInline.key);
    }

    range = range.merge({
      anchorKey: prev.key,
      anchorOffset: prev.length
    });

    return transform.deleteAtRange(range);
  }

  range = range.merge({
    focusOffset: focusOffset - n,
    isBackward: true
  });

  return transform.deleteAtRange(range);
}

/**
 * Delete forward `n` characters at a `range`.
 *
 * @param {Transform} transform
 * @param {Selection} range
 * @param {Number} n (optional)
 * @return {Transform}
 */

function deleteForwardAtRange(transform, range) {
  var n = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
  var state = transform.state;
  var document = state.document;
  var _range2 = range,
      startKey = _range2.startKey,
      focusOffset = _range2.focusOffset;

  var text = document.getDescendant(startKey);
  var inline = document.getClosestInline(startKey);
  var block = document.getClosestBlock(startKey);

  if (range.isExpanded) {
    return transform.deleteAtRange(range);
  }

  if (block && block.isVoid) {
    return transform.removeNodeByKey(block.key);
  }

  if (inline && inline.isVoid) {
    return transform.removeNodeByKey(inline.key);
  }

  if (range.isAtEndOf(document)) {
    return transform;
  }

  if (range.isAtEndOf(text)) {
    var next = document.getNextText(text);
    var nextBlock = document.getClosestBlock(next);
    var nextInline = document.getClosestInline(next);

    if (nextBlock && nextBlock.isVoid) {
      return transform.removeNodeByKey(nextBlock.key);
    }

    if (nextInline && nextInline.isVoid) {
      return transform.removeNodeByKey(nextInline.key);
    }

    range = range.merge({
      focusKey: next.key,
      focusOffset: 0
    });

    return transform.deleteAtRange(range);
  }

  range = range.merge({
    focusOffset: focusOffset + n
  });

  return transform.deleteAtRange(range);
}

/**
 * Insert a `block` node at `range`.
 *
 * @param {Transform} transform
 * @param {Selection} range
 * @param {Block or String or Object} block
 * @return {Transform}
 */

function insertBlockAtRange(transform, range, block) {
  block = _normalize2.default.block(block);

  if (range.isExpanded) {
    transform.deleteAtRange(range);
    range = range.collapseToStart();
  }

  var state = transform.state;
  var document = state.document;
  var _range3 = range,
      startKey = _range3.startKey,
      startOffset = _range3.startOffset;

  var startText = document.assertDescendant(startKey);
  var startBlock = document.getClosestBlock(startKey);
  var parent = document.getParent(startBlock);
  var index = parent.nodes.indexOf(startBlock);

  if (startBlock.isVoid) {
    transform.insertNodeByKey(parent.key, index + 1, block);
  } else if (startBlock.isEmpty) {
    transform.removeNodeByKey(startBlock.key);
    transform.insertNodeByKey(parent.key, index, block);
  } else if (range.isAtStartOf(startBlock)) {
    transform.insertNodeByKey(parent.key, index, block);
  } else if (range.isAtEndOf(startBlock)) {
    transform.insertNodeByKey(parent.key, index + 1, block);
  } else {
    var offset = startBlock.getOffset(startText) + startOffset;
    transform.splitNodeByKey(startBlock.key, offset);
    transform.insertNodeByKey(parent.key, index + 1, block);
  }

  transform.normalizeDocument();
  return transform;
}

/**
 * Insert a `fragment` at a `range`.
 *
 * @param {Transform} transform
 * @param {Selection} range
 * @param {Document} fragment
 * @return {Transform}
 */

function insertFragmentAtRange(transform, range, fragment) {
  if (range.isExpanded) {
    transform.deleteAtRange(range);
    range = range.collapseToStart();
  }

  if (!fragment.length) return transform;

  fragment = fragment.mapDescendants(function (child) {
    return child.set('key', (0, _uid2.default)());
  });

  var _range4 = range,
      startKey = _range4.startKey,
      startOffset = _range4.startOffset;
  var state = transform.state;
  var _state2 = state,
      document = _state2.document;

  var startText = document.getDescendant(startKey);
  var startBlock = document.getClosestBlock(startText);
  var startChild = startBlock.getHighestChild(startText);
  var parent = document.getParent(startBlock);
  var index = parent.nodes.indexOf(startBlock);
  var offset = startChild == startText ? startOffset : startChild.getOffset(startText) + startOffset;

  var blocks = fragment.getBlocks();
  var firstBlock = blocks.first();
  var lastBlock = blocks.last();

  if (firstBlock != lastBlock) {
    (function () {
      var lonelyParent = fragment.getFurthest(firstBlock, function (p) {
        return p.nodes.size == 1;
      });
      var lonelyChild = lonelyParent || firstBlock;
      var startIndex = parent.nodes.indexOf(startBlock);
      fragment = fragment.removeDescendant(lonelyChild);

      fragment.nodes.forEach(function (node, i) {
        var newIndex = startIndex + i + 1;
        transform.insertNodeByKey(parent.key, newIndex, node);
      });
    })();
  }

  transform.splitNodeByKey(startChild.key, offset);

  state = transform.state;
  document = state.document;
  startText = document.getDescendant(startKey);
  startBlock = document.getClosestBlock(startKey);
  startChild = startBlock.getHighestChild(startText);

  if (firstBlock != lastBlock) {
    (function () {
      var nextChild = startBlock.getNextSibling(startChild);
      var nextNodes = startBlock.nodes.skipUntil(function (n) {
        return n == nextChild;
      });
      var lastIndex = lastBlock.nodes.size;

      nextNodes.forEach(function (node, i) {
        var newIndex = lastIndex + i;
        transform.moveNodeByKey(node.key, lastBlock.key, newIndex);
      });
    })();
  }

  if (startBlock.isEmpty) {
    transform.removeNodeByKey(startBlock.key);
    transform.insertNodeByKey(parent.key, index, firstBlock);
  } else {
    (function () {
      var inlineChild = startBlock.getHighestChild(startText);
      var inlineIndex = startBlock.nodes.indexOf(inlineChild);

      firstBlock.nodes.forEach(function (inline, i) {
        var newIndex = inlineIndex + i + 1;
        transform.insertNodeByKey(startBlock.key, newIndex, inline);
      });
    })();
  }

  transform.normalizeDocument();
  return transform;
}

/**
 * Insert an `inline` node at `range`.
 *
 * @param {Transform} transform
 * @param {Selection} range
 * @param {Inline or String or Object} inline
 * @return {Transform}
 */

function insertInlineAtRange(transform, range, inline) {
  inline = _normalize2.default.inline(inline);

  if (range.isExpanded) {
    transform.deleteAtRange(range);
    range = range.collapseToStart();
  }

  var state = transform.state;
  var document = state.document;
  var _range5 = range,
      startKey = _range5.startKey,
      startOffset = _range5.startOffset;

  var parent = document.getParent(startKey);
  var startText = document.assertDescendant(startKey);
  var index = parent.nodes.indexOf(startText);

  if (parent.isVoid) {
    return transform;
  }

  transform.splitNodeByKey(startKey, startOffset);
  transform.insertNodeByKey(parent.key, index + 1, inline);
  transform.normalizeDocument();
  return transform;
}

/**
 * Insert `text` at a `range`, with optional `marks`.
 *
 * @param {Transform} transform
 * @param {Selection} range
 * @param {String} text
 * @param {Set} marks (optional)
 * @return {Transform}
 */

function insertTextAtRange(transform, range, text, marks) {
  var state = transform.state;
  var document = state.document;
  var startKey = range.startKey,
      startOffset = range.startOffset;

  var parent = document.getParent(startKey);

  if (parent.isVoid) {
    return transform;
  }

  if (range.isExpanded) {
    transform.deleteAtRange(range);
  }

  transform.insertTextByKey(startKey, startOffset, text, marks);
  return transform;
}

/**
 * Remove an existing `mark` to the characters at `range`.
 *
 * @param {Transform} transform
 * @param {Selection} range
 * @param {Mark or String} mark (optional)
 * @return {Transform}
 */

function removeMarkAtRange(transform, range, mark) {
  if (range.isCollapsed) return transform;

  var state = transform.state;
  var document = state.document;

  var texts = document.getTextsAtRange(range);
  var startKey = range.startKey,
      startOffset = range.startOffset,
      endKey = range.endKey,
      endOffset = range.endOffset;


  texts.forEach(function (text) {
    var key = text.key;

    var index = 0;
    var length = text.length;

    if (key == startKey) index = startOffset;
    if (key == endKey) length = endOffset;
    if (key == startKey && key == endKey) length = endOffset - startOffset;

    transform.removeMarkByKey(key, index, length, mark);
  });

  return transform;
}

/**
 * Set the `properties` of block nodes in a `range`.
 *
 * @param {Transform} transform
 * @param {Selection} range
 * @param {Object || String} properties
 * @return {Transform}
 */

function setBlockAtRange(transform, range, properties) {
  var state = transform.state;
  var document = state.document;

  var blocks = document.getBlocksAtRange(range);

  blocks.forEach(function (block) {
    transform.setNodeByKey(block.key, properties);
  });

  return transform;
}

/**
 * Set the `properties` of inline nodes in a `range`.
 *
 * @param {Transform} transform
 * @param {Selection} range
 * @param {Object || String} properties
 * @return {Transform}
 */

function setInlineAtRange(transform, range, properties) {
  var state = transform.state;
  var document = state.document;

  var inlines = document.getInlinesAtRange(range);

  inlines.forEach(function (inline) {
    transform.setNodeByKey(inline.key, properties);
  });

  return transform;
}

/**
 * Split the block nodes at a `range`, to optional `height`.
 *
 * @param {Transform} transform
 * @param {Selection} range
 * @param {Number} height (optional)
 * @return {Transform}
 */

function splitBlockAtRange(transform, range) {
  var height = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;

  if (range.isExpanded) {
    transform.deleteAtRange(range);
    range = range.collapseToStart();
  }

  var _range6 = range,
      startKey = _range6.startKey,
      startOffset = _range6.startOffset;
  var state = transform.state;
  var document = state.document;

  var node = document.assertDescendant(startKey);
  var parent = document.getClosestBlock(node);
  var offset = startOffset;
  var h = 0;

  while (parent && parent.kind == 'block' && h < height) {
    offset += parent.getOffset(node);
    node = parent;
    parent = document.getClosestBlock(parent);
    h++;
  }

  transform.splitNodeByKey(node.key, offset);
  transform.normalizeDocument();
  return transform;
}

/**
 * Split the inline nodes at a `range`, to optional `height`.
 *
 * @param {Transform} transform
 * @param {Selection} range
 * @param {Number} height (optiona)
 * @return {Transform}
 */

function splitInlineAtRange(transform, range) {
  var height = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : Infinity;

  if (range.isExpanded) {
    transform.deleteAtRange(range);
    range = range.collapseToStart();
  }

  var _range7 = range,
      startKey = _range7.startKey,
      startOffset = _range7.startOffset;
  var state = transform.state;
  var document = state.document;

  var node = document.assertDescendant(startKey);
  var parent = document.getClosestInline(node);
  var offset = startOffset;
  var h = 0;

  while (parent && parent.kind == 'inline' && h < height) {
    offset += parent.getOffset(node);
    node = parent;
    parent = document.getClosestInline(parent);
    h++;
  }

  return transform.splitNodeByKey(node.key, offset);
}

/**
 * Add or remove a `mark` from the characters at `range`, depending on whether
 * it's already there.
 *
 * @param {Transform} transform
 * @param {Selection} range
 * @param {Mixed} mark
 * @return {Transform}
 */

function toggleMarkAtRange(transform, range, mark) {
  if (range.isCollapsed) return transform;

  mark = _normalize2.default.mark(mark);

  var state = transform.state;
  var document = state.document;

  var marks = document.getMarksAtRange(range);
  var exists = marks.some(function (m) {
    return m.equals(mark);
  });

  if (exists) {
    transform.removeMarkAtRange(range, mark);
  } else {
    transform.addMarkAtRange(range, mark);
  }

  return transform;
}

/**
 * Unwrap all of the block nodes in a `range` from a block with `properties`.
 *
 * @param {Transform} transform
 * @param {Selection} range
 * @param {String or Object} properties
 * @return {Transform}
 */

function unwrapBlockAtRange(transform, range, properties) {
  properties = _normalize2.default.nodeProperties(properties);

  var state = transform.state;
  var _state3 = state,
      document = _state3.document;

  var blocks = document.getBlocksAtRange(range);
  var wrappers = blocks.map(function (block) {
    return document.getClosest(block, function (parent) {
      if (parent.kind != 'block') return false;
      if (properties.type != null && parent.type != properties.type) return false;
      if (properties.isVoid != null && parent.isVoid != properties.isVoid) return false;
      if (properties.data != null && !parent.data.isSuperset(properties.data)) return false;
      return true;
    });
  }).filter(function (exists) {
    return exists;
  }).toOrderedSet().toList();

  wrappers.forEach(function (block) {
    var first = block.nodes.first();
    var last = block.nodes.last();
    var parent = document.getParent(block);
    var index = parent.nodes.indexOf(block);

    var children = block.nodes.filter(function (child) {
      return blocks.some(function (b) {
        return child == b || child.hasDescendant(b);
      });
    });

    var firstMatch = children.first();
    var lastMatch = children.last();

    if (first == firstMatch && last == lastMatch) {
      block.nodes.forEach(function (child, i) {
        transform.moveNodeByKey(child.key, parent.key, index + i);
      });

      transform.removeNodeByKey(block.key);
    } else if (last == lastMatch) {
      block.nodes.skipUntil(function (n) {
        return n == firstMatch;
      }).forEach(function (child, i) {
        transform.moveNodeByKey(child.key, parent.key, index + 1 + i);
      });
    } else if (first == firstMatch) {
      block.nodes.takeUntil(function (n) {
        return n == lastMatch;
      }).push(lastMatch).forEach(function (child, i) {
        transform.moveNodeByKey(child.key, parent.key, index + i);
      });
    } else {
      var offset = block.getOffset(firstMatch);

      transform.splitNodeByKey(block.key, offset);
      state = transform.state;
      document = state.document;
      var extra = document.getPreviousSibling(firstMatch);

      children.forEach(function (child, i) {
        transform.moveNodeByKey(child.key, parent.key, index + 1 + i);
      });

      transform.removeNodeByKey(extra.key);
    }
  });

  transform.normalizeDocument();
  return transform;
}

/**
 * Unwrap the inline nodes in a `range` from an inline with `properties`.
 *
 * @param {Transform} transform
 * @param {Selection} range
 * @param {String or Object} properties
 * @return {Transform}
 */

function unwrapInlineAtRange(transform, range, properties) {
  properties = _normalize2.default.nodeProperties(properties);

  var state = transform.state;
  var document = state.document;

  var texts = document.getTextsAtRange(range);
  var inlines = texts.map(function (text) {
    return document.getClosest(text, function (parent) {
      if (parent.kind != 'inline') return false;
      if (properties.type != null && parent.type != properties.type) return false;
      if (properties.isVoid != null && parent.isVoid != properties.isVoid) return false;
      if (properties.data != null && !parent.data.isSuperset(properties.data)) return false;
      return true;
    });
  }).filter(function (exists) {
    return exists;
  }).toOrderedSet().toList();

  inlines.forEach(function (inline) {
    var parent = document.getParent(inline);
    var index = parent.nodes.indexOf(inline);

    inline.nodes.forEach(function (child, i) {
      transform.moveNodeByKey(child.key, parent.key, index + i);
    });
  });

  transform.normalizeDocument();
  return transform;
}

/**
 * Wrap all of the blocks in a `range` in a new `block`.
 *
 * @param {Transform} transform
 * @param {Selection} range
 * @param {Block || Object || String} block
 * @return {Transform}
 */

function wrapBlockAtRange(transform, range, block) {
  block = _normalize2.default.block(block);

  var state = transform.state;
  var document = state.document;


  var blocks = document.getBlocksAtRange(range);
  var firstblock = blocks.first();
  var lastblock = blocks.last();
  var parent = void 0,
      siblings = void 0,
      index = void 0;

  // if there is only one block in the selection then we know the parent and siblings
  if (blocks.length === 1) {
    parent = document.getParent(firstblock);
    siblings = blocks;
  }

  // determine closest shared parent to all blocks in selection
  else {
      parent = document.getClosest(firstblock, function (p1) {
        return !!document.getClosest(lastblock, function (p2) {
          return p1 == p2;
        });
      });
    }

  // if no shared parent could be found then the parent is the document
  if (parent == null) parent = document;

  // create a list of direct children siblings of parent that fall in the selection
  if (siblings == null) {
    var indexes = parent.nodes.reduce(function (ind, node, i) {
      if (node == firstblock || node.hasDescendant(firstblock)) ind[0] = i;
      if (node == lastblock || node.hasDescendant(lastblock)) ind[1] = i;
      return ind;
    }, []);

    index = indexes[0];
    siblings = parent.nodes.slice(indexes[0], indexes[1] + 1);
  }

  // get the index to place the new wrapped node at
  if (index == null) {
    index = parent.nodes.indexOf(siblings.first());
  }

  // inject the new block node into the parent
  if (parent != document) {
    transform.insertNodeByKey(parent.key, index, block);
  } else {
    transform.insertNodeOperation([], index, block);
  }

  // move the sibling nodes into the new block node
  siblings.forEach(function (node, i) {
    transform.moveNodeByKey(node.key, block.key, i);
  });

  return transform;
}

/**
 * Wrap the text and inlines in a `range` in a new `inline`.
 *
 * @param {Transform} transform
 * @param {Selection} range
 * @param {Inline || Object || String} inline
 * @return {Transform}
 */

function wrapInlineAtRange(transform, range, inline) {
  if (range.isCollapsed) return transform;

  inline = _normalize2.default.inline(inline);

  var startKey = range.startKey,
      startOffset = range.startOffset,
      endKey = range.endKey,
      endOffset = range.endOffset;
  var state = transform.state;
  var _state4 = state,
      document = _state4.document;

  var blocks = document.getBlocksAtRange(range);
  var startBlock = document.getClosestBlock(startKey);
  var endBlock = document.getClosestBlock(endKey);
  var startChild = startBlock.getHighestChild(startKey);
  var endChild = endBlock.getHighestChild(endKey);
  var startIndex = startBlock.nodes.indexOf(startChild);
  var endIndex = endBlock.nodes.indexOf(endChild);

  var startOff = startChild.key == startKey ? startOffset : startChild.getOffset(startKey) + startOffset;

  var endOff = endChild.key == endKey ? endOffset : endChild.getOffset(endKey) + endOffset;

  if (startBlock == endBlock) {
    (function () {
      transform.splitNodeByKey(endChild.key, endOff);
      transform.splitNodeByKey(startChild.key, startOff);

      state = transform.state;
      document = state.document;
      startBlock = document.getClosestBlock(startKey);
      startChild = startBlock.getHighestChild(startKey);
      var startInner = document.getNextSibling(startChild);
      var startInnerIndex = startBlock.nodes.indexOf(startInner);
      var endInner = startKey == endKey ? startInner : startBlock.getHighestChild(endKey);
      var inlines = startBlock.nodes.skipUntil(function (n) {
        return n == startInner;
      }).takeUntil(function (n) {
        return n == endInner;
      }).push(endInner);

      var node = inline.merge({ key: (0, _uid2.default)() });

      transform.insertNodeByKey(startBlock.key, startInnerIndex, node);

      inlines.forEach(function (child, i) {
        transform.moveNodeByKey(child.key, node.key, i);
      });
    })();
  } else {
    (function () {
      transform.splitNodeByKey(startChild.key, startOff);
      transform.splitNodeByKey(endChild.key, endOff);

      state = transform.state;
      document = state.document;
      startBlock = document.getDescendant(startBlock.key);
      endBlock = document.getDescendant(endBlock.key);

      var startInlines = startBlock.nodes.slice(startIndex + 1);
      var endInlines = endBlock.nodes.slice(0, endIndex + 1);
      var startNode = inline.merge({ key: (0, _uid2.default)() });
      var endNode = inline.merge({ key: (0, _uid2.default)() });

      transform.insertNodeByKey(startBlock.key, startIndex - 1, startNode);
      transform.insertNodeByKey(endBlock.key, endIndex, endNode);

      startInlines.forEach(function (child, i) {
        transform.moveNodeByKey(child.key, startNode.key, i);
      });

      endInlines.forEach(function (child, i) {
        transform.moveNodeByKey(child.key, endNode.key, i);
      });

      blocks.slice(1, -1).forEach(function (block) {
        var node = inline.merge({ key: (0, _uid2.default)() });
        transform.insertNodeByKey(block.key, 0, node);

        block.nodes.forEach(function (child, i) {
          transform.moveNodeByKey(child.key, node.key, i);
        });
      });
    })();
  }

  transform.normalizeDocument();
  return transform;
}

/**
 * Wrap the text in a `range` in a prefix/suffix.
 *
 * @param {Transform} transform
 * @param {Selection} range
 * @param {String} prefix
 * @param {String} suffix (optional)
 * @return {Transform}
 */

function wrapTextAtRange(transform, range, prefix) {
  var suffix = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : prefix;
  var startKey = range.startKey,
      endKey = range.endKey;

  var start = range.collapseToStart();
  var end = range.collapseToEnd();

  if (startKey == endKey) {
    end = end.moveForward(prefix.length);
  }

  transform.insertTextAtRange(start, prefix);
  transform.insertTextAtRange(end, suffix);
  return transform;
}