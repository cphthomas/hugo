'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.IS_WINDOWS = exports.IS_UBUNTU = exports.IS_SAFARI = exports.IS_MAC = exports.IS_IOS = exports.IS_IE = exports.IS_FIREFOX = exports.IS_EDGE = exports.IS_CHROME = exports.IS_ANDROID = undefined;

var _uaParserJs = require('ua-parser-js');

var _uaParserJs2 = _interopRequireDefault(_uaParserJs);

var _detectBrowser = require('detect-browser');

var _detectBrowser2 = _interopRequireDefault(_detectBrowser);

var _includes = require('lodash/includes');

var _includes2 = _interopRequireDefault(_includes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Export.
 */

var IS_ANDROID = exports.IS_ANDROID = process.browser && _detectBrowser2.default.name == 'android';
var IS_CHROME = exports.IS_CHROME = process.browser && _detectBrowser2.default.name == 'chrome';
var IS_EDGE = exports.IS_EDGE = process.browser && _detectBrowser2.default.name == 'edge';
var IS_FIREFOX = exports.IS_FIREFOX = process.browser && _detectBrowser2.default.name == 'firefox';
var IS_IE = exports.IS_IE = process.browser && _detectBrowser2.default.name == 'ie';
var IS_IOS = exports.IS_IOS = process.browser && _detectBrowser2.default.name == 'ios';
var IS_MAC = exports.IS_MAC = process.browser && new _uaParserJs2.default().getOS().name == 'Mac OS';
var IS_SAFARI = exports.IS_SAFARI = process.browser && _detectBrowser2.default.name == 'safari';
var IS_UBUNTU = exports.IS_UBUNTU = process.browser && new _uaParserJs2.default().getOS().name == 'Ubuntu';
var IS_WINDOWS = exports.IS_WINDOWS = process.browser && (0, _includes2.default)(new _uaParserJs2.default().getOS().name, 'Windows');

exports.default = {
  IS_ANDROID: IS_ANDROID,
  IS_CHROME: IS_CHROME,
  IS_EDGE: IS_EDGE,
  IS_FIREFOX: IS_FIREFOX,
  IS_IE: IS_IE,
  IS_IOS: IS_IOS,
  IS_MAC: IS_MAC,
  IS_SAFARI: IS_SAFARI,
  IS_UBUNTU: IS_UBUNTU,
  IS_WINDOWS: IS_WINDOWS
};