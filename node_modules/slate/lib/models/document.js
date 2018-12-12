'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _block = require('./block');

var _block2 = _interopRequireDefault(_block);

require('./inline');

var _node = require('./node');

var _node2 = _interopRequireDefault(_node);

var _uid = require('../utils/uid');

var _uid2 = _interopRequireDefault(_uid);

var _immutable = require('immutable');

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
 * Defaults.
 */

var DEFAULTS = {
  key: null,
  nodes: new _immutable.OrderedMap()
};

/**
 * Document.
 */

var Document = function (_ref) {
  _inherits(Document, _ref);

  function Document() {
    _classCallCheck(this, Document);

    return _possibleConstructorReturn(this, (Document.__proto__ || Object.getPrototypeOf(Document)).apply(this, arguments));
  }

  _createClass(Document, [{
    key: 'kind',


    /**
     * Get the node's kind.
     *
     * @return {String} kind
     */

    get: function get() {
      return 'document';
    }

    /**
     * Is the document empty?
     *
     * @return {Boolean} isEmpty
     */

  }, {
    key: 'isEmpty',
    get: function get() {
      return this.text == '';
    }

    /**
     * Get the length of the concatenated text of the document.
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
     * Create a new `Document` with `properties`.
     *
     * @param {Objetc} properties
     * @return {Document} document
     */

    value: function create() {
      var properties = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (properties instanceof Document) return properties;

      properties.key = properties.key || (0, _uid2.default)(4);
      properties.nodes = _block2.default.createList(properties.nodes);

      return new Document(properties).normalize();
    }
  }]);

  return Document;
}(new _immutable.Record(DEFAULTS));

/**
 * Mix in `Node` methods.
 */

for (var method in _node2.default) {
  Document.prototype[method] = _node2.default[method];
}

/**
 * Export.
 */

exports.default = Document;