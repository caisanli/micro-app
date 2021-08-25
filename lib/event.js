"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.baseAppEvent = exports["default"] = void 0;

function Event() {
  this.event = {};
}

Object.assign(Event.prototype, {
  on: function on(name, callback) {
    if (!name || typeof callback !== 'function') return;

    if (this.event[name]) {
      this.event[name].push(callback);
    } else {
      this.event[name] = [callback];
    }
  },
  off: function off(name, callback) {
    if (callback) {
      this.event[name] = this.event[name].filter(function (fn) {
        return fn !== callback;
      });
    } else {
      this.event[name] = [];
    }
  },
  dispatch: function dispatch(name, data) {
    var callbackList = this.event[name];

    if (Array.isArray(callbackList)) {
      callbackList.forEach(function (callback) {
        return callback(data);
      });
    }
  },
  clear: function clear() {
    var _this = this;

    Object.keys(this.event).forEach(function (key) {
      _this.off(key);
    });
  }
});
var newEvent = new Event();
var _default = newEvent;
exports["default"] = _default;

function BaseAppEvent() {}

Object.assign(BaseAppEvent.prototype, {
  setData: function setData(data) {
    newEvent.dispatch('data', data);
  },
  onData: function onData(callback) {
    newEvent.on('data', callback);
  },
  on: function on(key, callback) {
    newEvent.on(key, callback);
  },
  dispatch: function dispatch(key, data) {
    newEvent.dispatch(key, data);
  }
});
var baseAppEvent = new BaseAppEvent();
exports.baseAppEvent = baseAppEvent;