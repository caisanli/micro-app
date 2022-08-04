/* eslint-disable */
import {fetchResource, getUrlOrigin, getUrl, isAsyncScript} from './utils';
import { parseHtml, scopedCssStyle, createScriptElement, isProd } from './utils/html';
import Sandbox from './sandbox/index.js';
import _JsMutationObserver from './utils/MutationObserver';
class ZMicroApp {
  /**
     * 插入子系统html内容
     */
  insertHtml() {
    this.el = document.getElementById(`zxj_micro-${this.name}`);
    const fragment = document.createDocumentFragment();
    const cloneContainer = this.container.cloneNode(true);
    [...cloneContainer.childNodes].forEach(node => {
      fragment.appendChild(node);
    });
    this.el && this.el.appendChild(fragment);
  }
  /**
     * 监听head元素，
     * 如果有新的style元素添加就设置css作用域
     * 也处理动态script
     */
  observerHeadFn() {
    const head = document.querySelector('head');
    const config = { attributes: false, childList: true, subtree: false };
    const { disableStyleSandbox } = this.option;
    const callback = (mutationsList) => {
      [...mutationsList].forEach(mutation => {
        if (mutation.type !== 'childList') {
          return ;
        }
        if(!mutation.addedNodes || !mutation.addedNodes.length) {
          return ;
        }
        [...mutation.addedNodes].forEach((node, index) => {
          const nodeName = node.nodeName;
          if(nodeName !== 'STYLE' && nodeName !== 'SCRIPT') {
            return ;
          }
          const id = Math.round((Math.random() * 1000)) + '-' + index + '-' + Date.now();
          node.id = id;
          switch(nodeName) {
          case 'STYLE': {
            this.headAddStyleIds.push(id);
            if(disableStyleSandbox !== true) {
              scopedCssStyle(node, this);
            }
            break;
          }
          case 'SCRIPT':
            this.headAddStyleIds.push(id);
            break;
          }

        });
      });
    };
    const observer = new _JsMutationObserver(callback);
    observer.observe(head, config);
    this.observerHead = observer;
  }
  /**
     * 监听Body元素
     * 只监听当前body下的子级（不是子子...级）增删变化
     * 如果有新增元素就设置name属性'_zxj_micro_' + name
     */
  observerBodyFn() {
    const body = document.querySelector('body');
    const config = { attributes: false, childList: true, subtree: false };
    const callback = (mutationsList) => {
      [...mutationsList].forEach(item => {
        item.addedNodes.forEach(node => {
          try {
            if(!node) return ;
            const nodeName = node.nodeName;
            if(nodeName === 'STYLE' || nodeName === 'IFRAME') return ;
            this.addNodes.push(node);
            node.setAttribute('name', 'zxj_micro_' + this.name);
          } catch (error) {
            console.log(error);
          }
        });
        item.removedNodes.forEach(rnode => {
          this.addNodes = this.addNodes.filter(node => node !== rnode);
        });
      });
    };
    const observer = new _JsMutationObserver(callback);
    observer.observe(body, config);
    this.observerBody = observer;
  }
  /**
     * 解析入口文件
     * 返回一个容器元素，存放子系统html结构
     * 得到css、JavaScript的内联、远程代码放入links、scripts中
     */
  parseEntry() {
    const url = this.url+ (isProd ? '?now=' + Date.now() : '');
    fetchResource(url).then(html => {
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
    if(++this.fetchCount >= 2) {
      this.hasModule = this.moduleCount > 0;
      this.cacheModuleCount = this.moduleCount;
      this.mount();
    }
  }
  /**
     * 用于预加载css、javascript资源请求完毕后执行
     * 由于请求资源是异步的
     * 所以计了数，2次后表示css、javascript资源都请求完毕，可以执行了
     */
  loadPrefetchCode() {
    if(++this.prefetchCount >= 2) {
      this.execPrefetchCode();
    }
  }
  /**
     * 执行预加载资源的代码
     */
  execPrefetchCode() {
    this.execStyle(this.prefetchStyles);
    this.execScript(this.prefetchScripts);
  }

  /**
   * 初始化
   * @param name
   * @param url
   * @param option
   */
  init(name, url, option) {
    const defaultOpt = {
      disableStyleSandbox: true,
      externalLinks: []
    };
    this.status = 'init';
    this.name = name;
    this.url = getUrl(url);
    // 缓存容器dom
    this.container = null;
    // 真实容器dom
    this.el = null;
    this.option = Object.assign(defaultOpt, option);
    this.origin = getUrlOrigin(this.url);
    // 记录在head标签中动态添加的style、script
    this.headAddStyleIds = [];
    // 用于css、javascript资源请求计数
    this.fetchCount = 0;
    // 存放JavaScript代码
    this.scriptCodes = [];
    // 统一设置作用域名称
    this.scopedName = 'zxj_micro_' + name;
    // 存放css代码
    this.styleCodes = [];
    // 存放css样式的远程地址、内联代码
    this.links = [];
    // 存放JavaScript的远程地址、内联代码
    this.scripts = [];
    // MutationObserver实例
    this.observerHead = null;
    this.observerBody = null;
    // 预加载资源类型请求次数
    this.prefetchCount = 0;
    // 是否支持module
    this.module = !isProd;
    // 是否有module
    this.hasModule = false;
    // 记录module的数量
    this.moduleCount = 0;
    // 缓存module的数量
    this.cacheModuleCount = 0;
    // 预加载script代码
    this.prefetchScripts = [];
    // 预加载css样式代码
    this.prefetchStyles = [];
    // 预加载资源
    this.prefetchSource = [];
    // 缓存blob地址
    this.blobUrls = [];
    // 沙箱
    this.sandbox = new Sandbox(name);
    // 处理入口文件
    this.parseEntry(this.mount);
    // 子系统添加的元素
    this.addNodes = [];
  }
  /**
     * 执行css代码
     */
  execStyle(styleCodes) {
    try {
      // const firstChild = this.el.firstChild;
      styleCodes.forEach(code => {
        const style = document.createElement('style');
        style.textContent = code;
        this.el.appendChild(style);
      });
    } catch (error) {
      console.log(error);
    }
  }
  /**
     * 执行JavaScript代码
     */
  execScript(scriptCodes) {
    try {
      scriptCodes.forEach(item => {
        // 是远程链接、module、nomodule代码
        if (isAsyncScript(item)) {
          createScriptElement(this, item);
          return ;
        }
        const code = this.sandbox.bindScope(item.code);
        /* eslint no-new-func: "off" */
        Function(code)();
        // (0, eval)(this.sandbox.bindScope(code))
      });
    } catch (error) {
      console.log(error);
    }
  }
  /**
     * 当所有module都加载完成后
     * 执行module加载完成事件
     */
  execModuleMount() {
    this.emitMount();
    this.moduleCount = this.cacheModuleCount;
  }
  /**
    * 清空head标签动态添加的style、script标签
    */
  clearHeadStyle() {
    try {
      const head = document.querySelector('head');
      this.headAddStyleIds.forEach(id => {
        const el = document.getElementById(id);
        if(el) {
          head.removeChild(document.getElementById(id));
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
        if(body.contains(node)) {
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
    if(this.status === 'mount') {
      return ;
    }
    const prevStatusIsInit = this.status === 'init';
    this.status = 'mount';
    window['_zxj_is_micro'] = true;
    if(!prevStatusIsInit) {
      this.insertHtml();
    }
    // 开启沙箱
    this.sandbox.start();
    // 这是用setTimeout是为了防止页面卡顿，做了异步处理
    setTimeout(() => {
      try {
        // 执行样式代码
        this.execStyle(this.styleCodes);
        // 执行script代码
        this.execScript(this.scriptCodes);
        // 触发mount事件
        this.emitMount();
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
    // 如果module未加载完毕，则不触发mount事件
    if (this.moduleCount > 0) {
      return ;
    }
    // 最大检测次数
    let maxCheckCount = 50;
    const checkMount = () => {
      const timer = setTimeout(() => {
        const mount = this.sandbox.sideEffect.evtListenerTypes['mount']
        if (mount) {
          clearTimeout(timer)
          this.sandbox.sideEffect.evt.dispatch('mount');
        } else if(--maxCheckCount <= 0) {
          clearTimeout(timer)
          console.log('未检测到mount事件绑定，请检查是否有问题');
        } else {
          checkMount()
        }
      }, 10)
    }
    // 检测是否绑定了mount事件
    checkMount();
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
    if(this.status === 'unmount') {
      return ;
    }
    this.status = 'unmount';
    // 清空动态添加的style元素
    this.clearHeadStyle();
    // 清空动态添加的元素
    this.clearNodes();
    // 触发unmount事件
    this.sandbox.sideEffect.evt.dispatch('unmount');
    // 清空blob url
    this.clearBlobUrls();
    // 停止沙箱
    this.sandbox.stop();
    // 取消监听head元素
    this.observerHead && this.observerHead.disconnect();
    // 取消监听body元素
    this.observerBody && this.observerBody.disconnect();
    window['_zxj_is_micro'] = false;
  }
}

export const MicroApp = ZMicroApp;
