/**
 * 拉取资源
 * @param url 
 */
export function fetchResource (url) {
    return fetch(url).then(res => res.text());
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