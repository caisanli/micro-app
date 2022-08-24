/**
 * 工具类方法
 */
import { ScriptItem } from '@zxj/micro';

/**
 * 拉取资源
 * @param url
 */

export function fetchResource (url: string): Promise<string> {
  return ajax({url}).then(res => (res as string));
}

export type AjaxOptions = {
  url: string;
  method?: string;
  data?: Document | XMLHttpRequestBodyInit | null;
  headers?: {
    [key: string]: string;
  };
}

/**
 * ajax
 * @param {*} opt
 * @returns
 */
export function ajax(opt: AjaxOptions) {
  return new Promise((resolve, reject) => {
    let { url, method, data,  } = opt;
    const { headers } = opt;
    url = url || '';
    method = method || 'get';
    data = data || null;
    const cHeaders = headers || {};
    const xhr = new XMLHttpRequest();
    xhr.onload = function() {
      resolve(xhr.response);
    };
    xhr.onerror = reject;
    xhr.open(method, url);
    Object.keys(cHeaders).forEach(key => {
      const value = cHeaders[key];
      xhr.setRequestHeader(key, value);
    });
    xhr.send(data);
  });
}

/**
 * 获取URL中的Origin地址
 * @param {*} url
 * @returns
 */
export function getUrlOrigin(url: string): string {
  const reg = /(^www\.[^/]+[\da-zA-Z])|(^http[s]?:\/\/[^/]+)/;
  const result = reg.exec(url);
  if(!result) return '';
  return result[0];
}


/**
 * 是否是绝对路径
 * @param {*} url
 */
export function isAbsolutePath(url: string) {
  const reg = /(^www\.)|(^http[s]?:\/\/)/;
  return reg.test(url);
}

/**
 * 获取URL
 * @param {*} url
 */
export function getUrl(url: string) {
  const reg = /(^www\.[^/]+[\da-zA-Z])|(^http[s]?:\/\/[^/]+[\d]+)/;
  if(reg.test(url)) {
    return url;
  }
  const { host, protocol } = window.location;
  return `${protocol}//${host}${url}`;
}

/**
 * 模拟 requestIdleCallback
 */
export const requestHostCallback =
    window.requestIdleCallback ||
    function(cb) {
      const start = Date.now();
      return setTimeout(() => {
        cb({
          didTimeout: false,
          timeRemaining: function() {
            return Math.max(0, 50 - (Date.now() - start));
          },
        });
      }, 1);
    };

export const cancelIdleCallback =
    window.cancelIdleCallback || function(id: number) {
      clearTimeout(id);
    };

/**
 * 是否支持 script module
 * @returns {boolean}
 */
export function isSupportModule () {
  const script = document.createElement('script');
  script.setAttribute('nomodule', 'null');
  return script.noModule !== undefined;
}

/**
 * 是否是异步加载的script
 * @param item
 * @returns {*|boolean}
 */
export function isAsyncScript (item: ScriptItem) {
  return item.isExternal || item.isModule || item.isNoModule;
}

/**
 * 是否是vite的legacy模式的入口文件
 * @param item
 * @returns {*}
 */
export function isViteLegacyEntry (item: ScriptItem) {
  return item.id && item.id.includes('vite') && item.dataSrc;
}
