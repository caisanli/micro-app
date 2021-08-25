"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _event = _interopRequireDefault(require("./event"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Sandbox = /*#__PURE__*/function () {
  function Sandbox(name) {
    _classCallCheck(this, Sandbox);

    // const iframe = document.createElement("iframe");
    // iframe.src="bl"
    this.name = name;
    this.microWindow = {
      evt: _event["default"]
    };
    this.keys = {};
    this.active = false;
    window['_zxj_micro_' + name] = this.microWindow;
  } // 修改js作用域


  _createClass(Sandbox, [{
    key: "bindScope",
    value: function bindScope(code) {
      return ";(function(window, self){with(window){;".concat(code, "\n}}).call(window, window, window);");
    }
  }, {
    key: "start",
    value: function start() {
      if (!this.active) {
        this.active = true;
      }
    }
  }, {
    key: "stop",
    value: function stop() {
      var _this = this;

      if (!this.active) return;
      this.active = false;
      Object.keys(this.microWindow).forEach(function (key) {
        delete _this.microWindow[key];
      });
    }
  }]);

  return Sandbox;
}();

var _default = Sandbox;
exports["default"] = _default;