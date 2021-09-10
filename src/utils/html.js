/**
 * 处理入口文件的一些方法
 */

import { getUrlHost, fetchResource } from './index';

/**
 * 初始入口文件的html内容
 * @param {*} html html字符串
 * @param {*} app 子应用实例
 * @returns 
 */
export function parseHtml(html, app) {
    const parent = document.createElement('div');
    parent.innerHTML = html;
    recursionGetSource(parent, app);
    getStyle(app);
    getScript(app);
    return parent;
}

/**
 * 获取远程css样式
 * @param {*} app 应用实例
 */
function getStyle(app) {
    const links = app.links;
    const list = [];
    links.forEach(item => {
        if(item.href) {
            list.push(fetchResource(item.href))
        } else {
            list.push(item.code)
        }
    })
    Promise.all(list).then(codes => {
        app.styleCodes = codes;
        app.execCode();
    })
}

/**
 * 获取远程JavaScript
 * @param {*} app 应用实例
 */
function getScript(app) {
    const scripts = app.scripts;
    const list = [];
    scripts.forEach(item => {
        if(item.href) {
            list.push(fetchResource(item.href))
        } else {
            list.push(item.code)
        }
    })
    Promise.all(list).then(codes => {
        app.scriptCodes = codes;
        app.execCode();
    })
}

/**
 * 获取html中的style、script标签
 * @param {*} element 
 * @param {*} app 
 */
function recursionGetSource(element, app) {
    [...element.childNodes].forEach(child => {
        const nodeName = child.nodeName;
        switch(nodeName) {
            case 'META':
            case 'TITLE':
                break;
            case 'LINK':
                parseLink(element, child, app);
                break;
            case 'SCRIPT':
                parseScript(element, child, app);
                break;
        }
    })
    
}

/**
 * 解析script标签的内容
 * 获取远程脚本地址和内联脚本
 * @param {*} parentNode 父元素
 * @param {*} node 当前script节点
 * @param {*} app 应用实例
 */
function parseScript(parentNode, node, app) {
    const src = node.getAttribute('src');
    if(src) { // 远程脚本
        const newSrc = getAbsoluteHref(src, app.host);
        app.scripts.push({
            href: newSrc,
            code: ''
        });
        
    } else { // 内联脚本
        app.scripts.push({
            href: '',
            code: node.textContent
        });
    }
    parentNode.removeChild(node);
}

/**
 * 解析link标签的内容
 * 获取远程样式地址和内联样式
 * @param {*} parentNode 父元素
 * @param {*} node 当前link节点
 * @param {*} app 应用实例
 */
function parseLink(parentNode, node, app) {
    const rel = node.getAttribute('rel');
    const href = node.getAttribute('href');
    const type = node.getAttribute('type');
    const newHref = getAbsoluteHref(href, app.host); // getUrlHost(href) ? href : `${app.host}${href.startsWith('/') ? href: '/' + href}`;
    if(href && rel === 'stylesheet') { // 外部链接
        app.links.push({
            href: newHref,
            code: ''
        });
        parentNode.removeChild(node);
    } else if(!rel || type === 'text/css') { // 内部样式表
        app.links.push({
            href: '',
            code: scopedCssStyle(node, app.name)
        })
    } else { // 其他
        node.setAttribute('href', newHref);
    }
}


/**
 * 设置样式作用域
 * @param {*} node 当前link节点 
 * @param {*} name 作用域前缀
 */
export function scopedCssStyle(node, name) {
    const cssRules = node.sheet.cssRules;
    const styleList = [];
    parseCssRules(cssRules, styleList, name);
    node.innerText = styleList.join(' ');
}

/**
 * 解析样式规则并添加作用域前缀
 * @param {*} cssRules 
 * @param {*} styleList 
 * @param {*} name 
 */
function parseCssRules(cssRules, styleList, name) {
    [...cssRules].forEach(rule => {
        if(rule.media) { // 媒体查询
            const mediaStyleText = [];
            const conditionText = rule.media.mediaText;
            parseCssRules(rule.cssRules, mediaStyleText, name);
            const newStyleText = `@media ${conditionText} { ${ mediaStyleText.join(' ') } }`;
            styleList.push(newStyleText);
        } else { // 普通选择器
            const selectorText = rule.selectorText || '';
            let cssText = rule.cssText || '';
            selectorText.split(',').forEach(select => {
                select = select.trim();
                // body、html选择器不设置作用域
                if(!select.startsWith('body') && !select.startsWith('html')) {
                    cssText = cssText.replace(select, `[name="zxj_micro_${name}"] ${select}`)
                }
            });
            styleList.push(cssText);
        }
    })
}

/**
 * 根据远程资源地址和及应用host地址拼接绝对路径
 * @param {*} href 
 * @param {*} host 
 * @returns 
 */
function getAbsoluteHref(href, host) {
    return getUrlHost(href) ? href : `${host}${href.startsWith('/') ? href: '/' + href}`;
}