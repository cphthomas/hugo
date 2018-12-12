'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

require('./document');

var _inline = require('./inline');

var _inline2 = _interopRequireDefault(_inline);

var _data = require('./data');

var _data2 = _interopRequireDefault(_data);

var _node = require('./node');

var _node2 = _interopRequireDefault(_node);

var _text = require('./text');

var _text2 = _interopRequireDefault(_text);

var _uid = require('../utils/uid');

var _uid2 = _interopRequireDefault(_uid);

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
/**
 * Prevent circuit.
 */

/**
 * Dependencies.
 */

/**
 * Default properties.
 */

var DEFAULTS = {
  data: new _immutable.Map(),
  isVoid: false,
  key: null,
  nodes: new _immutable.List(),
  type: null
};

/**
 * Block.
 */

var Block = function (_ref) {
  _inherits(Block, _ref);

  function Block() {
    _classCallCheck(this, Block);

    return _possibleConstructorReturn(this, (Block.__proto__ || Object.getPrototypeOf(Block)).apply(this, arguments));
  }

  _createClass(Block, [{
    key: 'kind',


    /**
     * Get the node's kind.
     *
     * @return {String} kind
     */

    get: function get() {
      return 'block';
    }

    /**
     * Is the node empty?
     *
     * @return {Boolean} isEmpty
     */

  }, {
    key: 'isEmpty',
    get: function get() {
      return this.text == '';
    }

    /**
     * Get the length of the concatenated text of the node.
     *
     * @return {Number} length
     */

  }, {
    key: 'length',
    get: function get() {
      return this.text.length;
    }

    /**
     * Get the concatenated text `string` of all child nodes.
     *
     * @return {String} text
     */

  }, {
    key: 'text',
    get: function get() {
      return this.nodes.map(function (node) {
        return node.text;
      }).join('');
    }
  }], [{
    key: 'create',


    /**
     * Create a new `Block` with `properties`.
     *
     * @param {Object} properties
     * @return {Block} element
     */

    value: function create() {
      var properties = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (properties instanceof Block) return properties;
      if (properties instanceof _inline2.default) return properties;
      if (properties instanceof _text2.default) return properties;
      if (!properties.type) throw new Error('You must pass a block `type`.');

      properties.key = properties.key || (0, _uid2.default)(4);
      properties.data = _data2.default.create(properties.data);
      properties.isVoid = !!properties.isVoid;
      properties.nodes = Block.createList(properties.nodes);

      return new Block(properties).normalize();
    }

    /**
     * Create a list of `Blocks` from an array.
     *
     * @param {Array} elements
     * @return {List} list
     */

  }, {
    key: 'createList',
    value: function createList() {
      var elements = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

      if (_immutable.List.isList(elements)) return elements;
      return new _immutable.List(elements.map(Block.create));
    }
  }]);

  return Block;
}(new _immutable.Record(DEFAULTS));

/**
 * Mix in `Node` methods.
 */

for (var method in _node2.default) {
  Block.prototype[method] = _node2.default[method];
}

/**
 * Export.
 */

exports.default = Block;