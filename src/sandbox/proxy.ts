/**
 * 基于Proxy的沙箱
 */
import type { BaseSandbox } from '@zxj/micro';

class IframeProxy implements BaseSandbox {

  proxyWindow: Window;

  // iframeWindow: Window;

  proxy: typeof Proxy;

  isActive: boolean;

  /**
   * 构造函数
   * @param iframeWindow iframe的contentWindow
   */
  constructor(iframeWindow: Window) {
    // this.iframeWindow = iframeWindow;
    this.init(iframeWindow);
    console.log('初始化');
  }

  init(iframeWindow: Window) {
    const proxy = new Proxy(iframeWindow, {
      get(target, key, receiver) {
        console.log('proxy get');
        console.log(key);
        return target[key as unknown as number];
      },
      set(target, key, value, recriver) {
        console.log('proxy set');
        console.log(key);
        return true;
      }
    });
    iframeWindow['proxyWindow'] = proxy;
    iframeWindow['proxyLocation'] = window.location;
    iframeWindow['proxyHistory'] = window.history;
    this.proxyWindow = proxy;
  }

  start() {
    if (this.isActive) {
      return ;
    }
    this.isActive = true;
  }

  stop() {
    if (!this.isActive) {
      return ;
    }
    this.isActive = false;
    console.log('stop');
  }
}

export default IframeProxy;
