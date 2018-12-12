'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _dataUriToBlob = require('data-uri-to-blob');

var _dataUriToBlob2 = _interopRequireDefault(_dataUriToBlob);

var _isDataUri = require('is-data-uri');

var _isDataUri2 = _interopRequireDefault(_isDataUri);

var _imageToDataUri = require('./image-to-data-uri');

var _imageToDataUri2 = _interopRequireDefault(_imageToDataUri);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Load an image file from a src `url`.
 *
 * @param {String} url
 * @param {Function} callback
 */

function loadImageFile(url, callback) {
  if ((0, _isDataUri2.default)(url)) {
    (function () {
      var file = (0, _dataUriToBlob2.default)(url);
      setTimeout(function () {
        callback(null, file);
      });
    })();
  } else {
    (0, _imageToDataUri2.default)(url, function (err, uri) {
      var file = (0, _dataUriToBlob2.default)(uri);
      callback(err, file);
    });
  }
}

/**
 * Export.
 *
 * @type {Function}
 */

exports.default = loadImageFile;