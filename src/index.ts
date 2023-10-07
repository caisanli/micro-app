/**
 * MicroApp 主入口
 * 导出MicroApp组件及主应用自定义事件处理器
 */
import { start } from './micro';
import setPreload from './utils/preload';
import appEvent, { baseAppEvent } from './sandbox/event';

export {
  setPreload,
  baseAppEvent,
  appEvent,
  start,
};

export default start;
