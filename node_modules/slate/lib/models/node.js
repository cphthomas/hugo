'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _block = require('./block');

var _block2 = _interopRequireDefault(_block);

var _character = require('./character');

var _character2 = _interopRequireDefault(_character);

var _data = require('./data');

var _data2 = _interopRequireDefault(_data);

var _document = require('./document');

var _document2 = _interopRequireDefault(_document);

var _inline = require('./inline');

var _inline2 = _interopRequireDefault(_inline);

var _mark = require('./mark');

var _mark2 = _interopRequireDefault(_mark);

var _normalize = require('../utils/normalize');

var _normalize2 = _interopRequireDefault(_normalize);

var _selection = require('./selection');

var _selection2 = _interopRequireDefault(_selection);

var _text2 = require('./text');

var _text3 = _interopRequireDefault(_text2);

var _direction = require('direction');

var _direction2 = _interopRequireDefault(_direction);

var _isInRange = require('../utils/is-in-range');

var _isInRange2 = _interopRequireDefault(_isInRange);

var _includes = require('lodash/includes');

var _includes2 = _interopRequireDefault(_includes);

var _memoize = require('../utils/memoize');

var _memoize2 = _interopRequireDefault(_memoize);

var _uid = require('../utils/uid');

var _uid2 = _interopRequireDefault(_uid);

var _immutable = require('immutable');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Node.
 *
 * And interface that `Document`, `Block` and `Inline` all implement, to make
 * working with the recursive node tree easier.
 */

