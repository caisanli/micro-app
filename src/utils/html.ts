/**
 * 处理入口文件的一些方法
 */
import {getUrlOrigin, fetchResource, isSupportModule, isViteLegacyEntry} from './index';
import type { LinkItem, ScriptItem } from '@zxj/micro';
import ZMicroApp from '../app';
// 是否是生产环境
export const isProd = process.env.NODE_ENV !== 'development';

/**
 * 初始入口文件的html内容
 * @param {*} html html字符串
 * @param {*} app 子应用实例
 * @returns
 */
export function parseHtml(html: string, app: ZMicroApp): HTMLElement {
  const parent = document.createElement('div');
  parent.innerHTML = html;
  recursionGetSource(parent, app);
  setTimeout(() => {
    getStyle(app);
    getScript(app);
  }, 0);
  return parent;
}


/**
 * 获取css样式
 * @param {*} app 应用实例
 */
function getStyle(app: ZMicroApp) {
  const links = app.links;
  const list: (LinkItem | Promise<LinkItem>)[] = [];
  links.forEach(item => {
    if(item.href) {
      list.push(setRemoteCssScoped(item, app));
    } else {
      list.push({
        ...item,
        code: item.code
      });
    }
  });
  Promise.all(list).then(codes => {
    app.links = codes;
    app.loadCode();
  });
}

/**
 * 获取JavaScript
 * @param {*} app 应用实例
 */
function getScript(app: ZMicroApp) {
  const scripts = app.scripts;
  const list: (ScriptItem| Promise<ScriptItem>)[] = [];
  scripts.forEach(item => {
    if(item.href) {
      list.push(getRemoteScript(item));
    } else {
      list.push(item);
    }
  });
  Promise.all(list).then(codes => {
    app.scripts = codes;
    app.loadCode();
  });
}

/**
 * 获取远程JavaScript
 * @param {*} item
 * @returns
 */
function getRemoteScript(item: ScriptItem) {
  const obj = Object.assign({}, item);
  if (item.isExternal) {
    return Promise.resolve(obj);
  }
  return fetchResource(item.href).then(code => {
    obj.code = code;
    return Promise.resolve(obj);
  });
}

/**
 * 设置远程css作用域
 * @param {*} item
 * @param {*} app
 * @returns
 */
function setRemoteCssScoped(item: LinkItem, app: ZMicroApp) {
  return fetchResource(item.href).then(css => {
    return {
      ...item,
      code: setLocalCssScoped(css, app),
    };
  });
}

function setLocalCssScoped(css: string, app: ZMicroApp) {
  const style = document.createElement('style');
  style.textContent = css;
  document.body.appendChild(style);
  if (style.sheet) {
    style.sheet.disabled = true;
  }
  scopedCssStyle(style, app);
  document.body.removeChild(style);
  return style.textContent;
}

/**
 * 获取html中的style、script标签
 * @param {*} element
 * @param {*} app
 */
function recursionGetSource(element: HTMLElement, app: ZMicroApp) {
  Array.from(element.childNodes).forEach(child => {
    const nodeName = child.nodeName;
    switch(nodeName) {
    case 'META':
    case 'TITLE':
      break;
    case 'STYLE': {
      parseStyle((element as HTMLStyleElement), (child as HTMLStyleElement), app);
      break;
    }
    case 'LINK':
      parseLink((element as HTMLStyleElement), (child as HTMLStyleElement), app);
      break;
    case 'SCRIPT':
      parseScript(element, (child as HTMLScriptElement), app);
      break;
    }
  });

}

/**
 * 解析script标签的内容
 * 获取远程脚本地址和内联脚本
 * @param {*} parentNode 父元素
 * @param {*} node 当前script节点
 * @param {*} app 应用实例
 */
