import type { BaseSandbox } from '@zxj/micro';
import { rawWindow, rawDocument } from '../utils/common';
/**
 * 基于Diff沙箱
 */
class DiffSandbox implements BaseSandbox {

  active: boolean;

  proxyWindow: Window;

  private modifyMap: {
    [name:string]: unknown
  };

  private windowSnapshot: {
    [name:string]: unknown
  };

  private readonly rewriteName: string;

  constructor(rewriteName: string) {
    this.active = false;
    this.rewriteName = rewriteName;
    this.modifyMap = {}; // 存放修改的属性
    this.windowSnapshot = {}; // windows的快照
    this.proxyWindow = rawWindow;
  }

  start() {
    if (this.active) {
      return ;
    }
    Object.assign(this.proxyWindow, {
      [this.rewriteName + '_window']: rawWindow,
      [this.rewriteName + '_document']: rawDocument
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
    for (const item in rawWindow) {
      if (this.windowSnapshot[item] !== rawWindow[item]) {
        try {
          // 记录变更
          // this.modifyMap[item] = window[item]
          // 还原window
          if (item === '0') continue;
          rawWindow[item] = <Window>this.windowSnapshot[item];
        } catch (e) {
          // console.log(e);
        }
      }
    }
  }
}

export default DiffSandbox;
