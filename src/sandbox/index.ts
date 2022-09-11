/**
 * 沙箱
 */
import DiffSandbox from './diff';
import SideEffect from './sideEffect';
import IframeProxy from './proxy';
import type { BaseSandbox } from '@zxj/micro';
class Sandbox {
  id: string;
  name: string;
  sideEffect: SideEffect;
  sandbox: BaseSandbox;
  active: boolean;
  constructor(name: string, iframeWindow?: Window) {
    this.id = '_zxj_micro_' + name;
    this.name = name;
    if (iframeWindow !== undefined) {
      this.sandbox = new IframeProxy(iframeWindow);
    } else {
      this.sandbox = new DiffSandbox();
    }
    // 副作用处理
    this.sideEffect = new SideEffect(this.sandbox.proxyWindow);

    this.active = false;
  }
  // 修改js作用域
  bindScope(code: string) {
    return `(function(window, self, global, globalThis, location, history) {
              ${code}\n
             }).bind(window.proxyWindow)(
                window.proxyWindow,
                window.proxyWindow, 
                window.proxyWindow, 
                window.proxyWindow, 
                window.proxyLocation,
                window.proxyHistory
             )`;
  }
  // 开启沙箱
  start() {
    if (this.active) return;
    this.active = true;
    // 每个子系统独有副作用处理
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window[this.id] = this.sideEffect;
    // 先启副作用
    this.sideEffect.start();
    // 再启沙箱
    this.sandbox.start();
  }
  // 关闭沙箱
  stop() {
    if (!this.active) return;
    this.active = false;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    delete window[this.id];
    // 先停止沙箱
    this.sandbox.stop();
    // 再清副作用
    this.sideEffect.clear();
  }
}

export default Sandbox;
