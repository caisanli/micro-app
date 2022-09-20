/**
 * 基于Proxy的沙箱
 */
import type { BaseSandbox } from '@zxj/micro';
import type ZMicroApp from '../app';
import {
  documentProxyProperties,
  rawDefineProperty,
  rawDocument,
  rawHasOwnProperty,
  rawWindow
} from '../utils/common';
import { getTargetValue, unique } from './utils';

class IframeProxy implements BaseSandbox {

  proxyWindow: Window;

  private active = false;

  // Properties newly added to microAppWindow
  private injectedKeys = new Set<PropertyKey>();

  private readonly rewriteName: string;

  /**
   * 构造函数
   * @param app 应用实例
   * @param rewriteName
   */
  constructor(app: ZMicroApp, rewriteName: string) {
    this.rewriteName = rewriteName;
    const proxyWindow = this.createProxyWindow() as Window;
    rawWindow[this.rewriteName + '_document'] = this.createProxyDocument(app);
    rawWindow[this.rewriteName + '_window'] = proxyWindow;
    this.proxyWindow = proxyWindow;
  }

  /**
   * 代理 rawDocument
   */
  createProxyDocument(app: ZMicroApp) {
    return new Proxy(rawDocument, {
      get(target, propKey) {
        const shadowRoot = app.shadowEl || rawDocument;
        // from shadowRoot
        if (
          propKey === 'getElementsByTagName' ||
          propKey === 'getElementsByClassName' ||
          propKey === 'getElementsByName'
        ) {
          return new Proxy(shadowRoot.querySelectorAll, {
            apply(querySelectorAll, _ctx, args) {
              let arg = args[0];
              if (propKey === 'getElementsByTagName') {
                if (documentProxyProperties.ownerProperties.includes(arg)) {
                  return shadowRoot;
                }
              }
              if (propKey === 'getElementsByClassName') arg = '.' + arg;
              if (propKey === 'getElementsByName') arg = `[name="${ arg }"]`;
              return querySelectorAll.call(shadowRoot, arg);
            },
          });
        }
        if (propKey === 'getElementById') {
          return new Proxy(shadowRoot.querySelector, {
            apply(querySelector, _ctx, args) {
              return querySelector.call(shadowRoot, `[id="${ args[0] }"]`);
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

        const {ownerProperties, shadowProperties, shadowMethods} =
          documentProxyProperties;

        if (ownerProperties.concat(shadowProperties).includes(propKey.toString())) {
          if (propKey === 'activeElement' && 'activeElement' in shadowRoot && shadowRoot.activeElement === null) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            return shadowRoot;
          } else if (ownerProperties.includes(propKey.toString())) {
            return shadowRoot;
          } else {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            return shadowRoot[propKey];
          }
        }
        if (shadowMethods.includes(propKey.toString())) {
          return getTargetValue(shadowRoot, propKey) ?? getTargetValue(target, propKey);
        }
        return getTargetValue(target, propKey);
      },
      set(target, key, value) {
        return Reflect.set(target, key, value);
      }
    });
  }

  /**
   * 创建 window 代理
   */
  createProxyWindow() {
    const descriptorTargetMap = new Map<PropertyKey, 'target' | 'rawWindow'>();

    return new Proxy({}, {
      get: (target, key) => {
        // console.log('proxy get', key);
        if (key === '_zxj_is_micro') {
          return true;
        }
        // const has = Reflect.has(target, key);
        // console.log('proxy get', key, value);
        if (Reflect.has(target, key)) {
          return Reflect.get(target, key);
        }
        const newVal = getTargetValue(rawWindow, key);
        // console.log('proxy get', key, newVal);
        return newVal;
      },
      set: (target, key, value) => {
        if (!this.active) {
          return true;
        }
        //
        // console.log('proxy set', key, value);

        if (
          // target.hasOwnProperty has been rewritten
          !rawHasOwnProperty.call(target, key) &&
          rawHasOwnProperty.call(rawWindow, key)
        ) {
          const descriptor = Object.getOwnPropertyDescriptor(rawWindow, key);
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const {configurable, enumerable, writable, set} = descriptor!;
          // set value because it can be set
          rawDefineProperty(target, key, {
            value,
            configurable,
            enumerable,
            writable: writable ?? !!set,
          });

          this.injectedKeys.add(key);
        } else {
          Reflect.set(target, key, value);
          this.injectedKeys.add(key);
        }
        return true;
      },
      has: (target, key) => {
        return key in target || key in rawWindow;
      },
      getOwnPropertyDescriptor: (target, key) => {
        if (rawHasOwnProperty.call(target, key)) {
          descriptorTargetMap.set(key, 'target');
          return Object.getOwnPropertyDescriptor(target, key);
        }
        if (rawHasOwnProperty.call(rawWindow, key)) {
          descriptorTargetMap.set(key, 'rawWindow');
          const descriptor = Object.getOwnPropertyDescriptor(rawWindow, key);
          if (descriptor && !descriptor.configurable) {
            descriptor.configurable = true;
          }
          return descriptor;
        }

        return undefined;
      },
      // Object.defineProperty(window, key, Descriptor)
      defineProperty: (target, key, value): boolean => {
        const from = descriptorTargetMap.get(key);
        if (from === 'rawWindow') {
          return Reflect.defineProperty(rawWindow, key, value);
        }
        return Reflect.defineProperty(target, key, value);
      },
      // Object.getOwnPropertyNames(window)
      ownKeys: (target): Array<string | symbol> => {
        return unique(Reflect.ownKeys(rawWindow).concat(Reflect.ownKeys(target)));
      },
      deleteProperty: (target, key): boolean => {
        if (rawHasOwnProperty.call(target, key)) {
          this.injectedKeys.has(key) && this.injectedKeys.delete(key);
          // this.escapeKeys.has(key) && Reflect.deleteProperty(rawWindow, key)
          return Reflect.deleteProperty(target, key);
        }
        return true;
      },
    });
  }

  start() {
    if (this.active) {
      return;
    }
    this.active = true;
  }

  stop(umdMode?: boolean) {
    if (!this.active) {
      return;
    }
    if (!umdMode) {
      this.injectedKeys.forEach((key: PropertyKey) => {
        Reflect.deleteProperty(this.proxyWindow, key);
      });
      this.injectedKeys.clear();
    }

    this.active = false;
  }
}

export default IframeProxy;
