import type { BaseSandbox } from '@zxj/micro';

/**
 * 基于Diff沙箱
 */
class DiffSandbox implements BaseSandbox {
  active: boolean;
  proxyWindow: Window;
  modifyMap: {
    [name:string]: unknown
  };
  windowSnapshot: {
    [name:string]: unknown
  };
  constructor() {
    this.active = false;
    this.modifyMap = {}; // 存放修改的属性
    this.windowSnapshot = {}; // windows的快照
    this.proxyWindow = window;
  }
  start() {
    if (this.active) {
      return ;
    }
    Object.assign(this.proxyWindow, {
      proxyWindow: window,
      proxyLocation: window.location,
      proxyHistory: window.history,
      proxyDocument: window.document
    });
    this.active = true;
    // 缓存window对象上的属性
    this.windowSnapshot = {};
    for (const item in window) {
      if(Object.prototype.hasOwnProperty.call(window, item)) {
        this.windowSnapshot[item] = window[item];
      }
    }
    // Object.keys(this.modifyMap).forEach((p) => {
    //   window[p] = this.modifyMap[p]
    // })
  }
  stop() {
    if (!this.active) {
      return ;
    }
    this.active = false;
    // 还原window的属性
    for (const item in window) {
      if (this.windowSnapshot[item] !== window[item]) {
        // 记录变更
        // this.modifyMap[item] = window[item]
        // 还原window
        if(item === '0') continue;
        window[item] = <Window>this.windowSnapshot[item];
      }
    }
  }
}

export default DiffSandbox;
