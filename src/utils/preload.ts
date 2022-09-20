import cache from './cache';
import ZMicroApp from '../app';
import type { MircoAppOptions } from '@zxj/micro';

/**
 * 设置预加载应用
 * @param apps
 */
function setPreload(apps: MircoAppOptions | MircoAppOptions[]) {
  const list = Array.isArray(apps) ? apps : [apps];
  list.forEach(options => {
    const { name } = options;
    // 如果缓存中存在实例，就不需要预加载
    if (cache[name]) {
      return;
    }
    // 创建实例并缓存实例
    cache[name] = new ZMicroApp({
      ...options,
      preload: true
    });
  });
}

export default setPreload;
