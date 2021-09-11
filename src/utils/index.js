/**
 * 工具类方法
 */
/**
 * 拉取资源
 * @param url 
 */
export function fetchResource (url) {
    return ajax({url}).then(res => res)
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
            resolve(data.target.response)
        };
        xhr.onerror = reject;
        xhr.open(method, url);
        Object.keys(headers).forEach(key => {
            xhr.setRequestHeader(key, headers[key])
        })
        xhr.send(data);
    })
}

/**
 * 获取URL中的host地址
 * @param {*} url 
 * @returns 
 */
export function getUrlHost(url) {
    const hostReg = /(^www\.[^/]+[\da-zA-Z])|(^http[s]?:\/\/[^/]+[\d]+)/;
    const result = hostReg.exec(url);
    if(!result) return '';
    return result[0];
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
        var start = Date.now();
        return setTimeout(function() {
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