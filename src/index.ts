/**
 * MicroApp 主入口
 * 导出MicroApp组件及主应用自定义事件处理器
 */
import MicroApp from './micro';
import appEvent, { baseAppEvent } from './sandbox/event';
import { vitePlugin as microAppVitePlugin } from './plugin/vite';

export {
  baseAppEvent,
  appEvent,
  MicroApp,
  microAppVitePlugin
};
