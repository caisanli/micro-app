"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MicroApp = exports.baseAppEvent = void 0;

var _micro = _interopRequireDefault(require("./micro"));

var _event = require("./event");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var baseAppEvent = _event.baseAppEvent;
exports.baseAppEvent = baseAppEvent;
var MicroApp = _micro["default"];
exports.MicroApp = MicroApp;