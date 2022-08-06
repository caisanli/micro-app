/**
 * 工具类方法
 */
/**
 * 拉取资源
 * @param url
 */
export function fetchResource (url) {
  return ajax({url}).then(res => res);
}

/**
 * ajax
 * @param {*} opt
 * @returns
 */
export function ajax(opt = {}) {
  return new Promise((resolve, reject) => {
    let { url, method, data, headers } = opt;
    url = url || '';
    method = method || 'get';
    data = data || {};
    headers = headers || {};
    const xhr = new XMLHttpRequest();
    xhr.onload = function(data) {
      resolve(data.target.response);
    };
    xhr.onerror = reject;
    xhr.open(method, url);
    Object.keys(headers).forEach(key => {
      xhr.setRequestHeader(key, headers[key]);
    });
    xhr.send(data);
  });
}

/**
 * 获取URL中的Origin地址
 * @param {*} url
 * @returns
 */
export function getUrlOrigin(url) {
  const reg = /(^www\.[^/]+[\da-zA-Z])|(^http[s]?:\/\/[^/]+)/;
  const result = reg.exec(url);
  if(!result) return '';
  return result[0];
}


/**
 * 是否是绝对路径
 * @param {*} url
 */
export function isAbsolutePath(url) {
  const reg = /(^www\.)|(^http[s]?:\/\/)/;
  return reg.test(url);
}

/**
 * 获取URL
 * @param {*} url
 */
export function getUrl(url) {
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
      let start = Date.now();
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
    window.cancelIdleCallback || function(id) {
      clearTimeout(id);
    };

/**
 * 是否支持 script module
 * @returns {boolean}
 */
export function isSupportMoudule () {
  const script = document.createElement('script');
  script.setAttribute('nomodule', null);
  return script.noModule !== undefined;
}

/**
 * 是否是异步加载的script
 * @param item
 * @returns {*|boolean}
 */
export function isAsyncScript (item) {
  return item.isExternal || item.isModule || item.isNoModule;
}

/**
 * 是否是vite的legacy模式的入口文件
 * @param item
 * @returns {*}
 */
export function isViteLegacyEntry (item) {
  return item.id && item.id.includes('vite') && item.dataSrc;
}
