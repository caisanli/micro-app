"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _app = require("./app");

var _default = {
  name: 'MicroApp',
  data: function data() {
    return {
      children: '',
      app: null
    };
  },
  props: {
    name: {
      // 全局唯一
      type: String,
      "default": ''
    },
    url: {
      // index.html地址
      type: String,
      "default": ''
    }
  },
  mounted: function mounted() {
    var name = this.name,
        url = this.url;
    var app = new _app.MicroApp();
    this.app = app;
    app.start(name, url);
  },
  beforeDestroy: function beforeDestroy() {
    this.app.destroy();
  },
  render: function render(h) {
    var name = this.name;
    return h('div', {
      // attribute
      attrs: {
        id: "zxj_micro-".concat(name)
      }
    });
  }
};
exports["default"] = _default;