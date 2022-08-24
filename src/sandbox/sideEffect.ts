import eventInstance from './event';
import { MicroAppEvent, ProxyWindow } from '@zxj/micro';
const addEventListener = window.addEventListener;
const removeEventListener = window.removeEventListener;
const cloneSetInterval = window.setInterval;
const cloneClearInterval = window.clearInterval;
// const defaultEvt = { on: () => {}, dispatch: () => {}, clear: () => {}, off: () => {} };
/**
 * 子系统副作用处理
 * 原生addEventListener、removeEventListener、setInterval、clearInterval拦截代理
 * 自定义事件处理器
 */
class SideEffect {
  proxyWindow: ProxyWindow;
  evt: Partial<MicroAppEvent>;
  evtListenerTypes: {
    [name:string]: 1
  };
  listeners: {
    [eventType:string]: {
      listener: (this: Window, ev: any) => any;
      options: boolean
    }[]
  };
  intervalTimers: number[];

  constructor(proxyWindow: ProxyWindow) {
    // 代理的环境
    this.proxyWindow = proxyWindow;
    // 自定义事件处理器
    this.evt = {};
    // 记录绑定自定义事件
    this.evtListenerTypes = {};
    // 记录绑定事件
    this.listeners = {};
    // 记录定时器
    this.intervalTimers = [];
  }
  start() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const _this = this;
    // 代理原生addEventListener
    this.proxyWindow.addEventListener = function(type: string, listener: (this: Window, ev: any) => any, options?: boolean) {
      const newListener = {
        listener,
        options
      };
      if (_this.listeners[type]) {
        _this.listeners[type].push(newListener);
      } else {
        _this.listeners[type] = [newListener];
      }
      addEventListener.call(this, type, listener, options);
    };
    // 代理原生removeEventListener
    this.proxyWindow.removeEventListener = function(type: string, listener: (this: Window, ev: any) => any, options: boolean){
      const listeners = _this.listeners[type];
      if (listeners && listener) {
        _this.listeners[type] = listeners.filter(item => listener !== item.listener);
      }
      removeEventListener.call(this, type, listener, options);
    };
    // 代理原生setInterval
    this.proxyWindow.setInterval = function(...args) {
      const intervalID = cloneSetInterval.call(this, ...args);
      _this.intervalTimers.push(intervalID);
      return intervalID;
    };
    // 代理原生clearInterval
    this.proxyWindow.clearInterval = function(intervalID) {
      _this.intervalTimers = _this.intervalTimers.filter(id => id !== intervalID);
      return cloneClearInterval.call(this, intervalID);
    };
    // 事件处理器
    this.evt = {
      on: (key, listener) => {
        this.evtListenerTypes[key] = 1;
        eventInstance.on(key, listener);
      },
      dispatch: (...args) => {
        eventInstance.dispatch(...args);
      },
      off: (...args) => {
        eventInstance.off(...args);
      },
      clear: () => {
        Object.keys(this.evtListenerTypes).forEach(key => {
          eventInstance.off(key);
        });
        this.evtListenerTypes = {};
      }
    };
  }
  /**
     * 清空代理事件及自定义事件
     */
  clear() {
    // 清空事件处理器
    this.evt.clear();
    Object.keys(this.listeners).forEach(key => {
      const listeners = this.listeners[key];
      listeners.forEach(item => {
        /* eslint no-useless-call: "off" */
        removeEventListener.call(null, key, item.listener, item.options);
      });
    });
    this.listeners = {};
    this.intervalTimers.forEach(intervalID => {
      /* eslint no-useless-call: "off" */
      cloneClearInterval.call(null, intervalID);
    });
    this.intervalTimers = [];
    this.proxyWindow.setInterval = cloneSetInterval;
    this.proxyWindow.clearInterval = cloneClearInterval;
    this.proxyWindow.addEventListener = addEventListener;
    this.proxyWindow.removeEventListener = removeEventListener;
  }
}

export default SideEffect;
