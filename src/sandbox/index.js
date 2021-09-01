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
    this.proxyWindow = new DiffSandbox();
    this.id = '_zxj_micro_' + name
    this.name = name
    this.sideEffect = new SideEffect(window)
    this.active = false
  }
  // 修改js作用域
  bindScope(code) {
    return 'with (window) {' + code + '}';
    // return new Function(code);
    // return `;(function(window, self){with(window){;${code}\n}}).call(window, window, window);`
  }
  // 开启沙箱
  start() {
    if (this.active) return
    this.active = true
    window[this.id] = this.sideEffect
    this.proxyWindow.start()
    this.sideEffect.start();
  }
  // 关闭沙箱
  stop() {
    if (!this.active) return
    delete window[this.id];
    this.active = false
    this.proxyWindow.stop();
    this.sideEffect.clear();
  }
}

export default Sandbox
