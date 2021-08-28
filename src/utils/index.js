// import axios from 'axios';

/**
 * 拉取资源
 * @param url 
 */
export function fetchResource (url) {
    // return axios.get(url).then(res => {
    //     return res.data;
    // });
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