/* eslint-disable */
import { fetchResource, getUrlOrigin, getUrl, isAsyncScript, isViteLegacyEntry, isSupportShadowDom } from './utils';
import { parseHtml, scopedCssStyle, createScriptElement, isProd, scopedCssLink } from './utils/html';
import Sandbox from './sandbox/index';
// @ts-ignore
import _JsMutationObserver from './utils/MutationObserver';
import type { MicroAppStatus, MircoAppOptions, ScriptItem, LinkItem } from '@zxj/micro';

class ZMicroApp {
  // 状态
  status: MicroAppStatus = 'init';
  // 唯一名称
  name = '';
  // 入口文件地址
  url = '';
  // 是否支持module
  module = false;
  // 是否支持沙箱
  isSandbox = false;
  // 是否禁用样式沙箱
  disableStyleSandbox = true;
  // 外部链接
  externalLinks: string[] = [];
  // 缓存容器dom
  container: HTMLElement | null = null;
  // 真实容器dom
  el: HTMLElement | null = null;
  // shadow dom 要可能是 上面的el
  shadowEl: ShadowRoot | HTMLElement | null = null;
  //
  origin = '';
  // 记录在head标签中动态添加的style、script
  headAddStyleIds: string[] = [];
  // 用于css、javascript资源请求计数
  fetchCount = 0;
  // 统一设置作用域名称
  scopedName = '';
  // 存放css样式的远程地址、内联代码
  links: LinkItem[] = [];
  // 存放JavaScript的远程地址、内联代码
  scripts: ScriptItem[] = [];
  // MutationObserver实例
  observerHead?: MutationObserver;
  observerBody?: MutationObserver;
  // 记录module的数量
  moduleCount = 0;
  // 缓存blob地址
  blobUrls: string[] = [];
  // 沙箱
  sandbox: Sandbox; // = new Sandbox(name);
  // 子系统添加的元素
  addNodes: Node[] = [];
  // 预加载完后，须立即执行
  preloadedNeedImplement: boolean = false;

  constructor(options: MircoAppOptions) {
    const defaultOpt: MircoAppOptions = {
      url: '',
      name: '',
      module: false,
      sandbox: false,
      disableStyleSandbox: true,
      preload: false,
      externalLinks: []
    };
    const _options = Object.assign(defaultOpt, options);
    const name = _options.name;
    if (_options.preload) {
      this.status = 'preloading';
    }
    this.name = name;
    this.url = getUrl(_options.url);
    this.origin = getUrlOrigin(this.url);
    this.scopedName = 'zxj_micro_' + name;
    this.isSandbox = _options.sandbox ? isSupportShadowDom() : false;
    this.module = _options.module || !isProd;
    this.externalLinks = _options.externalLinks || [];
    this.disableStyleSandbox = _options.disableStyleSandbox;
    this.sandbox = new Sandbox(this);
    // 处理入口文件
    this.parseEntry();
  }

  /**
   * 插入子系统html内容
   */
  insertHtml() {
    this.el = document.getElementById(`zxj_micro-${ this.name }`);
    const el = this.el;
    const fragment = document.createDocumentFragment();
    const cloneContainer = this.container?.cloneNode(true);
    Array.from(cloneContainer?.childNodes || []).forEach(node => {
      fragment.appendChild(node);
    });
    if (!el) return ;

    if (this.isSandbox) {
      const shadow = el.attachShadow({ mode: 'open' })
      shadow.appendChild(fragment)
      this.shadowEl = shadow;
    } else {
      el.appendChild(fragment)
      this.shadowEl = el;
    }
  }

