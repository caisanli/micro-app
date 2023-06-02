/**
 * 事件处理器
 */
import { EventCallback, EventDataType } from '@zxj/micro';

const MAIN_PREFIX = '*-';

class Event {
  /**
   * 事件记录
   */
  private readonly event: {
    [name: string]: EventCallback[];
  };

  // 记录已有子系统前缀
  private readonly child: {
    [name: string]: 1;
  };

  constructor() {
    this.child = {};
    this.event = {};
  }

  /**
   * 添加子系统事件
   * @param name
   */
  addChild(name: string) {
    this.child[name] = 1;
  }

  /**
   * 事件绑定
   * @param {*} name 事件名称
   * @param {*} callback 事件回调
   * @returns
   */
  on(name: string, callback?: EventCallback) {
    if (!name || typeof callback !== 'function')
      return;

    if (this.event[name]) {
      this.event[name].push(callback);
    } else {
      this.event[name] = [callback];
    }
  }

  /**
   * 取消事件绑定
   * @param {*} name 事件名称
   * @param {*} callback 事件回调
   */
  off(name: string, callback?: EventCallback) {
    if (callback) {
      this.event[name] = this.event[name].filter(fn => fn !== callback);
    } else {
      this.event[name] = [];
    }
  }

  /**
   * 触发事件
   * @param {*} name 事件名称
   * @param {*} data 数据
   * @param {*} cycle 是否循环触发
   */
  dispatch(name: string, data?: EventDataType, cycle?: boolean) {
    const callbackList = this.event[name];
    if (Array.isArray(callbackList)) {
      callbackList.forEach(callback => callback(data));
    }

    // 如果是循环触发，就不执行了
    if (cycle) {
      return ;
    }

    // 如果主系统在触发事件
    // 可能需要触发子系统绑定的事件
    if (name.startsWith(MAIN_PREFIX)) {
      const newName = name.replace(MAIN_PREFIX, '');
      Object.keys(this.child).forEach(prefix => {
        this.dispatch(prefix + newName, data, true);
      });
      return ;
    }

    // 是子系统在触发事件
    // 可能需要触发主系统绑定的事件
    Object.keys(this.child).forEach(prefix => {
      const reg = new RegExp(prefix);
      const newName = name.replace(reg, MAIN_PREFIX);
      // 判断更换后的 name，有没有主系统的前缀，没有就不是主系统的事件名称
      if (newName.startsWith(MAIN_PREFIX)) {
        this.dispatch(newName, data, true);
      }
    });
  }

  /**
   * 清空事件
   */
  clear(prefix?: string) {
    Object.keys(this.event).forEach(key => {
      if (prefix) {
        if (key.startsWith(prefix)) {
          this.off(key);
        }
      } else {
        this.off(key);
      }
    });
  }
}

/**
 * 生成全局事件实例
 * 主系统和子系统共用
 */
const newEvent = new Event();

export default newEvent;

/**
 * 主系统事件处理
 */
class BaseAppEvent {
  on(key: string, callback: EventCallback) {
    newEvent.on(MAIN_PREFIX + key, callback);
  }

  dispatch(key: string, data?: EventDataType) {
    newEvent.dispatch(MAIN_PREFIX + key, data);
  }

  clear() {
    newEvent.clear(MAIN_PREFIX);
  }
}

export const baseAppEvent = new BaseAppEvent();
