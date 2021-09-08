import { getUrlHost, fetchResource } from './index';

export function parseHtml(html, app) {
    const parent = document.createElement('div');
    parent.innerHTML = html;
    recursionGetSource(parent, app);
    getStyle(app);
    getScript(app);
    return parent;
}

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
        console.log('codes：', codes)
    })
}

// 递归获取资源
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
// 处理script
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

// 处理link标签
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


// 设置样式作用域
export function scopedCssStyle(node, name) {
    const cssRules = node.sheet.cssRules;
    const styleList = [];
    parseCssRules(cssRules, styleList, name);
    node.innerText = styleList.join(' ');
}

// 处理样式
function parseCssRules(cssRules, styleList, name) {
    [...cssRules].forEach(rule => {
        if(rule.media) { // 媒体查询
            const mediaStyleText = [];
            const conditionText = rule.media.mediaText;
            parseCssRules(rule.cssRules, mediaStyleText, name);
            const newStyleText = `@media ${conditionText} { ${ mediaStyleText.join(' ') } }`;
            styleList.push(
                newStyleText
            )
        } else { // 普通选择器
            const selectorText = rule.selectorText || '';
            let cssText = rule.cssText || '';
            selectorText.split(',').forEach(select => {
                select = select.trim();
                if(!select.startsWith('body') && !select.startsWith('html')) {
                    cssText = cssText.replace(select, `[name="zxj_micro_${name}"] ${select}`)
                }
            });
            styleList.push(cssText);
        }
    })
}

function getAbsoluteHref(href, host) {
    return getUrlHost(href) ? href : `${host}${href.startsWith('/') ? href: '/' + href}`;
}