  /**
   * 监听head元素，
   * 如果有新的style元素添加就设置css作用域
   * 也处理动态script
   */
  observerHeadFn() {
    const head = document.querySelector('head');
    const config = {attributes: false, childList: true, subtree: false};
    const disableStyleSandbox = this.disableStyleSandbox;
    const callback = (mutationsList: MutationRecord[]) => {
      const linkHrefList: string[] = [];
      [...mutationsList].forEach(mutation => {
        if (mutation.type !== 'childList') {
          return;
        }
        if (!mutation.addedNodes || !mutation.addedNodes.length) {
          return;
        }
        Array.from(mutation.addedNodes).forEach((node, index) => {
          const nodeName = node.nodeName;
          const id = Math.round((Math.random() * 1000)) + '-' + index + '-' + Date.now();
          (node as HTMLElement).id = id;
          this.headAddStyleIds.push(id);
          switch (nodeName) {
            case 'STYLE': {
              this.headAddStyleIds.push(id);
              if (disableStyleSandbox !== true) {
                scopedCssStyle((node as HTMLStyleElement), this);
              }
              break;
            }
            case 'LINK': {
              if (disableStyleSandbox !== true && (node as HTMLLinkElement).rel === 'stylesheet') {
                linkHrefList.push((node as HTMLLinkElement).href);
              }
              break;
            }
          }
        });
      });

      setTimeout(() => {
        for (let i = 0; i < document.styleSheets.length; i++) {
          const styleSheet = document.styleSheets[i];
          if (styleSheet.href && linkHrefList.includes(styleSheet.href)) {
            styleSheet.disabled = true;
          }
        }
        scopedCssLink(linkHrefList, this);
      }, 0);
    };
    if (head) {
      // @ts-ignore
      const observer = new _JsMutationObserver(callback);
      observer.observe(head, config);
      this.observerHead = observer;
    }
  }

  /**
   * 监听Body元素
   * 只监听当前body下的子级（不是子子...级）增删变化
   * 如果有新增元素就设置name属性'_zxj_micro_' + name
   */
  observerBodyFn() {
    const body = document.querySelector('body');
    const config = {attributes: false, childList: true, subtree: false};
    const callback = (mutationsList: MutationRecord[]) => {
      Array.from(mutationsList).forEach(item => {
        Array.from(item.addedNodes).forEach(node => {
          try {
            if (!node) return;
            const nodeName = node.nodeName;
            if (nodeName === 'STYLE' || nodeName === 'IFRAME') return;
            this.addNodes.push(node);
            if ((node as HTMLElement).setAttribute) {
              (node as HTMLElement).setAttribute('name', 'zxj_micro_' + this.name);
            }
          } catch (error) {
            console.log(error);
          }
        });
        item.removedNodes.forEach(rnode => {
          this.addNodes = this.addNodes.filter(node => node !== rnode);
        });
      });
    };

    if (body) {
      // @ts-ignore
      const observer = new _JsMutationObserver(callback);
      observer.observe(body, config);
      this.observerBody = observer;
    }
  }

  /**
   * 解析入口文件
   * 返回一个容器元素，存放子系统html结构
   * 得到css、JavaScript的内联、远程代码放入links、scripts中
   */
  parseEntry() {
    const url = this.url + (isProd ? '?now=' + Date.now() : '');
    fetchResource(url).then((html: string) => {
      this.container = parseHtml(html, this);
      this.insertHtml();
    }).catch((err) => {
      console.log(err);
    });
  }

  /**
   * 用于css、javascript资源请求完毕后执行
   * 由于请求资源是异步的
   * 所以计了数，2次后表示css、javascript资源都请求完毕，可以执行了
   */
  loadCode() {
    if (++this.fetchCount < 2) {
      return ;
    }
    // 如果是在预加载中
    if (this.status === 'preloading') {
      // 就设置为预加载完成
      this.status = 'preloaded';
      // 如果不需要立即执行就不执行
      if (!this.preloadedNeedImplement) {
        return ;
      }
    }
    this.mount();
  }

