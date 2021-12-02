/**
 * 处理入口文件的一些方法
 */

import { getUrlOrigin, fetchResource } from './index';

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
    setTimeout(() => {
        getStyle(app);
        getScript(app);
    }, 0)
    return parent;
}


/**
 * 获取css样式
 * @param {*} app 应用实例
 */
function getStyle(app) {
    const links = app.links;
    const list = [];
    links.forEach(item => {
        if(item.href) {
            list.push(setRemoteCssScoped(item.href, app));
        } else {
            list.push(item.code)
        }
    })
    Promise.all(list).then(codes => {
        app.styleCodes = codes;
        app.loadCode();
    })
}

/**
 * 获取JavaScript
 * @param {*} app 应用实例
 */
function getScript(app) {
    const scripts = app.scripts;
    const list = [];
    scripts.forEach(item => {
        if(item.href) {
            list.push(getRemoteScript(item));
        } else {
            list.push({code: item.code, isModule: item.isModule})
        }
    })
    Promise.all(list).then(codes => {
        app.scriptCodes = codes;
        app.loadCode();
    })
}

/**
 * 获取远程JavaScript
 * @param {*} item
 * @returns
 */
function getRemoteScript(item) {
    const obj = {
        isExternal: item.isExternal,
        isModule: item.isModule,
        code: '',
        href: item.href,
        type: item.type
    }
    if(item.isExternal) {
        return Promise.resolve(obj)
    }
    return fetchResource(item.href).then(code => {
        obj.code = code;
        return Promise.resolve(obj)
    })
}

/**
 * 设置远程css作用域
 * @param {*} href
 * @param {*} app
 * @returns
 */
function setRemoteCssScoped(href, app) {
    return fetchResource(href).then(css => {
        return setLocalCssScoped(css, app);
    })
}

function setLocalCssScoped(css, app) {
    const style = document.createElement('style');
    style.textContent = css;
    document.body.appendChild(style);
    style.sheet.disabled = true;
    scopedCssStyle(style, app);
    document.body.removeChild(style);
    return style.textContent;
}

/**
 * 获取html中的style、script标签
 * @param {*} element
 * @param {*} app
 */
