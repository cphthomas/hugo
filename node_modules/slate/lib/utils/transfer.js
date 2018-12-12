'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _base = require('../serializers/base-64');

var _base2 = _interopRequireDefault(_base);

var _types = require('../constants/types');

var _types2 = _interopRequireDefault(_types);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Fragment matching regexp for HTML nodes.
 *
 * @type {RegExp}
 */

var FRAGMENT_MATCHER = /data-slate-fragment="([^\s]+)"/;

/**
 * Data transfer helper.
 *
 * @type {Transfer}
 */

var Transfer = function () {

  /**
   * Constructor.
   *
   * @param {DataTransfer} data
   */

  function Transfer(data) {
    _classCallCheck(this, Transfer);

    this.data = data;
    this.cache = {};
  }

  /**
   * Get a data object representing the transfer's primary content type.
   *
   * @return {Object}
   */

  _createClass(Transfer, [{
    key: 'getData',
    value: function getData() {
      var type = this.getType();
      var data = {};
      data.type = type;

      switch (type) {
        case 'files':
          data.files = this.getFiles();
          break;
        case 'fragment':
          data.fragment = this.getFragment();
          break;
        case 'html':
          data.html = this.getHtml();
          data.text = this.getText();
          break;
        case 'node':
          data.node = this.getNode();
          break;
        case 'text':
          data.text = this.getText();
          break;
      }

      return data;
    }

    /**
     * Get the Files content of the data transfer.
     *
     * @return {Array || Void}
     */

  }, {
    key: 'getFiles',
    value: function getFiles() {
      if ('files' in this.cache) return this.cache.files;

      var data = this.data;

      var files = void 0;

      if (data.items && data.items.length) {
        var fileItems = Array.from(data.items).map(function (item) {
          return item.kind == 'file' ? item.getAsFile() : null;
        }).filter(function (exists) {
          return exists;
        });

        if (fileItems.length) files = fileItems;
      }

      if (data.files && data.files.length) {
        files = Array.from(data.files);
      }

      this.cache.files = files;
      return files;
    }

    /**
     * Get the Slate document fragment content of the data transfer.
     *
     * @return {Document || Void}
     */

  }, {
    key: 'getFragment',
    value: function getFragment() {
      if ('fragment' in this.cache) return this.cache.fragment;

      var html = this.getHtml();
      var encoded = this.data.getData(_types2.default.FRAGMENT);
      var fragment = void 0;

      // If there's html content, and the html includes a `data-fragment`
      // attribute, it's actually a Base64-serialized fragment from a cut/copy.
      if (!encoded && html && ~html.indexOf('<span data-slate-fragment="')) {
        var matches = FRAGMENT_MATCHER.exec(html);

        var _matches = _slicedToArray(matches, 2),
            full = _matches[0],
            attribute = _matches[1];

        encoded = attribute;
      }

      if (encoded) {
        fragment = _base2.default.deserializeNode(encoded);
      }

      this.cache.fragment = fragment;
      return fragment;
    }

    /**
     * Get the HTML content of the data transfer.
     *
     * @return {String || Void}
     */

  }, {
    key: 'getHtml',
    value: function getHtml() {
      if ('html' in this.cache) return this.cache.html;

      var html = void 0;
      var string = this.data.getData('text/html');

      if (string != '') html = string;

      this.cache.html = html;
      return html;
    }

    /**
     * Get the Slate node content of the data transfer.
     *
     * @return {Node || Void}
     */

  }, {
    key: 'getNode',
    value: function getNode() {
      if ('node' in this.cache) return this.cache.node;

      var encoded = this.data.getData(_types2.default.NODE);
      var node = void 0;

      if (encoded) {
        node = _base2.default.deserializeNode(encoded);
      }

      this.cache.node = node;
      return node;
    }

    /**
     * Get the text content of the data transfer.
     *
     * @return {String || Void}
     */

  }, {
    key: 'getText',
    value: function getText() {
      if ('text' in this.cache) return this.cache.text;

      var text = void 0;
      var string = this.data.getData('text/plain');

      if (string != '') text = string;

      this.cache.text = text;
      return text;
    }

    /**
     * Get the primary type of the data transfer.
     *
     * @return {String}
     */

  }, {
    key: 'getType',
    value: function getType() {
      if (this.hasFragment()) return 'fragment';
      if (this.hasNode()) return 'node';
      if (this.hasFiles()) return 'files';
      if (this.hasHtml()) return 'html';
      if (this.hasText()) return 'text';
      return 'unknown';
    }

    /**
     * Check whether the data transfer has File content.
     *
     * @return {Boolean}
     */

  }, {
    key: 'hasFiles',
    value: function hasFiles() {
      return this.getFiles() != null;
    }

    /**
     * Check whether the data transfer has HTML content.
     *
     * @return {Boolean}
     */

  }, {
    key: 'hasHtml',
    value: function hasHtml() {
      return this.getHtml() != null;
    }

    /**
     * Check whether the data transfer has text content.
     *
     * @return {Boolean}
     */

  }, {
    key: 'hasText',
    value: function hasText() {
      return this.getText() != null;
    }

    /**
     * Check whether the data transfer has a Slate document fragment as content.
     *
     * @return {Boolean}
     */

  }, {
    key: 'hasFragment',
    value: function hasFragment() {
      return this.getFragment() != null;
    }

    /**
     * Check whether the data transfer has a Slate node as content.
     *
     * @return {Boolean}
     */

  }, {
    key: 'hasNode',
    value: function hasNode() {
      return this.getNode() != null;
    }
  }]);

  return Transfer;
}();

/**
 * Export.
 */

exports.default = Transfer;