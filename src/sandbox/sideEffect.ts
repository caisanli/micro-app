import eventInstance from './event';
import { EventCallback, MicroAppEvent, ProxyWindow } from '@zxj/micro';
const rawAddEventListener = window.addEventListener;
const rawRemoveEventListener = window.removeEventListener;
const rawSetInterval = window.setInterval;
const rawClearInterval = window.clearInterval;

/**
 * 子系统副作用处理
 * 原生addEventListener、removeEventListener、setInterval、clearInterval拦截代理
 * 自定义事件处理器
 */
class SideEffect {
  private proxyWindow: ProxyWindow;
  private active: boolean;
  evt: Partial<MicroAppEvent>;
  private evtListenerTypes: {
    [name:string]: 1
  };
  private listeners: {
    [eventType:string]: {
      listener: (this: Window, ev: any) => any;
      options: boolean
    }[]
  };
  private intervalTimers: number[];
  private name: string;

  constructor(proxyWindow: ProxyWindow, name: string) {
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
    this.name = name;
  }
  start() {
    if (this.active) {
      return ;
    }
    this.active = true;
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
      rawAddEventListener.call(this, type, listener, options);
    };
    // 代理原生removeEventListener
    this.proxyWindow.removeEventListener = function(type: string, listener: (this: Window, ev: any) => any, options: boolean){
      const listeners = _this.listeners[type];
      if (listeners && listener) {
        _this.listeners[type] = listeners.filter(item => listener !== item.listener);
      }
      rawRemoveEventListener.call(this, type, listener, options);
    };
    // 代理原生setInterval
    this.proxyWindow.setInterval = function(...args) {
      const intervalID = rawSetInterval.call(this, ...args);
      _this.intervalTimers.push(intervalID);
      return intervalID;
    };
    // 代理原生clearInterval
    this.proxyWindow.clearInterval = function(intervalID) {
      _this.intervalTimers = _this.intervalTimers.filter(id => id !== intervalID);
      return rawClearInterval.call(this, intervalID);
    };
    // 事件处理器
    const prefix = `${this.name}-`;
    // 向事件中心注册子系统
    eventInstance.addChild(prefix);
    // 每个事件名称前加上前缀
    // 保证子系统之间事件不冲突
    this.evt = {
      on: (key, listener) => {
        const newKey = `${prefix}${key}`;
        this.evtListenerTypes[newKey] = 1;
        eventInstance.on(newKey, listener);
      },
      dispatch: (key: string, data?: unknown) => {
        const newKey = `${prefix}${key}`;
        eventInstance.dispatch(newKey, data);
      },
      off: (key: string, callback?: EventCallback) => {
        const newKey = `${prefix}${key}`;
        eventInstance.off(newKey, callback);
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
  stop() {
    if (!this.active) {
      return ;
    }
    this.active = false;
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
      rawClearInterval.call(null, intervalID);
    });
    this.intervalTimers = [];
    this.proxyWindow.setInterval = rawSetInterval;
    this.proxyWindow.clearInterval = rawClearInterval;
    this.proxyWindow.addEventListener = rawAddEventListener;
    this.proxyWindow.removeEventListener = rawRemoveEventListener;
  }
}

export default SideEffect;
