/**
 * 创建Vue MicroApp组件
 */
import ZMicroApp from './app';
import cache, { global, MICRO_APP_NAME } from './utils/cache';

const NEED_UPDATE_SOURCE_MSG = 'Uncaught SyntaxError: Unexpected token \'<\'';

/**
 * 自定义元素 MicroAppElement
 */
class MicroAppElement extends HTMLElement {
  // 全局唯一
  name?: string;
  // 子系统入口文件地址（index.html）
  url?: string;
  // 是否启用样式沙箱 默认值（true）
  styleSandbox?: boolean;
  // externalLinks 外部链接不处理
  // externalLinks?: string[];
  // 是否支持 module
  module?: boolean;
  // 是否开启沙箱 默认 false
  sandbox?: boolean;
  // 自定义数据
  // customData?: Record<string | number, unknown>;

  app?: ZMicroApp;

  constructor() {
    super();
  }

  /**
   * 初始化配置
   */
  initConfig() {
    this.name = this.getAttribute('name') || '';
    this.url = this.getAttribute('url') || '';
    this.styleSandbox = this.getAttribute('styleSandbox') === 'false';
    // this.externalLinks = this.getAttribute('externalLinks');
    this.module = this.getAttribute('module') === 'true';
    this.sandbox = this.getAttribute('sandbox') === 'true';
    // this.customData = this.getAttribute('customData');
  }

  /**
   * 创建 Dom
   */
  create() {
    const shadowRoot = this.attachShadow({ mode: 'open' });
    const div = document.createElement('div');
    const id = `zxj_micro-${ this.name }`;
    div.id = id;
    div.setAttribute('name', id);
    shadowRoot.append(div);
  }

  initApp() {
    const { name, url, styleSandbox, module, sandbox } = this;
    if (!name || !url) {
      throw Error('缺少 micro-app 必要的属性：name、url');
    }
    this.bindGlobalEvent();
    // 从缓存中取子系统实例
    const app = cache[name];
    if (app) { // 存在实例，就挂载
      this.app = app;
      this.app.mount(() => {
        this.emitLoaded();
      });
    } else { // 不存在实例，就初始化
      this.app = new ZMicroApp({
        name,
        url,
        styleSandbox,
        // externalLinks: externalLinks as string[],
        module,
        sandbox,
        callback: () => {
          this.emitLoaded();
        }
      });
      cache[name] = this.app;
    }
  }

  emitLoaded() {
    console.warn('未实现 emitLoad 方法');
    // this.app && this.app.dispatch('custom-data', this.customData);
  }

  bindGlobalEvent() {
    if (global.isBindGlobalEvent) return;
    global.isBindGlobalEvent = true;
    // 监听错误事件
    window.addEventListener('error', (e) => {
      console.log('window error：', e);
      if (!e) return ;
      if (e.message === NEED_UPDATE_SOURCE_MSG) {
        console.error(`执行 ${ e.filename } JavaScript文件失败，可能是文件地址发生了变化，需要重新刷新浏览器。`);
        confirmReload();
      } else if(
        e.message === undefined
        && (
          (e.target as HTMLElement).tagName === 'SCRIPT' && (e.target as HTMLScriptElement).type === 'module'
          || (e.target as HTMLElement).tagName === 'LINK' && (e.target as HTMLLinkElement).rel === 'modulepreload'
        )
      ) {
        console.error(`获取 ${ (e.target as HTMLScriptElement).src } ESMODULE 失败，可能是文件地址发生了变化，需要重新刷新浏览器。`);
        confirmReload();
      }
    }, true);

    let timer: number;
    function confirmReload() {
      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(() => {
        const is = confirm('当前系统代码有更新，请刷新页面');
        if (is) {
          window.location.reload();
        }
      }, 1000) as unknown as number;
    }
  }

  /**
   * 插入页面
   */
  connectedCallback() {
    this.initConfig();
    this.create();
    this.initApp();
  }

  /**
   * 元素被删除
   */
  disconnectedCallback() {
    this.app && this.app.unmount();
  }
}

/**
 * 开始生成自定义元素
 */
function start() {
  customElements.define(MICRO_APP_NAME, MicroAppElement);
}

export {
  start
};
