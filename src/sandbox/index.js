/**
 * 沙箱
 */

import DiffSandbox from './diff';
import SideEffect from './sideEffect';
// import ProxSandbox from './proxySandbox';
class Sandbox {
  constructor(name) {
    // this.supportProxy = !!window.Proxy
    // if(this.supportProxy) {
    //     this.proxyWindow = new ProxSandbox()
    // } else {
    //     this.proxyWindow = new DiffSandbox()
    // }
    this.id = '_zxj_micro_' + name;
    this.name = name;
    this.sideEffect = new SideEffect(window);
    this.proxyWindow = new DiffSandbox();
    this.active = false;
  }
  // 修改js作用域
  bindScope(code) {
    return `;(function(window, self){with(window){;${code}\n}}).call(window, window, window);`;
  }
  // 开启沙箱
  start() {
    if (this.active) return;
    this.active = true;
    // 每个子系统独有副作用处理
    window[this.id] = this.sideEffect;
    // 先启副作用
    this.sideEffect.start();
    // 再启沙箱
    this.proxyWindow.start();
  }
  // 关闭沙箱
  stop() {
    if (!this.active) return;
    this.active = false;
    delete window[this.id];
    // 先停止沙箱
    this.proxyWindow.stop();
    // 再清副作用
    this.sideEffect.clear();
  }
}

export default Sandbox