function parseScript(parentNode: HTMLElement, node: HTMLScriptElement, app: ZMicroApp) {
  const src = node.getAttribute('src');
  const type = node.getAttribute('type') || '';
  const isModule = type === 'module'; // 是否是module
  const isNoModule = node.hasAttribute('nomodule');
  const supportModule = app.module && isSupportModule();
  const id = node.getAttribute('id') || '';
  const dataSrc = node.getAttribute('data-src') || '';
  // 如果 nomodule 属性存在且浏览器支持 script module，则不处理
  if(isNoModule && supportModule) {
    const comment = document.createComment(`当前子应用不需要支持 nomodule <script src="${src}" />${node.textContent}</script>`);
    parentNode.insertBefore(comment, node);
    parentNode.removeChild(node);
    return ;
  }
  // 如果是script module
  if (isModule) {
    // 并且浏览器不支持，则不处理
    if (!supportModule) {
      const comment = document.createComment(`当前子应用不支持 module <script src="${src}" />${node.textContent}</script>`);
      parentNode.insertBefore(comment, node);
      parentNode.removeChild(node);
      return;
    }
  }
  const scriptItem: ScriptItem = {
    type,
    isModule,
    isNoModule,
    isExternal: false,
    code: '',
    href: '',
    id,
    dataSrc
  };
  if (src) { // 远程脚本
    // 是否是外部链接，外部链接就不做处理
    const externalLinks = app.externalLinks;
    const isExternal = externalLinks.includes(src);
    const newSrc = getAbsoluteHref(src, app.origin);
    scriptItem.isExternal = isExternal;
    scriptItem.href = (isNoModule || isModule) ? src : newSrc;
    const comment = document.createComment(`<script src="${newSrc}" />`);
    parentNode.insertBefore(comment, node);
    parentNode.removeChild(node);
  } else { // 内联脚本
    scriptItem.code = node.textContent || '';
    parentNode.removeChild(node);
  }

  if (isModule) {
    app.moduleCount++;
  }

  app.scripts.push(scriptItem);
}

/**
 * 解析link标签的内容
 * 获取远程样式地址和内联样式
 * @param {*} parentNode 父元素
 * @param {*} node 当前link节点
 * @param {*} app 应用实例
 */
function parseLink(parentNode: HTMLStyleElement, node: HTMLStyleElement, app: ZMicroApp) {
  const externalLinks = app.externalLinks;
  const rel = node.getAttribute('rel');
  const href = node.getAttribute('href') || '';
  const as = node.getAttribute('as');
  // const type = node.getAttribute('type');
  // 是否是外部链接，外部链接就不做处理
  const isExternal = externalLinks.includes(href);
  if(isExternal) return ;

  const newHref = getAbsoluteHref(href, app.origin);
  if (href && rel === 'stylesheet') { // 外部链接
    app.links.push({
      href: newHref,
      code: ''
    });
    const comment = document.createComment(`<link href="${newHref}" rel="stylesheet" />`);
    parentNode.insertBefore(comment, node);
    parentNode.removeChild(node);
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
function parseStyle(parentNode: HTMLStyleElement, node: HTMLStyleElement, app: ZMicroApp) {
  node.textContent = setLocalCssScoped(node.textContent || '', app);
}

/**
 * 设置样式作用域
 * @param node style节点
 * @param app 应用实例
 */
export function scopedCssStyle(node: HTMLStyleElement, app: ZMicroApp) {
  if (!node.sheet) {
    return ;
  }
  const cssRules:CSSRuleList = node.sheet.cssRules;
  const styleList: string[] = [];
  parseCssRules(cssRules, styleList, app);
  node.textContent = styleList.join(' ');
}

/**
 * 解析样式规则并添加作用域前缀
 * @param {*} cssRules 样式规则
 * @param {*} styleList 存储样式列表
 * @param {*} app 应用实例
 */
function parseCssRules(cssRules:CSSRuleList, styleList: string[], app: ZMicroApp) {
  const name = app.name;
  const scopedName = app.scopedName;
  const disableStyleSandbox = app.disableStyleSandbox;
  Array.from(cssRules).forEach(rule => {
    const type = rule.type;
    if (type === 4) { // @media 媒体查询
      const mediaStyleText: string[] = [];
      const conditionText = (rule as CSSMediaRule).media.mediaText;
      parseCssRules((rule as CSSGroupingRule).cssRules, mediaStyleText, app);
      const newStyleText = `@media ${conditionText} { ${ mediaStyleText.join(' ') } }`;
      styleList.push(newStyleText);
    } else if(type === 5) { // @font-face
      // 这里使用try catch为了兼容IE
      try {
        // 处理src相对路径
        let cssText = rule.cssText || '';
        // if(rule.style && rule.style.src) {
        //   let src = rule.style.src;
        //   if(/url\("?((((\.){1,2}\/)+)[^")]*)"?\)/.test(src)) {
        //     let newSrc = src.replace(/url\("?((((\.){1,2}\/)+)[^")]*)"?\)/g, (str, url, prefix) => {
        //       return `url("${url.replace(prefix, `/${name}/`)}")`;
        //     });
        //     cssText = cssText.replace(src, newSrc);
        //   }
        // }
        if(/url\("?((((\.){1,2}\/)+)[^")]*)"?\)/.test(cssText)) {
          cssText = cssText.replace(/url\("?((((\.){1,2}\/)+)[^")]*)"?\)/g, (str, url, prefix) => {
            return `url("${url.replace(prefix, `/${name}/`)}")`;
          });
        }
        styleList.push(cssText);
      } catch (error) {
        console.log(error);
      }
    } else if(type === 7 || type === 8) { // @keyframe
      // 为定义动画的时候进入该判断
      // 这里使用try catch为了兼容IE
      try {
        styleList.push(rule.cssText);
      } catch (error) {
        console.log(error);
      }
    } else { // 普通选择器
      const selectorText = (rule as CSSStyleRule).selectorText || '';
      let cssText = rule.cssText || '';

      // 处理background相对路径
      if((rule as CSSStyleRule).style && (rule as CSSStyleRule).style.backgroundImage) {
        const backgroundImage = (rule as CSSStyleRule).style.backgroundImage;
        if(/url\("?((((\.){1,2}\/)+)[^")]*)"?\)/.test(backgroundImage)) {
          const newBackgroundImage = backgroundImage.replace(/url\("?((((\.){1,2}\/)+)[^")]*)"?\)/, (str, url, prefix) => {
            return `url("${url.replace(prefix, `/${name}/`)}")`;
          });
          cssText = cssText.replace(backgroundImage, newBackgroundImage);
        }
      }
      if (disableStyleSandbox !== true) {
        selectorText.split(',').forEach(select => {
          select = select.trim();
          // body、html选择器不设置作用域
          if(!select.startsWith('body') && !select.startsWith('html') && !select.startsWith('@font-face')) {
            cssText = cssText.replace(select, `[name="${ scopedName }"] ${select}`);
          }
        });
      }
      styleList.push(cssText);
    }
  });
}

