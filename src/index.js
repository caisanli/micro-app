/**
 * MicroApp 主入口
 * 导出MicroApp组件及主应用自定义事件处理器
 */
import micro from './micro';
import { baseAppEvent as _baseAppEvent } from './sandbox/event';
import VitePlugin from './plugin/vite';

export const baseAppEvent = _baseAppEvent;
export const MicroApp = micro;
export const MicroAppVitePlugin = VitePlugin;
