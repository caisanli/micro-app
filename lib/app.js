"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MicroApp = void 0;

var _utils = require("./utils");

var _sandbox = _interopRequireDefault(require("./sandbox"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function ZMicroApp() {// console.log('this：', this)
}

Object.assign(ZMicroApp.prototype, {
  // 解析HTML
  parseHtml: function parseHtml(html) {
    var _this = this;

    var hrefReg = /href=["'][^"']+["']/g;
    var srcReg = /src=["'][^"']+["']/g;
    var scriptReg = /<script[^>]*>([^<]*)<\/script>/g;
    html = html.replace(hrefReg, function (val) {
      var reg = /href=["']([^"']+)["']/g;
      var result = reg.exec(val);
      var address = result[1];
      return val.replace(address, "".concat(_this.host).concat(address));
    }).replace(scriptReg, function (val) {
      _this.parseScript(val);

      return '';
    }).replace(srcReg, function (val) {
      var reg = /src=["']([^"']+)["']/g;
      var result = reg.exec(val);
      var address = result[1];
      return val.replace(address, "".concat(_this.host).concat(address));
    });
    return html;
  },
  // 解析script标签
  parseScript: function parseScript(val) {
    var srcReg = /src=["']([^"']+)["']/g;
    var scriptReg = /<script[^>]*>([^<]*)<\/script>/g;
    var result = srcReg.exec(val); // 内联script

    if (!result) {
      this.code.push(scriptReg.exec(val)[1]);
      return;
    }

    var url = "".concat(this.host).concat(result[1]);
    this.links.push(url);
  },
  insertHtml: function insertHtml() {
    this.el = document.getElementById("zxj_micro-".concat(this.name));
    this.el.innerHTML = this.html;
  },
  init: function init(name, url) {
    this.name = name;
    this.url = (0, _utils.getUrl)(url);
    this.html = '';
    this.host = '';
    this.el = null;
    this.code = [];
    this.links = []; // 沙箱

    this.sandbox = new _sandbox["default"](name);
  },
  start: function start(name, url) {
    var _this2 = this;

    this.init(name, url);
    (0, _utils.fetchResource)(this.url).then(function (html) {
      _this2.host = (0, _utils.getUrlHost)(_this2.url);
      _this2.html = _this2.parseHtml(html);

      _this2.insertHtml();

      var links = [];

      _this2.links.forEach(function (link) {
        links.push((0, _utils.fetchResource)(link));
      }); // 


      _this2.sandbox.start();

      Promise.all(links).then(function (scripts) {
        var _this2$code;

        (_this2$code = _this2.code).push.apply(_this2$code, _toConsumableArray(scripts));
      }).then(function () {
        _this2.code.forEach(function (code) {
          (0, eval)(_this2.sandbox.bindScope(code));
        });
      });
    })["catch"](function () {// console.log(err);
    });
  },
  destroy: function destroy() {
    this.sandbox.stop();
  }
});
var MicroApp = ZMicroApp;
exports.MicroApp = MicroApp;