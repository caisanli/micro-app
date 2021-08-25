"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fetchResource = fetchResource;
exports.getUrlHost = getUrlHost;
exports.getUrl = getUrl;

var _axios = _interopRequireDefault(require("axios"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/**
 * 拉取资源
 * @param url 
 */
function fetchResource(url) {
  return _axios["default"].get(url).then(function (res) {
    return res.data;
  });
}
/**
 * 获取URL中的host地址
 * @param {*} url 
 * @returns 
 */


function getUrlHost(url) {
  var hostReg = /(^www\.[^/]+[\da-zA-Z])|(^http[s]?:\/\/[^/]+[\d]+)/;
  var result = hostReg.exec(url);
  if (!result) return '';
  return result[0];
}
/**
 * 获取URL
 * @param {*} url 
 */


function getUrl(url) {
  var reg = /(^www\.[^/]+[\da-zA-Z])|(^http[s]?:\/\/[^/]+[\d]+)/;

  if (reg.test(url)) {
    return url;
  }

  var _window$location = window.location,
      origin = _window$location.origin,
      port = _window$location.port;
  return "".concat(origin).concat(port ? ':' + port : '').concat(url);
}