/**
 * 根据远程资源地址和及应用origin地址拼接绝对路径
 * @param {*} href
 * @param {*} origin
 * @returns
 */
function getAbsoluteHref(href: string, origin: string) {
  return getUrlOrigin(href) ? href : `${origin}${href.startsWith('/') ? href: '/' + href}`;
}

/**
 * 创建script标签
 * @param app
 * @param item
 * @param next 资源加载完毕的回调函数
 */
export function createScriptElement(app: ZMicroApp, item: ScriptItem, next: () => void) {
  const { href, type, code, isModule, isNoModule, id, dataSrc } = item;
  const scriptElem = document.createElement('script');
  if (isModule) {
    let newCode;
    if (!isProd) {
      // 开发环境下
      // 替换路径为带域名的路径，如：
      // '/vite/node_modules/.vite/vue.js'替换为'http://127.0.0.1:1004/vite/node_modules/.vite/vue.js'
      // 保证module能准确引入
      const name = app.name;
      // eslint-disable-next-line
            const reg = new RegExp(`(from|import)(\\s*['"])(\/${name}\/)`, 'g');
      newCode = code.replace(reg, all => {
        return all.replace(`/${name}/`, `${app.url}/`);
      });
      const blob = new Blob([newCode], { type: 'text/javascript' });
      const url = URL.createObjectURL(blob);
      scriptElem.src = url;
      app.blobUrls.push(url);
    } else {
      // 生产环境下
      if (href) {
        scriptElem.src = href;
      } else {
        scriptElem.textContent = code;
      }
    }
  } else if (isNoModule && !isViteLegacyEntry(item)) {
    scriptElem.setAttribute('data-nomodule', 'true');
    if (href) {
      scriptElem.src = href;
    }
    if (code) {
      const blob = new Blob([code], { type: 'text/javascript' });
      const url = URL.createObjectURL(blob);
      scriptElem.src = url;
      app.blobUrls.push(url);
    }
  } else if (href) {
    scriptElem.src = href;
  }
  if (id) {
    scriptElem.id = id;
  }
  if (dataSrc) {
    scriptElem.setAttribute('data-src', dataSrc);
  }
  if (type) {
    scriptElem.type = type;
  }
  scriptElem.async = false;
  // 监听script加载完成
  scriptElem.addEventListener('load', () => {
    next();
  });
  // 加载失败也算成功
  scriptElem.addEventListener('error', (error) => {
    console.log(error);
    next();
  });

  if (app.shadowEl) {
    app.shadowEl.appendChild(scriptElem);
  }

  // 空标签的script标签不用等加载完毕
  if (!scriptElem.src) {
    next();
  }
}