var Node = {

  /**
   * Assert that a node has a child by `key` and return it.
   *
   * @param {String or Node} key
   * @return {Node}
   */

  assertChild: function assertChild(key) {
    var child = this.getChild(key);

    if (!child) {
      key = _normalize2.default.key(key);
      throw new Error('Could not find a child node with key "' + key + '".');
    }

    return child;
  },


  /**
   * Assert that a node has a descendant by `key` and return it.
   *
   * @param {String or Node} key
   * @return {Node}
   */

  assertDescendant: function assertDescendant(key) {
    var descendant = this.getDescendant(key);

    if (!descendant) {
      key = _normalize2.default.key(key);
      throw new Error('Could not find a descendant node with key "' + key + '".');
    }

    return descendant;
  },


  /**
   * Assert that a node exists at `path` and return it.
   *
   * @param {Array} path
   * @return {Node}
   */

  assertPath: function assertPath(path) {
    var descendant = this.getDescendantAtPath(path);

    if (!descendant) {
      throw new Error('Could not find a descendant at path "' + path + '".');
    }

    return descendant;
  },


  /**
   * Concat children `nodes` on to the end of the node.
   *
   * @param {List} nodes
   * @return {Node} node
   */

  concatChildren: function concatChildren(nodes) {
    nodes = this.nodes.concat(nodes);
    return this.merge({ nodes: nodes });
  },


  /**
   * Decorate all of the text nodes with a `decorator` function.
   *
   * @param {Function} decorator
   * @return {Node} node
   */

  decorateTexts: function decorateTexts(decorator) {
    return this.mapDescendants(function (child) {
      return child.kind == 'text' ? child.decorateCharacters(decorator) : child;
    });
  },


  /**
   * Recursively find all descendant nodes by `iterator`. Breadth first.
   *
   * @param {Function} iterator
   * @return {Node or Null} node
   */

  findDescendant: function findDescendant(iterator) {
    var found = this.nodes.find(iterator);
    if (found) return found;

    var descendantFound = null;
    this.nodes.find(function (node) {
      if (node.kind != 'text') {
        descendantFound = node.findDescendant(iterator);
        return descendantFound;
      } else {
        return false;
      }
    });

    return descendantFound;
  },


  /**
   * Recursively find all descendant nodes by `iterator`. Depth first.
   *
   * @param {Function} iterator
   * @return {Node or Null} node
   */

  findDescendantDeep: function findDescendantDeep(iterator) {
    var descendantFound = null;

    var found = this.nodes.find(function (node) {
      if (node.kind != 'text') {
        descendantFound = node.findDescendantDeep(iterator);
        return descendantFound || iterator(node);
      }

      return iterator(node) ? node : null;
    });

    return descendantFound || found;
  },


  /**
   * Recursively filter all descendant nodes with `iterator`.
   *
   * @param {Function} iterator
   * @return {List} nodes
   */

  filterDescendants: function filterDescendants(iterator) {
    return this.nodes.reduce(function (matches, child, i, nodes) {
      if (iterator(child, i, nodes)) matches = matches.push(child);
      if (child.kind != 'text') matches = matches.concat(child.filterDescendants(iterator));
      return matches;
    }, _block2.default.createList());
  },


  /**
   * Recursively filter all descendant nodes with `iterator`, depth-first.
   *
   * @param {Function} iterator
   * @return {List} nodes
   */

  filterDescendantsDeep: function filterDescendantsDeep(iterator) {
    return this.nodes.reduce(function (matches, child, i, nodes) {
      if (child.kind != 'text') matches = matches.concat(child.filterDescendantsDeep(iterator));
      if (iterator(child, i, nodes)) matches = matches.push(child);
      return matches;
    }, _block2.default.createList());
  },


  /**
   * Get the closest block nodes for each text node in the node.
   *
   * @return {List} nodes
   */

  getBlocks: function getBlocks() {
    var _this = this;

    return this.getTexts().map(function (text) {
      return _this.getClosestBlock(text);
    }).toOrderedSet().toList();
  },


  /**
   * Get the closest block nodes for each text node in a `range`.
   *
   * @param {Selection} range
   * @return {List} nodes
   */

  getBlocksAtRange: function getBlocksAtRange(range) {
    var _this2 = this;

    return this.getTextsAtRange(range).map(function (text) {
      return _this2.getClosestBlock(text);
    });
  },


  /**
   * Get a list of the characters in a `range`.
   *
   * @param {Selection} range
   * @return {List} characters
   */

  getCharactersAtRange: function getCharactersAtRange(range) {
    return this.getTextsAtRange(range).reduce(function (characters, text) {
      var chars = text.characters.filter(function (char, i) {
        return (0, _isInRange2.default)(i, text, range);
      });
      return characters.concat(chars);
    }, _character2.default.createList());
  },


  /**
   * Get children after a child by `key`.
   *
   * @param {String or Node} key
   * @return {Node} node
   */

  getChildrenAfter: function getChildrenAfter(key) {
    var child = this.assertChild(key);
    var index = this.nodes.indexOf(child);
    return this.nodes.slice(index + 1);
  },


  /**
   * Get children after a child by `key`, including the child.
   *
   * @param {String or Node} key
   * @return {Node} node
   */

  getChildrenAfterIncluding: function getChildrenAfterIncluding(key) {
    var child = this.assertChild(key);
    var index = this.nodes.indexOf(child);
    return this.nodes.slice(index);
  },


  /**
   * Get children before a child by `key`.
   *
   * @param {String or Node} key
   * @return {Node} node
   */

  getChildrenBefore: function getChildrenBefore(key) {
    var child = this.assertChild(key);
    var index = this.nodes.indexOf(child);
    return this.nodes.slice(0, index);
  },


  /**
   * Get children before a child by `key`, including the child.
   *
   * @param {String or Node} key
   * @return {Node} node
   */

  getChildrenBeforeIncluding: function getChildrenBeforeIncluding(key) {
    var child = this.assertChild(key);
    var index = this.nodes.indexOf(child);
    return this.nodes.slice(0, index + 1);
  },


  /**
   * Get children between two child keys.
   *
   * @param {String or Node} start
   * @param {String or Node} end
   * @return {Node} node
   */

  getChildrenBetween: function getChildrenBetween(start, end) {
    start = this.assertChild(start);
    start = this.nodes.indexOf(start);
    end = this.assertChild(end);
    end = this.nodes.indexOf(end);
    return this.nodes.slice(start + 1, end);
  },


  /**
   * Get children between two child keys, including the two children.
   *
   * @param {String or Node} start
   * @param {String or Node} end
   * @return {Node} node
   */

  getChildrenBetweenIncluding: function getChildrenBetweenIncluding(start, end) {
    start = this.assertChild(start);
    start = this.nodes.indexOf(start);
    end = this.assertChild(end);
    end = this.nodes.indexOf(end);
    return this.nodes.slice(start, end + 1);
  },


  /**
   * Get closest parent of node by `key` that matches `iterator`.
   *
   * @param {String or Node} key
   * @param {Function} iterator
   * @return {Node or Null} node
   */

  getClosest: function getClosest(key, iterator) {
    var ancestors = this.getAncestors(key);
    if (!ancestors) {
      throw new Error('Could not find a descendant node with key "' + key + '".');
    }

    // Exclude this node itself
    return ancestors.rest().findLast(iterator);
  },


  /**
   * Get the closest block parent of a `node`.
   *
   * @param {String or Node} key
   * @return {Node or Null} node
   */

  getClosestBlock: function getClosestBlock(key) {
    return this.getClosest(key, function (parent) {
      return parent.kind == 'block';
    });
  },


  /**
   * Get the closest inline parent of a `node`.
   *
   * @param {String or Node} key
   * @return {Node or Null} node
   */

  getClosestInline: function getClosestInline(key) {
    return this.getClosest(key, function (parent) {
      return parent.kind == 'inline';
    });
  },


  /**
   * Get a child node by `key`.
   *
   * @param {String or Node} key
   * @return {Node or Null} node
   */

  getChild: function getChild(key) {
    key = _normalize2.default.key(key);
    return this.nodes.find(function (node) {
      return node.key == key;
    });
  },


  /**
   * Get the common ancestor of nodes `one` and `two` by keys.
   *
   * @param {String or Node} one
   * @param {String or Node} two
   * @return {Node}
   */

  getCommonAncestor: function getCommonAncestor(one, two) {
    this.assertDescendant(one);
    this.assertDescendant(two);
    var ancestors = new _immutable.List();
    var oneParent = this.getParent(one);
    var twoParent = this.getParent(two);

    while (oneParent) {
      ancestors = ancestors.push(oneParent);
      oneParent = this.getParent(oneParent);
    }

    while (twoParent) {
      if (ancestors.includes(twoParent)) return twoParent;
      twoParent = this.getParent(twoParent);
    }
  },


  /**
   * Get the component for the node from a `schema`.
   *
   * @param {Schema} schema
   * @return {Component || Void}
   */

  getComponent: function getComponent(schema) {
    return schema.__getComponent(this);
  },


  /**
   * Get the decorations for the node from a `schema`.
   *
   * @param {Schema} schema
   * @return {Array}
   */

  getDecorators: function getDecorators(schema) {
    return schema.__getDecorators(this);
  },


  /**
   * Get the decorations for a descendant by `key` given a `schema`.
   *
   * @param {String} key
   * @param {Schema} schema
   * @return {Array}
   */

  getDescendantDecorators: function getDescendantDecorators(key, schema) {
    var descendant = this.assertDescendant(key);
    var child = this.getHighestChild(key);
    var decorators = [];

    while (child != descendant) {
      decorators = decorators.concat(child.getDecorators(schema));
      child = child.getHighestChild(key);
    }

    decorators = decorators.concat(descendant.getDecorators(schema));
    return decorators;
  },


  /**
   * Get a descendant node by `key`.
   *
   * @param {String} key
   * @return {Node or Null} node
   */

  getDescendant: function getDescendant(key) {
    key = _normalize2.default.key(key);

    return this.findDescendantDeep(function (node) {
      return node.key == key;
    });
  },


  /**
   * Get a descendant by `path`.
   *
   * @param {Array} path
   * @return {Node || Void}
   */

  getDescendantAtPath: function getDescendantAtPath(path) {
    var descendant = this;

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = path[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var index = _step.value;

        if (!descendant) return;
        if (!descendant.nodes) return;
        descendant = descendant.nodes.get(index);
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

    return descendant;
  },


  /**
   * Get the depth of a child node by `key`, with optional `startAt`.
   *
   * @param {String or Node} key
   * @param {Number} startAt (optional)
   * @return {Number} depth
   */

  getDepth: function getDepth(key) {
    var startAt = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

    this.assertDescendant(key);
    return this.hasChild(key) ? startAt : this.getHighestChild(key).getDepth(key, startAt + 1);
  },


  /**
   * Get a fragment of the node at a `range`.
   *
   * @param {Selection} range
   * @return {List} nodes
   */

  getFragmentAtRange: function getFragmentAtRange(range) {
    var node = this;
    var nodes = _block2.default.createList();

    // If the range is collapsed, there's nothing to do.
    if (range.isCollapsed) return _document2.default.create({ nodes: nodes });

    // Make sure the children exist.
    var startKey = range.startKey,
        startOffset = range.startOffset,
        endKey = range.endKey,
        endOffset = range.endOffset;

    node.assertDescendant(startKey);
    node.assertDescendant(endKey);

    // Split at the start and end.
    var start = range.collapseToStart();
    node = node.splitBlockAtRange(start, Infinity);

    var next = node.getNextText(startKey);
    var end = startKey == endKey ? range.collapseToStartOf(next).moveForward(endOffset - startOffset) : range.collapseToEnd();
    node = node.splitBlockAtRange(end, Infinity);

    // Get the start and end nodes.
    var startNode = node.getNextSibling(node.getHighestChild(startKey));
    var endNode = startKey == endKey ? node.getHighestChild(next) : node.getHighestChild(endKey);

    nodes = node.getChildrenBetweenIncluding(startNode, endNode);

    // Return a new document fragment.
    return _document2.default.create({ nodes: nodes });
  },


  /**
   * Get the furthest parent of a node by `key` that matches an `iterator`.
   *
   * @param {String or Node} key
   * @param {Function} iterator
   * @return {Node or Null}
   */

  getFurthest: function getFurthest(key, iterator) {
    var node = this.assertDescendant(key);
    var furthest = null;

    while (node = this.getClosest(node, iterator)) {
      furthest = node;
    }

    return furthest;
  },


  /**
   * Get the furthest block parent of a node by `key`.
   *
   * @param {String or Node} key
   * @return {Node or Null} node
   */

  getFurthestBlock: function getFurthestBlock(key) {
    return this.getFurthest(key, function (node) {
      return node.kind == 'block';
    });
  },


  /**
   * Get the furthest inline parent of a node by `key`.
   *
   * @param {String or Node} key
   * @return {Node or Null} node
   */

  getFurthestInline: function getFurthestInline(key) {
    return this.getFurthest(key, function (node) {
      return node.kind == 'inline';
    });
  },


  /**
   * Get the highest child ancestor of a node by `key`.
   *
   * @param {String or Node} key
   * @return {Node or Null} node
   */

  getHighestChild: function getHighestChild(key) {
    key = _normalize2.default.key(key);
    return this.nodes.find(function (node) {
      if (node.key == key) return true;
      if (node.kind == 'text') return false;
      return node.hasDescendant(key);
    });
  },


  /**
   * Get the highest parent of a node by `key` which has an only child.
   *
   * @param {String or Node} key
   * @return {Node or Null}
   */

  getHighestOnlyChildParent: function getHighestOnlyChildParent(key) {
    var child = this.assertDescendant(key);
    var match = null;
    var parent = void 0;

    while (parent = this.getParent(child)) {
      if (parent == null || parent.nodes.size > 1) return match;
      match = parent;
      child = parent;
    }
  },


  /**
   * Get the furthest inline nodes for each text node in the node.
   *
   * @return {List} nodes
   */

  getInlines: function getInlines() {
    var _this3 = this;

    return this.getTexts().map(function (text) {
      return _this3.getFurthestInline(text);
    }).filter(function (exists) {
      return exists;
    }).toOrderedSet().toList();
  },


  /**
   * Get the closest inline nodes for each text node in a `range`.
   *
   * @param {Selection} range
   * @return {List} nodes
   */

  getInlinesAtRange: function getInlinesAtRange(range) {
    var _this4 = this;

    return this.getTextsAtRange(range).map(function (text) {
      return _this4.getClosestInline(text);
    }).filter(function (exists) {
      return exists;
    }).toOrderedSet().toList();
  },


  /**
   * Get a set of the marks in a `range`.
   *
   * @param {Selection} range
   * @return {Set} marks
   */

  getMarksAtRange: function getMarksAtRange(range) {
    range = range.normalize(this);
    var _range = range,
        startKey = _range.startKey,
        startOffset = _range.startOffset;

    var marks = _mark2.default.createSet();

    // If the range is collapsed at the start of the node, check the previous.
    if (range.isCollapsed && startOffset == 0) {
      var text = this.getDescendant(startKey);
      var previous = this.getPreviousText(startKey);
      if (!previous || !previous.length) return marks;
      var char = previous.characters.get(previous.length - 1);
      return char.marks;
    }

    // If the range is collapsed, check the character before the start.
    if (range.isCollapsed) {
      var _text = this.getDescendant(startKey);
      var _char = _text.characters.get(range.startOffset - 1);
      return _char.marks;
    }

    // Otherwise, get a set of the marks for each character in the range.
    return this.getCharactersAtRange(range).reduce(function (memo, char) {
      return memo.union(char.marks);
    }, new _immutable.Set());
  },


  /**
   * Get the block node before a descendant text node by `key`.
   *
   * @param {String or Node} key
   * @return {Node or Null} node
   */

  getNextBlock: function getNextBlock(key) {
    var child = this.assertDescendant(key);
    var last = void 0;

    if (child.kind == 'block') {
      last = child.getLastText();
    } else {
      var block = this.getClosestBlock(key);
      last = block.getLastText();
    }

    var next = this.getNextText(last);
    if (!next) return null;

    return this.getClosestBlock(next);
  },


  /**
   * Get the node after a descendant by `key`.
   *
   * @param {String or Node} key
   * @return {Node or Null} node
   */

  getNextSibling: function getNextSibling(key) {
    var node = this.assertDescendant(key);
    return this.getParent(node).nodes.skipUntil(function (child) {
      return child == node;
    }).get(1);
  },


  /**
   * Get the text node after a descendant text node by `key`.
   *
   * @param {String or Node} key
   * @return {Node or Null} node
   */

  getNextText: function getNextText(key) {
    key = _normalize2.default.key(key);
    return this.getTexts().skipUntil(function (text) {
      return text.key == key;
    }).get(1);
  },


  /**
   * Get the offset for a descendant text node by `key`.
   *
   * @param {String or Node} key
   * @return {Number} offset
   */

  getOffset: function getOffset(key) {
    this.assertDescendant(key);

    // Calculate the offset of the nodes before the highest child.
    var child = this.getHighestChild(key);
    var offset = this.nodes.takeUntil(function (n) {
      return n == child;
    }).reduce(function (memo, n) {
      return memo + n.length;
    }, 0);

    // Recurse if need be.
    return this.hasChild(key) ? offset : offset + child.getOffset(key);
  },


  /**
   * Get the offset from a `range`.
   *
   * @param {Selection} range
   * @return {Number} offset
   */

  getOffsetAtRange: function getOffsetAtRange(range) {
    range = range.normalize(this);

    if (range.isExpanded) {
      throw new Error('The range must be collapsed to calculcate its offset.');
    }

    var _range2 = range,
        startKey = _range2.startKey,
        startOffset = _range2.startOffset;

    return this.getOffset(startKey) + startOffset;
  },


  /**
   * Get the parent of a child node by `key`.
   *
   * @param {String or Node} key
   * @return {Node or Null} node
   */

  getParent: function getParent(key) {
    if (this.hasChild(key)) return this;

    var node = null;

    this.nodes.find(function (child) {
      if (child.kind == 'text') {
        return false;
      } else {
        node = child.getParent(key);
        return node;
      }
    });

    return node;
  },


  /**
   * Get the path of a descendant node by `key`.
   *
   * @param {String || Node} key
   * @return {Array}
   */

  getPath: function getPath(key) {
    key = _normalize2.default.key(key);

    if (key == this.key) return [];

    var path = [];
    var childKey = key;
    var parent = void 0;

    // Efficient with getParent memoization
    while (parent = this.getParent(childKey)) {
      var index = parent.nodes.findIndex(function (n) {
        return n.key === childKey;
      });
      path.unshift(index);
      childKey = parent.key;
    }

    if (childKey === key) {
      // Did not loop once, meaning we could not find the child
      throw new Error('Could not find a descendant node with key "' + key + '".');
    } else {
      return path;
    }
  },


  /**
   * Get the path of ancestors of a descendant node by `key`.
   *
   * @param {String || Node} node
   * @return {List<Node> or Null}
   */

  getAncestors: function getAncestors(key) {
    key = _normalize2.default.key(key);

    if (key == this.key) return (0, _immutable.List)();
    if (this.hasChild(key)) return (0, _immutable.List)([this]);

    var ancestors = void 0;
    this.nodes.find(function (node) {
      if (node.kind == 'text') return false;
      ancestors = node.getAncestors(key);
      return ancestors;
    });

    if (ancestors) {
      return ancestors.unshift(this);
    } else {
      return null;
    }
  },


  /**
   * Get the node before a descendant node by `key`.
   *
   * @param {String or Node} key
   * @return {Node or Null} node
   */

  getPreviousSibling: function getPreviousSibling(key) {
    var node = this.assertDescendant(key);
    return this.getParent(node).nodes.takeUntil(function (child) {
      return child == node;
    }).last();
  },


  /**
   * Get the text node before a descendant text node by `key`.
   *
   * @param {String or Node} key
   * @return {Node or Null} node
   */

  getPreviousText: function getPreviousText(key) {
    key = _normalize2.default.key(key);
    return this.getTexts().takeUntil(function (text) {
      return text.key == key;
    }).last();
  },


  /**
   * Get the block node before a descendant text node by `key`.
   *
   * @param {String or Node} key
   * @return {Node or Null} node
   */

  getPreviousBlock: function getPreviousBlock(key) {
    var child = this.assertDescendant(key);
    var first = void 0;

    if (child.kind == 'block') {
      first = child.getFirstText();
    } else {
      var block = this.getClosestBlock(key);
      first = block.getFirstText();
    }

    var previous = this.getPreviousText(first);
    if (!previous) return null;

    return this.getClosestBlock(previous);
  },


  /**
   * Get the descendent text node at an `offset`.
   *
   * @param {String} offset
   * @return {Node or Null} node
   */

  getTextAtOffset: function getTextAtOffset(offset) {
    var length = 0;
    return this.getTexts().find(function (text) {
      length += text.length;
      return length >= offset;
    });
  },


  /**
   * Get the direction of the node's text.
   *
   * @return {String} direction
   */

  getTextDirection: function getTextDirection() {
    var text = this.text;
    var dir = (0, _direction2.default)(text);
    return dir == 'neutral' ? undefined : dir;
  },


  /**
   * Recursively get all of the child text nodes in order of appearance.
   *
   * @return {List} nodes
   */

  getTexts: function getTexts() {
    return this.nodes.reduce(function (texts, node) {
      return node.kind == 'text' ? texts.push(node) : texts.concat(node.getTexts());
    }, _block2.default.createList());
  },


  /**
   * Get the first child text node.
   *
   * @return {Node || Null} node
   */

  getFirstText: function getFirstText() {
    return this.findDescendantDeep(function (node) {
      return node.kind == 'text';
    });
  },


  /**
   * Get the last child text node.
   *
   * @return {Node} node
   */

  getLastText: function getLastText() {
    var descendantFound = null;

    var found = this.nodes.findLast(function (node) {
      if (node.kind == 'text') return true;
      descendantFound = node.getLastText();
      return descendantFound;
    });

    return descendantFound || found;
  },


  /**
   * Get all of the text nodes in a `range`.
   *
   * @param {Selection} range
   * @return {List} nodes
   */

  getTextsAtRange: function getTextsAtRange(range) {
    range = range.normalize(this);
    var _range3 = range,
        startKey = _range3.startKey,
        endKey = _range3.endKey;

    var texts = this.getTexts();
    var startText = this.getDescendant(startKey);
    var endText = this.getDescendant(endKey);
    var start = texts.indexOf(startText);
    var end = texts.indexOf(endText);
    return texts.slice(start, end + 1);
  },


  /**
   * Check if a child node exists by `key`.
   *
   * @param {String or Node} key
   * @return {Boolean} exists
   */

  hasChild: function hasChild(key) {
    return !!this.getChild(key);
  },


  /**
   * Recursively check if a child node exists by `key`.
   *
   * @param {String or Node} key
   * @return {Boolean} exists
   */

  hasDescendant: function hasDescendant(key) {
    return !!this.getDescendant(key);
  },


  /**
   * Check if a node has a void parent by `key`.
   *
   * @param {String or Node} key
   * @return {Boolean}
   */

  hasVoidParent: function hasVoidParent(key) {
    return !!this.getClosest(key, function (parent) {
      return parent.isVoid;
    });
  },


  /**
   * Insert a `node` at `index`.
   *
   * @param {Number} index
   * @param {Node} node
   * @return {Node}
   */

  insertNode: function insertNode(index, node) {
    var nodes = this.nodes.splice(index, 0, node);
    return this.merge({ nodes: nodes });
  },


  /**
   * Check if the inline nodes are split at a `range`.
   *
   * @param {Selection} range
   * @return {Boolean} isSplit
   */

  isInlineSplitAtRange: function isInlineSplitAtRange(range) {
    range = range.normalize(this);
    if (range.isExpanded) throw new Error();

    var _range4 = range,
        startKey = _range4.startKey;

    var start = this.getFurthestInline(startKey) || this.getDescendant(startKey);
    return range.isAtStartOf(start) || range.isAtEndOf(start);
  },


  /**
   * Join a node by `key` with another `withKey`.
   *
   * @param {String} key
   * @param {String} withKey
   * @return {Node}
   */

  joinNode: function joinNode(key, withKey) {
    var node = this;
    var target = node.assertPath(key);
    var withTarget = node.assertPath(withKey);
    var parent = node.getParent(target);
    var isParent = node == parent;
    var index = parent.nodes.indexOf(target);

    if (target.kind == 'text') {
      var _withTarget = withTarget,
          characters = _withTarget.characters;

      characters = characters.concat(target.characters);
      withTarget = withTarget.merge({ characters: characters });
    } else {
      (function () {
        var size = withTarget.nodes.size;
        target.nodes.forEach(function (child, i) {
          withTarget = withTarget.insertNode(size + i, child);
        });
      })();
    }

    parent = parent.removeNode(index);
    node = isParent ? parent : node.updateDescendant(parent);
    node = node.updateDescendant(withTarget);
    return node;
  },


  /**
   * Map all child nodes, updating them in their parents. This method is
   * optimized to not return a new node if no changes are made.
   *
   * @param {Function} iterator
   * @return {Node} node
   */

  mapChildren: function mapChildren(iterator) {
    var _this5 = this;

    var nodes = this.nodes;

    nodes.forEach(function (node, i) {
      var ret = iterator(node, i, _this5.nodes);
      if (ret != node) nodes = nodes.set(ret.key, ret);
    });

    return this.merge({ nodes: nodes });
  },


  /**
   * Map all descendant nodes, updating them in their parents. This method is
   * optimized to not return a new node if no changes are made.
   *
   * @param {Function} iterator
   * @return {Node} node
   */

  mapDescendants: function mapDescendants(iterator) {
    var _this6 = this;

    var nodes = this.nodes;

    nodes.forEach(function (node, i) {
      var ret = node;
      if (ret.kind != 'text') ret = ret.mapDescendants(iterator);
      ret = iterator(ret, i, _this6.nodes);
      if (ret == node) return;

      var index = nodes.indexOf(node);
      nodes = nodes.set(index, ret);
    });

    return this.merge({ nodes: nodes });
  },


  /**
   * Normalize the node by joining any two adjacent text child nodes.
   *
   * @return {Node} node
   */

  normalize: function normalize() {
    var node = this;
    var keys = new _immutable.Set();
    var removals = new _immutable.Set();

    // Map this node's descendants, ensuring...
    node = node.mapDescendants(function (desc) {
      if (removals.has(desc.key)) return desc;

      // ...that there are no duplicate keys.
      if (keys.has(desc.key)) desc = desc.set('key', (0, _uid2.default)());
      keys = keys.add(desc.key);

      // ...that void nodes contain a single space of content.
      if (desc.isVoid && desc.text != ' ') {
        desc = desc.merge({
          nodes: _text3.default.createList([{
            characters: _character2.default.createList([{ text: ' ' }])
          }])
        });
      }

      // ...that no block or inline has no text node inside it.
      if (desc.kind != 'text' && desc.nodes.size == 0) {
        var text = _text3.default.create();
        var nodes = desc.nodes.push(text);
        desc = desc.merge({ nodes: nodes });
      }

      // ...that no inline node is empty.
      if (desc.kind == 'inline' && desc.text == '') {
        removals = removals.add(desc.key);
      }

      return desc;
    });

    // Remove any nodes marked for removal.
    removals.forEach(function (key) {
      node = node.removeDescendant(key);
    });

    removals = removals.clear();

    // And, ensuring...
    node = node.mapDescendants(function (desc) {
      if (desc.kind == 'text') {
        var next = node.getNextSibling(desc);

        // ...that there are no adjacent text nodes.
        if (next && next.kind == 'text') {
          while (next && next.kind == 'text') {
            var characters = desc.characters.concat(next.characters);
            desc = desc.merge({ characters: characters });
            removals = removals.add(next.key);
            next = node.getNextSibling(next);
          }
        }

        // ...that there are no extra empty text nodes.
        else if (desc.length == 0) {
            var parent = node.getParent(desc);
            if (!removals.has(parent.key) && parent.nodes.size > 1) {
              removals = removals.add(desc.key);
            }
          }
      }

      return desc;
    });

    // Remove any nodes marked for removal.
    removals.forEach(function (key) {
      node = node.removeDescendant(key);
    });

    // Ensure that void nodes are surrounded by text nodes
    node = node.mapDescendants(function (desc) {
      if (desc.kind == 'text') {
        return desc;
      }

      var nodes = desc.nodes.reduce(function (accu, child, i) {
        // We wrap only inline void nodes
        if (!child.isVoid || child.kind === 'block') {
          return accu.push(child);
        }

        var prev = accu.last();
        var next = desc.nodes.get(i + 1);

        if (!prev || prev.kind !== 'text') {
          accu = accu.push(_text3.default.create());
        }

        accu = accu.push(child);

        if (!next || next.kind !== 'text') {
          accu = accu.push(_text3.default.create());
        }

        return accu;
      }, (0, _immutable.List)());

      return desc.merge({ nodes: nodes });
    });

    return node;
  },


  /**
   * Remove a `node` from the children node map.
   *
   * @param {String or Node} key
   * @return {Node} node
   */

  removeDescendant: function removeDescendant(key) {
    key = _normalize2.default.key(key);

    var node = this;
    var parent = node.getParent(key);
    if (!parent) throw new Error('Could not find a descendant node with key "' + key + '".');

    var index = parent.nodes.findIndex(function (n) {
      return n.key === key;
    });
    var isParent = node == parent;
    var nodes = parent.nodes.splice(index, 1);

    parent = parent.merge({ nodes: nodes });
    node = isParent ? parent : node.updateDescendant(parent);

    return node;
  },


  /**
   * Remove a node at `index`.
   *
   * @param {Number} index
   * @return {Node}
   */

  removeNode: function removeNode(index) {
    var nodes = this.nodes.splice(index, 1);
    return this.merge({ nodes: nodes });
  },


  /**
   * Split a node by `path` at `offset`.
   *
   * @param {String} path
   * @param {Number} offset
   * @return {Node}
   */

  splitNode: function splitNode(path, offset) {
    var base = this;
    var node = base.assertPath(path);
    var parent = base.getParent(node);
    var isParent = base == parent;
    var index = parent.nodes.indexOf(node);

    var child = node;
    var one = void 0;
    var two = void 0;

    if (node.kind != 'text') {
      child = node.getTextAtOffset(offset);
    }

    while (child && child != parent) {
      if (child.kind == 'text') {
        var i = node.kind == 'text' ? offset : offset - node.getOffset(child);
        var _child = child,
            characters = _child.characters;

        var oneChars = characters.take(i);
        var twoChars = characters.skip(i);
        one = child.merge({ characters: oneChars });
        two = child.merge({ characters: twoChars, key: (0, _uid2.default)() });
      } else {
        var _child2 = child,
            nodes = _child2.nodes;

        var oneNodes = nodes.takeUntil(function (n) {
          return n.key == one.key;
        }).push(one);
        var twoNodes = nodes.skipUntil(function (n) {
          return n.key == one.key;
        }).rest().unshift(two);
        one = child.merge({ nodes: oneNodes }).normalize();
        two = child.merge({ nodes: twoNodes, key: (0, _uid2.default)() }).normalize();
      }

      child = base.getParent(child);
    }

    parent = parent.removeNode(index);
    parent = parent.insertNode(index, two);
    parent = parent.insertNode(index, one);
    base = isParent ? parent : base.updateDescendant(parent);
    return base;
  },


  /**
   * Split the block nodes at a `range`, to optional `height`.
   *
   * @param {Selection} range
   * @param {Number} height (optional)
   * @return {Node}
   */

  splitBlockAtRange: function splitBlockAtRange(range) {
    var height = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
    var startKey = range.startKey,
        startOffset = range.startOffset;

    var base = this;
    var node = base.assertDescendant(startKey);
    var parent = base.getClosestBlock(node);
    var offset = startOffset;
    var h = 0;

    while (parent && parent.kind == 'block' && h < height) {
      offset += parent.getOffset(node);
      node = parent;
      parent = base.getClosestBlock(parent);
      h++;
    }

    var path = base.getPath(node.key);
    return this.splitNode(path, offset).normalize();
  },


  /**
   * Set a new value for a child node by `key`.
   *
   * @param {Node} node
   * @return {Node} node
   */

  updateDescendant: function updateDescendant(node) {
    var found = false;

    var result = this.mapDescendants(function (d) {
      if (d.key == node.key) {
        found = true;
        return node;
      } else {
        return d;
      }
    });

    if (!found) {
      throw new Error('Could not update descendant node with key "' + node.key + '".');
    } else {
      return result;
    }
  },


  /**
   * Validate the node against a `schema`.
   *
   * @param {Schema} schema
   * @return {Object || Void}
   */

  validate: function validate(schema) {
    return schema.__validate(this);
  }
};

/**
 * Memoize read methods.
 */

(0, _memoize2.default)(Node, ['assertChild', 'assertDescendant', 'filterDescendants', 'filterDescendantsDeep', 'findDescendant', 'findDescendantDeep', 'getAncestors', 'getBlocks', 'getBlocksAtRange', 'getCharactersAtRange', 'getChild', 'getChildrenAfter', 'getChildrenAfterIncluding', 'getChildrenBefore', 'getChildrenBeforeIncluding', 'getChildrenBetween', 'getChildrenBetweenIncluding', 'getClosest', 'getClosestBlock', 'getClosestInline', 'getComponent', 'getDecorators', 'getDepth', 'getDescendant', 'getDescendantDecorators', 'getFirstText', 'getFragmentAtRange', 'getFurthest', 'getFurthestBlock', 'getFurthestInline', 'getHighestChild', 'getHighestOnlyChildParent', 'getInlinesAtRange', 'getLastText', 'getMarksAtRange', 'getNextBlock', 'getNextSibling', 'getNextText', 'getOffset', 'getOffsetAtRange', 'getParent', 'getPreviousBlock', 'getPreviousSibling', 'getPreviousText', 'getTextAtOffset', 'getTextDirection', 'getTexts', 'getTextsAtRange', 'hasChild', 'hasDescendant', 'hasVoidParent', 'isInlineSplitAtRange', 'validate']);

/**
 * Export.
 */

exports.default = Node;