function recursionGetSource(element, app) {
    const { disableStyleSandbox } = app.option;
    [...element.childNodes].forEach(child => {
        const nodeName = child.nodeName;
        switch(nodeName) {
            case 'META':
            case 'TITLE':
                break;
            case 'STYLE': {
                if(disableStyleSandbox !== true) {
                    parseStyle(element, child, app);
                }
                break;
            }
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
    const type = node.getAttribute('type') || 'text/javascript';
    const isModule = type === 'module'; // 是否是module
    if(isModule) {
        app.moduleCount++;
    }
    if(src) { // 远程脚本
        // 是否是外部链接，外部链接就不做处理
        const { externalLinks } = app.option;
        const isExternal = externalLinks.includes(src);
        const newSrc = getAbsoluteHref(src, app.origin);
        app.scripts.push({
            href: newSrc,
            code: '',
            type,
            isModule,
            isExternal
        });
        const comment = document.createComment(`<script src="${newSrc}" />`);
        parentNode.insertBefore(comment, node);
        parentNode.removeChild(node);
    } else { // 内联脚本
        app.scripts.push({
            href: '',
            code: node.textContent,
            type,
            isModule,
            isExternal: false
        });
        parentNode.removeChild(node);
    }
}

/**
 * 解析link标签的内容
 * 获取远程样式地址和内联样式
 * @param {*} parentNode 父元素
 * @param {*} node 当前link节点
 * @param {*} app 应用实例
 */
function parseLink(parentNode, node, app) {
    const { disableStyleSandbox, externalLinks } = app.option;
    const rel = node.getAttribute('rel');
    const href = node.getAttribute('href');
    const as = node.getAttribute('as');
    // const type = node.getAttribute('type');
    // 是否是外部链接，外部链接就不做处理
    const isExternal = externalLinks.includes(href);
    if(isExternal) return ;

    const newHref = getAbsoluteHref(href, app.origin);
    if(href && rel === 'stylesheet') { // 外部链接
        if(disableStyleSandbox !== true) {
            app.links.push({
                href: newHref,
                code: ''
            });
            const comment = document.createComment(`<link href="${newHref}" rel="stylesheet" />`);
            parentNode.insertBefore(comment, node);
            parentNode.removeChild(node);
        }
    } else if (!as && rel === 'prefetch') { // 处理空闲时间加载的资源
        // ...
    } else { // 其他
        node.setAttribute('href', newHref);
    }
}

/**
 * 解析style标签的内容
 * @param {*} parentNode 父元素
 * @param {*} node 当前style节点
 * @param {*} app 应用实例
 */
function parseStyle(parentNode, node, app) {
    node.textContent = setLocalCssScoped(node.textContent, app);
}

/**
 * 设置样式作用域
 * @param {*} node 当前link节点
 * @param {*} name 作用域前缀
 */
export function scopedCssStyle(node, app) {
    const cssRules = node.sheet.cssRules;
    const styleList = [];
    parseCssRules(cssRules, styleList, app);
    node.textContent = styleList.join(' ');
}

/**
 * 解析样式规则并添加作用域前缀
 * @param {*} cssRules
 * @param {*} styleList
 * @param {*} name
 */
function parseCssRules(cssRules, styleList, app) {
    const name = app.name;
    const scopedName = app.scopedName;
    Array.from(cssRules).forEach(rule => {
        const type = rule.type;
        if(type === 4) { // @media 媒体查询
            const mediaStyleText = [];
            const conditionText = rule.media.mediaText;
            parseCssRules(rule.cssRules, mediaStyleText, app);
            const newStyleText = `@media ${conditionText} { ${ mediaStyleText.join(' ') } }`;
            styleList.push(newStyleText);
        } else if(type === 5) { // @font-face
            // 这里使用try catch为了兼容IE
            try {
                // 处理src相对路径
                let cssText = rule.cssText || '';
                if(rule.style && rule.style.src) {
                    let src = rule.style.src;
                    if(/url\("?((((\.){1,2}\/)+)[^")]*)"?\)/.test(src)) {
                        let newSrc = src.replace(/url\("?((((\.){1,2}\/)+)[^")]*)"?\)/g, (str, url, prefix) => {
                            return `url("${url.replace(prefix, `/${name}/`)}")`;
                        });
                        cssText = cssText.replace(src, newSrc);
                    }
                }
                styleList.push(cssText)
            } catch (error) {
                console.log(error);
            }
        } else if(type === 7 || type === 8) { // @keyframe
            // 为定义动画的时候进入该判断
            // 这里使用try catch为了兼容IE
            try {
                styleList.push(rule.cssText)
            } catch (error) {
                console.log(error);
            }
        } else { // 普通选择器
            const selectorText = rule.selectorText || '';
            let cssText = rule.cssText || '';

            // 处理background相对路径
            if(rule.style && rule.style.backgroundImage) {
                let backgroundImage = rule.style.backgroundImage;
                if(/url\("?((((\.){1,2}\/)+)[^")]*)"?\)/.test(backgroundImage)) {
                    let newBackgroundImage = backgroundImage.replace(/url\("?((((\.){1,2}\/)+)[^")]*)"?\)/, (str, url, prefix) => {
                        return `url("${url.replace(prefix, `/${name}/`)}")`;
                    });
                    cssText = cssText.replace(backgroundImage, newBackgroundImage);
                }
            }

            selectorText.split(',').forEach(select => {
                select = select.trim();
                // body、html选择器不设置作用域
                if(!select.startsWith('body') && !select.startsWith('html') && !select.startsWith('@font-face')) {
                    cssText = cssText.replace(select, `[name="${ scopedName }"] ${select}`)
                }
            });
            styleList.push(cssText);
        }
    })
}

/**
 * 根据远程资源地址和及应用origin地址拼接绝对路径
 * @param {*} href
 * @param {*} origin
 * @returns
 */
function getAbsoluteHref(href, origin) {
    return getUrlOrigin(href) ? href : `${origin}${href.startsWith('/') ? href: '/' + href}`;
}

/**
 * 创建script标签
 * @param {*} href
 * @param {*} isModule
 */
export function createScriptElement(app, {href, type, code, isModule}) {
    const scriptElem = document.createElement('script');
    if(isModule) {
        // 监听module加载完成
        scriptElem.addEventListener('load', () => {
            if(--app.moduleCount <= 0) {
                app.execModuleMount();
            }
        });
        // 这里 basename 需要和子应用vite.config.js中base的配置保持一致
        const name = app.name;
        // eslint-disable-next-line
        const reg = new RegExp(`(from|import)(\\s*['"])(\/${name}\/)`, 'g');
        const newCode = code.replace(reg, all => {
            return all.replace(`/${name}/`, `${app.url}/`);
        })
        const blob = new Blob([newCode], { type: 'text/javascript' })
        scriptElem.src = URL.createObjectURL(blob);
    } else {
        scriptElem.src = href;
    }
    scriptElem.type = type;
    app.el.appendChild(scriptElem);
}

// function runCode2InlineScript (
//     url: string,
//     code: string,
//     module: boolean,
//     scriptElement: HTMLScriptElement,
//     callback?: moduleCallBack,
// ): void {
//     if (module) {
//         // module script is async, transform it to a blob for subsequent operations
//         const blob = new Blob([code], { type: 'text/javascript' })
//         scriptElement.src = URL.createObjectURL(blob)
//         scriptElement.setAttribute('type', 'module')
//         if (callback) {
//             callback.moduleCount && callback.moduleCount--
//             scriptElement.onload = callback.bind(scriptElement, callback.moduleCount === 0)
//         }
//     } else {
//         scriptElement.textContent = code
//     }
//
//     if (!url.startsWith('inline-')) {
//         scriptElement.setAttribute('data-origin-src', url)
//     }
// }