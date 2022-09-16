/**
 * 沙箱
 */
import DiffSandbox from './diff';
import SideEffect from './sideEffect';
import IframeProxy from './proxy';
import type { BaseSandbox } from '@zxj/micro';
import type ZMicroApp from '../app';

class Sandbox {
  id: string;
  name: string;
  sideEffect: SideEffect;
  sandbox: BaseSandbox;
  active: boolean;
  constructor(app: ZMicroApp) {
    this.id = '_zxj_micro_' + app.name;
    this.name = app.name;
    if (app.isSandbox) {
      this.sandbox = new IframeProxy(app, this.id);
    } else {
      this.sandbox = new DiffSandbox(this.id);
    }
    // 副作用处理
    this.sideEffect = new SideEffect(this.sandbox.proxyWindow, app.name);

    this.active = false;
  }
  // 修改js作用域
  bindScope(code: string) {
    const name = this.id;
    return `(function(window, document) {
         ${code}\n
       }).call(window['${ name }_window'], window['${ name }_window'], window['${ name }_document'])`;
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
    this.sideEffect.stop();
  }
}

export default Sandbox;
