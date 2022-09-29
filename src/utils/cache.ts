/**
 * 缓存子系统实例
 */
import ZMicroApp from '../app';

const cache: {
  [name: string]: ZMicroApp
} = {};

export default cache;

export const global = {
  isBindGlobalEvent: false
};
