/**
 * 基于Proxy的沙箱
 */
import type { BaseSandbox } from '@zxj/micro';
import type ZMicroApp from '../app';
import { documentProxyProperties } from './common';
import { getTargetValue } from './utils';

class IframeProxy implements BaseSandbox {

  proxyWindow: Window;

  proxy: typeof Proxy;

  isActive: boolean;

  /**
   * 构造函数
   * @param app 应用实例
   * @param iframeWindow iframe的contentWindow
   */
  constructor(app: ZMicroApp, iframeWindow: Window) {
    this.init(app, iframeWindow);
  }

  init(app: ZMicroApp, iframeWindow: Window) {
    // const
    const proxyWindow = new Proxy(iframeWindow, {
      get(target, key) {
        console.log('proxyWindow get：', key);
        console.log(key);
        const value = Reflect.get(target, key);
        if (key === 'location' || key === 'history') {
          return window[key];
        }
        // console.log('value：', value);
        if (typeof value === 'function' && /^[a-z]/.test(key as string) ){
          return value.bind && value.bind(target);
        } else {
          return value;
        }
      },
      set(target, key, value) {
        // console.log('proxy set');
        // console.log(key);
        Reflect.set(target, key, value);
        return true;
      }
    });

    const proxyDocument = new Proxy({}, {
      get(target, propKey) {
        console.log('proxyDocument get：', propKey);
        const value = Reflect.get(target, propKey);
        // if (key === 'querySelector') {
        //   return app.shadowEl[key].bind(app.shadowEl);
        // } else  if (key === 'head') {
        //   return app.shadowEl;
        // }
        // // console.log('value：', value);
        // if (typeof value === 'function' && /^[a-z]/.test(key as string) ){
        //   return value.bind && value.bind(target);
        // } else {
        //   return value;
        // }

        const document = window.document;
        const shadowRoot = app.shadowEl;
        const iframe = app.iframe;

        // if (propKey === 'documentURI' || propKey === 'URL') {
        //   return (iframe.contentWindow.__WUJIE.proxyLocation as Location).href;
        // }

        // from shadowRoot
        if (
          propKey === 'getElementsByTagName' ||
          propKey === 'getElementsByClassName' ||
          propKey === 'getElementsByName'
        ) {
          return new Proxy(shadowRoot.querySelectorAll, {
            apply(querySelectorAll, _ctx, args) {
              let arg = args[0];
              console.log('getElementsByTagName arg：', arg);
              if (propKey === 'getElementsByTagName') {
                if (arg === 'script') {
                  console.log('iframe.contentDocument.scripts：', iframe.contentDocument.scripts, arg);
                  return iframe.contentDocument.scripts;
                } else if (documentProxyProperties.ownerProperties.includes(arg)) {
                  console.log('是ownerProperties', shadowRoot.appendChild);
                  return shadowRoot;
                }
              }
              if (propKey === 'getElementsByClassName') arg = '.' + arg;
              if (propKey === 'getElementsByName') arg = `[name="${arg}"]`;
              return querySelectorAll.call(shadowRoot, arg);
            },
          });
        }
        if (propKey === 'getElementById') {
          return new Proxy(shadowRoot.querySelector, {
            apply(querySelector, _ctx, args) {
              return querySelector.call(shadowRoot, `[id="${args[0]}"]`);
            },
          });
        }
        if (propKey === 'querySelector' || propKey === 'querySelectorAll') {
          return shadowRoot[propKey].bind(shadowRoot);
        }
        if (propKey === 'documentElement' || propKey === 'scrollingElement')
          return shadowRoot.firstElementChild;
        if (propKey === 'forms')
          return shadowRoot.querySelectorAll('form');
        if (propKey === 'images')
          return shadowRoot.querySelectorAll('img');
        if (propKey === 'links')
          return shadowRoot.querySelectorAll('a');
        const { ownerProperties, shadowProperties, shadowMethods, documentProperties, documentMethods } =
          documentProxyProperties;
        if (ownerProperties.concat(shadowProperties).includes(propKey.toString())) {
          if (propKey === 'activeElement' && 'activeElement' in shadowRoot && shadowRoot.activeElement === null) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            return shadowRoot;
          } else if(ownerProperties.includes(propKey.toString())) {
            return shadowRoot;
          } else {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            return shadowRoot[propKey];
          }
        }
        if (shadowMethods.includes(propKey.toString())) {
          return getTargetValue(shadowRoot, propKey) ?? getTargetValue(document, propKey);
        }
        // from window.document
        if (documentProperties.includes(propKey.toString())) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          return document[propKey];
        }
        if (documentMethods.includes(propKey.toString())) {
          return getTargetValue(document, propKey);
        }

      },
      set(target, key, value) {
        console.log('proxy set：', key, value);
        return Reflect.set(target, key, value);
      }
    });
    iframeWindow['proxyDocument'] = proxyDocument;
    iframeWindow['proxyWindow'] = proxyWindow;
    iframeWindow['proxyLocation'] = window.location;
    iframeWindow['proxyHistory'] = window.history;
    this.proxyWindow = proxyWindow;
  }

  start() {
    if (this.isActive) {
      return ;
    }
    this.isActive = true;
  }

  stop() {
    if (!this.isActive) {
      return ;
    }
    this.isActive = false;
    console.log('stop');
  }
}

export default IframeProxy;
