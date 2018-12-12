'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _block = require('../models/block');

var _block2 = _interopRequireDefault(_block);

var _character = require('../models/character');

var _character2 = _interopRequireDefault(_character);

var _document = require('../models/document');

var _document2 = _interopRequireDefault(_document);

var _inline = require('../models/inline');

var _inline2 = _interopRequireDefault(_inline);

var _mark = require('../models/mark');

var _mark2 = _interopRequireDefault(_mark);

var _state = require('../models/state');

var _state2 = _interopRequireDefault(_state);

var _text = require('../models/text');

var _text2 = _interopRequireDefault(_text);

var _isEmpty = require('is-empty');

var _isEmpty2 = _interopRequireDefault(_isEmpty);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Raw.
 *
 * @type {Object}
 */

var Raw = {

  /**
   * Deserialize a JSON `object`.
   *
   * @param {Object} object
   * @param {Object} options (optional)
   * @return {Block}
   */

  deserialize: function deserialize(object, options) {
    return Raw.deserializeState(object, options);
  },


  /**
   * Deserialize a JSON `object` representing a `Block`.
   *
   * @param {Object} object
   * @param {Object} options (optional)
   * @return {Block}
   */

  deserializeBlock: function deserializeBlock(object) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    if (options.terse) object = Raw.untersifyBlock(object);

    return _block2.default.create({
      key: object.key,
      type: object.type,
      data: object.data,
      isVoid: object.isVoid,
      nodes: _block2.default.createList(object.nodes.map(function (node) {
        return Raw.deserializeNode(node, options);
      }))
    });
  },


  /**
   * Deserialize a JSON `object` representing a `Document`.
   *
   * @param {Object} object
   * @param {Object} options (optional)
   * @return {Document}
   */

  deserializeDocument: function deserializeDocument(object, options) {
    return _document2.default.create({
      nodes: _block2.default.createList(object.nodes.map(function (node) {
        return Raw.deserializeNode(node, options);
      }))
    });
  },


  /**
   * Deserialize a JSON `object` representing an `Inline`.
   *
   * @param {Object} object
   * @param {Object} options (optional)
   * @return {Inline}
   */

  deserializeInline: function deserializeInline(object) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    if (options.terse) object = Raw.untersifyInline(object);

    return _inline2.default.create({
      key: object.key,
      type: object.type,
      data: object.data,
      isVoid: object.isVoid,
      nodes: _inline2.default.createList(object.nodes.map(function (node) {
        return Raw.deserializeNode(node, options);
      }))
    });
  },


  /**
   * Deserialize a JSON `object` representing a `Mark`.
   *
   * @param {Object} object
   * @param {Object} options (optional)
   * @return {Mark} mark
   */

  deserializeMark: function deserializeMark(object, options) {
    return _mark2.default.create(object);
  },


  /**
   * Deserialize a JSON object representing a `Node`.
   *
   * @param {Object} object
   * @param {Object} options (optional)
   * @return {Text}
   */

  deserializeNode: function deserializeNode(object, options) {
    switch (object.kind) {
      case 'block':
        return Raw.deserializeBlock(object, options);
      case 'document':
        return Raw.deserializeDocument(object, options);
      case 'inline':
        return Raw.deserializeInline(object, options);
      case 'text':
        return Raw.deserializeText(object, options);
      default:
        {
          throw new Error('Unrecognized node kind "' + object.kind + '".');
        }
    }
  },


  /**
   * Deserialize a JSON `object` representing a `Range`.
   *
   * @param {Object} object
   * @param {Object} options (optional)
   * @return {List}
   */

  deserializeRange: function deserializeRange(object) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    if (options.terse) object = Raw.untersifyRange(object);

    return _character2.default.createList(object.text.split('').map(function (char) {
      return _character2.default.create({
        text: char,
        marks: _mark2.default.createSet(object.marks.map(function (mark) {
          return Raw.deserializeMark(mark, options);
        }))
      });
    }));
  },


  /**
   * Deserialize a JSON `object` representing a `State`.
   *
   * @param {Object} object
   * @param {Object} options (optional)
   * @return {State}
   */

  deserializeState: function deserializeState(object) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    if (options.terse) object = Raw.untersifyState(object);

    return _state2.default.create({
      document: Raw.deserializeDocument(object.document, options)
    });
  },


  /**
   * Deserialize a JSON `object` representing a `Text`.
   *
   * @param {Object} object
   * @param {Object} options (optional)
   * @return {Text}
   */

  deserializeText: function deserializeText(object) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    if (options.terse) object = Raw.untersifyText(object);

    return _text2.default.create({
      key: object.key,
      characters: object.ranges.reduce(function (characters, range) {
        return characters.concat(Raw.deserializeRange(range, options));
      }, _character2.default.createList())
    });
  },


  /**
   * Serialize a `model`.
   *
   * @param {Mixed} model
   * @param {Object} options (optional)
   * @return {Object}
   */

  serialize: function serialize(model, options) {
    return Raw.serializeState(model, options);
  },


  /**
   * Serialize a `block` node.
   *
   * @param {Block} block
   * @param {Object} options (optional)
   * @return {Object}
   */

  serializeBlock: function serializeBlock(block) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var object = {
      data: block.data.toJSON(),
      key: block.key,
      kind: block.kind,
      isVoid: block.isVoid,
      type: block.type,
      nodes: block.nodes.toArray().map(function (node) {
        return Raw.serializeNode(node, options);
      })
    };

    return options.terse ? Raw.tersifyBlock(object) : object;
  },


  /**
   * Serialize a `document`.
   *
   * @param {Document} document
   * @param {Object} options (optional)
   * @return {Object}
   */

  serializeDocument: function serializeDocument(document) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var object = {
      kind: document.kind,
      nodes: document.nodes.toArray().map(function (node) {
        return Raw.serializeNode(node, options);
      })
    };

    return options.terse ? Raw.tersifyDocument(object) : object;
  },


  /**
   * Serialize an `inline` node.
   *
   * @param {Inline} inline
   * @param {Object} options (optional)
   * @return {Object}
   */

  serializeInline: function serializeInline(inline) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var object = {
      data: inline.data.toJSON(),
      key: inline.key,
      kind: inline.kind,
      isVoid: inline.isVoid,
      type: inline.type,
      nodes: inline.nodes.toArray().map(function (node) {
        return Raw.serializeNode(node, options);
      })
    };

    return options.terse ? Raw.tersifyInline(object) : object;
  },


  /**
   * Serialize a `mark`.
   *
   * @param {Mark} mark
   * @param {Object} options (optional)
   * @return {Object} Object
   */

  serializeMark: function serializeMark(mark) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var object = {
      data: mark.data.toJSON(),
      kind: mark.kind,
      type: mark.type
    };

    return options.terse ? Raw.tersifyMark(object) : object;
  },


  /**
   * Serialize a `node`.
   *
   * @param {Node} node
   * @param {Object} options (optional)
   * @return {Object} object
   */

  serializeNode: function serializeNode(node, options) {
    switch (node.kind) {
      case 'block':
        return Raw.serializeBlock(node, options);
      case 'document':
        return Raw.serializeDocument(node, options);
      case 'inline':
        return Raw.serializeInline(node, options);
      case 'text':
        return Raw.serializeText(node, options);
      default:
        {
          throw new Error('Unrecognized node kind "' + node.kind + '".');
        }
    }
  },


  /**
   * Serialize a `range`.
   *
   * @param {Range} range
   * @param {Object} options (optional)
   * @return {Object}
   */

  serializeRange: function serializeRange(range) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var object = {
      kind: range.kind,
      text: range.text,
      marks: range.marks.toArray().map(function (mark) {
        return Raw.serializeMark(mark, options);
      })
    };

    return options.terse ? Raw.tersifyRange(object) : object;
  },


  /**
   * Serialize a `state`.
   *
   * @param {State} state
   * @param {Object} options (optional)
   * @return {Object}
   */

  serializeState: function serializeState(state) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var object = {
      document: Raw.serializeDocument(state.document, options),
      kind: state.kind
    };

    return options.terse ? Raw.tersifyState(object) : object;
  },


  /**
   * Serialize a `text` node.
   *
   * @param {Text} text
   * @param {Object} options (optional)
   * @return {Object}
   */

  serializeText: function serializeText(text) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var object = {
      key: text.key,
      kind: text.kind,
      ranges: text.getRanges().toArray().map(function (range) {
        return Raw.serializeRange(range, options);
      })
    };

    return options.terse ? Raw.tersifyText(object) : object;
  },


  /**
   * Create a terse representation of a block `object`.
   *
   * @param {Object} object
   * @return {Object}
   */

  tersifyBlock: function tersifyBlock(object) {
    var ret = {};
    ret.kind = object.kind;
    ret.type = object.type;
    if (!object.isVoid) ret.nodes = object.nodes;
    if (object.isVoid) ret.isVoid = object.isVoid;
    if (!(0, _isEmpty2.default)(object.data)) ret.data = object.data;
    return ret;
  },


  /**
   * Create a terse representation of a document `object.
   *
   * @param {Object} object
   * @return {Object}
   */

  tersifyDocument: function tersifyDocument(object) {
    return {
      nodes: object.nodes
    };
  },


  /**
   * Create a terse representation of a inline `object`.
   *
   * @param {Object} object
   * @return {Object}
   */

  tersifyInline: function tersifyInline(object) {
    var ret = {};
    ret.kind = object.kind;
    ret.type = object.type;
    if (!object.isVoid) ret.nodes = object.nodes;
    if (object.isVoid) ret.isVoid = object.isVoid;
    if (!(0, _isEmpty2.default)(object.data)) ret.data = object.data;
    return ret;
  },


  /**
   * Create a terse representation of a mark `object`.
   *
   * @param {Object} object
   * @return {Object}
   */

  tersifyMark: function tersifyMark(object) {
    var ret = {};
    ret.type = object.type;
    if (!(0, _isEmpty2.default)(object.data)) ret.data = object.data;
    return ret;
  },


  /**
   * Create a terse representation of a range `object`.
   *
   * @param {Object} object
   * @return {Object}
   */

  tersifyRange: function tersifyRange(object) {
    var ret = {};
    ret.text = object.text;
    if (!(0, _isEmpty2.default)(object.marks)) ret.marks = object.marks;
    return ret;
  },


  /**
   * Create a terse representation of a state `object`.
   *
   * @param {Object} object
   * @return {Object}
   */

  tersifyState: function tersifyState(object) {
    return object.document;
  },


  /**
   * Create a terse representation of a text `object`.
   *
   * @param {Object} object
   * @return {Object}
   */

  tersifyText: function tersifyText(object) {
    if (object.ranges.length == 1 && object.ranges[0].marks == null) {
      return {
        kind: object.kind,
        text: object.ranges[0].text
      };
    }

    return {
      kind: object.kind,
      ranges: object.ranges
    };
  },


  /**
   * Convert a terse representation of a block `object` into a non-terse one.
   *
   * @param {Object} object
   * @return {Object}
   */

  untersifyBlock: function untersifyBlock(object) {
    if (object.isVoid || !object.nodes || !object.nodes.length) {
      return {
        data: object.data,
        kind: object.kind,
        type: object.type,
        isVoid: object.isVoid,
        nodes: [{
          kind: 'text',
          text: ''
        }]
      };
    }

    return object;
  },


  /**
   * Convert a terse representation of a inline `object` into a non-terse one.
   *
   * @param {Object} object
   * @return {Object}
   */

  untersifyInline: function untersifyInline(object) {
    if (object.isVoid || !object.nodes || !object.nodes.length) {
      return {
        data: object.data,
        kind: object.kind,
        type: object.type,
        isVoid: object.isVoid,
        nodes: [{
          kind: 'text',
          text: ''
        }]
      };
    }

    return object;
  },


  /**
   * Convert a terse representation of a range `object` into a non-terse one.
   *
   * @param {Object} object
   * @return {Object}
   */

  untersifyRange: function untersifyRange(object) {
    return {
      kind: 'range',
      text: object.text,
      marks: object.marks || []
    };
  },


  /**
   * Convert a terse representation of a state `object` into a non-terse one.
   *
   * @param {Object} object
   * @return {Object}
   */

  untersifyState: function untersifyState(object) {
    return {
      kind: 'state',
      document: {
        kind: 'document',
        nodes: object.nodes
      }
    };
  },


  /**
   * Convert a terse representation of a text `object` into a non-terse one.
   *
   * @param {Object} object
   * @return {Object}
   */

  untersifyText: function untersifyText(object) {
    if (object.ranges) return object;

    return {
      kind: object.kind,
      ranges: [{
        text: object.text,
        marks: object.marks || []
      }]
    };
  }
};

/**
 * Export.
 */

exports.default = Raw;