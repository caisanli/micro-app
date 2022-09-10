/**
 * 事件处理器
 */

type EventCallback = (data?: any) => void;

class Event {
  /**
   * 事件记录
   */
  event: {
    [name: string]: EventCallback[];
  };

  constructor() {
    this.event = {};
  }

  /**
   * 事件绑定
   * @param {*} name 事件名称
   * @param {*} callback 事件回调
   * @returns
   */
  on(name: string, callback: EventCallback) {
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
   */
  dispatch(name: string, data?: any) {
    const callbackList = this.event[name];
    if (Array.isArray(callbackList)) {
      callbackList.forEach(callback => callback(data));
    }
  }

  /**
   * 清空事件
   */
  clear() {
    Object.keys(this.event).forEach(key => {
      this.off(key);
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
  setData(data?: any) {
    newEvent.dispatch('data', data);
  }

  onData(callback: EventCallback) {
    newEvent.on('data', callback);
  }

  on(key: string, callback: EventCallback) {
    newEvent.on(key, callback);
  }

  dispatch(key: string, data?: any) {
    newEvent.dispatch(key, data);
  }
}

export const baseAppEvent = new BaseAppEvent();