  /**
   * 执行css代码
   */
  execStyle() {
    try {
      this.links.forEach(link => {
        const style = document.createElement('style');
        style.textContent = link.code;
        this.shadowEl?.appendChild(style);
      });
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * 执行JavaScript代码
   */
  execScript(scriptCodes: ScriptItem[], callback?: () => void) {
    let index = -1;
    const runScript = () => {
      index++;
      const item = scriptCodes[index];
      if (item === undefined) {
        typeof callback === 'function' && callback();
        return;
      }
      // 是远程链接、module、nomodule代码
      if (isAsyncScript(item)) {
        createScriptElement(this, item, () => {
          if (isViteLegacyEntry(item)) {
            const result = new Function(`return ${ item.code }`)();
            if (result.then) {
              result.then(() => {
                runScript();
              }).catch(() => {
                runScript();
              });
            } else {
              runScript();
            }
          } else {
            runScript();
          }
        });
      } else {
        const code = this.sandbox.bindScope(item.code);
        Function(code)();
        runScript();
      }
    };
    try {
      runScript();
    } catch (e) {
      console.log(e);
    }
  }

  /**
   * 清空head标签动态添加的style、script标签
   */
  clearHeadStyle() {
    try {
      const head = document.querySelector('head');
      this.headAddStyleIds.forEach(id => {
        const el = document.getElementById(id);
        if (el && head) {
          head.removeChild(el);
        }
      });
      this.headAddStyleIds = [];
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * 清空动态添加到body的元素
   */
  clearNodes() {
    try {
      const body = document.body;
      this.addNodes.forEach(node => {
        if (body.contains(node)) {
          body.removeChild(node);
        }
      });
      this.addNodes = [];
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * 挂载
   */
  mount() {
    // 如果还在预加载中
    if (this.status === 'preloading') {
      // 就设置预加载完成后立即执行
      this.preloadedNeedImplement = true;
      return ;
    }
    if (this.status === 'mount') {
      return ;
    }
    // 上次的状态是否是 init
    const prevStatusIsInit = this.status === 'init';
    // 上次状态是否是 preloaded
    const prevStatusIsPreloaded = this.status === 'preloaded';
    this.status = 'mount';
    window._zxj_is_micro = true;
    if (!prevStatusIsInit) {
      this.insertHtml();
    }
    // 开启沙箱
    this.sandbox.start();
    // 这是用setTimeout是为了防止页面卡顿，做了异步处理
    setTimeout(() => {
      try {
        // 执行样式代码
        this.execStyle();
        if (
          !this.moduleCount
          || prevStatusIsPreloaded
          || (prevStatusIsInit && this.moduleCount > 0)
        ) {
          // 执行script代码
          this.execScript(this.scripts, () => {
            // 触发mount事件
            this.emitMount();
          });
        } else {
          // 触发mount事件
          this.emitMount();
        }

        // 监听head
        this.observerHeadFn();
        // 监听body
        this.observerBodyFn();
      } catch (error) {
        console.log(error);
      }
    }, 0);
  }

  /**
   * 触发mount事件
   */
  emitMount() {
    this.sandbox.sideEffect.evt.dispatch('mount');
  }

  /**
   * 清空生成的blob url
   */
  clearBlobUrls() {
    this.blobUrls.forEach(URL.revokeObjectURL);
  }

  /**
   * 取消挂载
   */
  unmount() {
    if (this.status === 'unmount') {
      return;
    }
    this.status = 'unmount';
    // 如果没有module 或者 有module且是生产环境就要清除动态添加的style
    if (!this.moduleCount || (this.moduleCount && isProd)) {
      // 清空动态添加的style元素
      this.clearHeadStyle();
    }
    // 清空动态添加的元素
    this.clearNodes();
    // 触发unmount事件
    this.sandbox.sideEffect.evt.dispatch('unmount');
    // 清空blob url
    this.clearBlobUrls();
    if (!this.moduleCount) {
      // 停止沙箱
      this.sandbox.stop();
    }
    // 取消监听head元素
    this.observerHead && this.observerHead.disconnect();
    // 取消监听body元素
    this.observerBody && this.observerBody.disconnect();
    window._zxj_is_micro = false;
  }
}

export const App = ZMicroApp;

export default ZMicroApp;
