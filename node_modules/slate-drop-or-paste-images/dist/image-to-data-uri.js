'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

/**
 * Convert an <img> source `url` to a data URI and `callback(err, uri)`.
 *
 * @param {String} url
 * @param {Function} callback(err, uri)
 */

function srcToDataUri(url, callback) {
  var canvas = document.createElement('canvas');
  var img = document.createElement('img');

  if (!canvas.getContext) {
    return setTimeout(callback, 0, new Error('Canvas is not supported.'));
  }

  img.onload = function () {
    var ctx = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    var dataUri = canvas.toDataURL('image/png');
    callback(null, dataUri);
  };

  img.ononerror = function () {
    callback(new Error('Failed to load image.'));
  };

  img.setAttribute('crossOrigin', 'anonymous');
  img.src = url;
}

/**
 * Export.
 */

exports.default = srcToDataUri;