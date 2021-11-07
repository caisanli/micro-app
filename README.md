# 众信佳微前端方案
> 基于Vue组件方案，不支持其他框架

### 1、什么是微前端
----
首先微前端不是一种技术，是类似后端微服务的架构，它将微服务的理念应用于浏览器端，即将 Web 应用由单一的单体应用转变为多个小型前端应用聚合为一的应用。各个前端应用还可以独立运行、独立开发、独立部署。微前端不是单纯的前端框架或者工具，而是一套架构体系。
### 2、为什么使用
----
一句话：`交互性好及更新公共模块方便`
由于一开始采用的方案是`MPA`，主系统切换到子系统、子系统切换主系统会造成浏览器重刷，用户体验会存在断点。
还有就是目前用户中心2.0（主系统），会整合所有子系统的头部导航和消息通知。意思是，子系统的头部导航和消息通知都在主系统里，方便后续更新导航、消息通知模块的时候，只需要在主系统更新就行。
### 3、如何实现
----
实现逻辑是参考：[Micro App](https://zeroing.jd.com/micro-app/docs.html#/)
##### 3.1、前提
* 兼容IE10
* 子系统内容渲染
* 路由
* 沙箱隔离，各个系统的JS代码不冲突
* 样式隔离，各个系统的样式不冲突
* 消息通信，主系统和子系统相互通信
##### 3.2、兼容IE10
>为什么还有人要用IE？？？？

由于要兼容IE10以上，所以会抛弃目前一些常用的微前端方案：基于`Proxy`API的沙箱环境、`Web Components`自定义组件。

##### 3.3、内容渲染
> 基于Vue组件渲染子系统

实现大概逻辑：
1. 创建`MicroApp` Vue 组件，里面处理子系统渲染的所有逻辑(内容渲染、JS沙箱、样式隔离、事件处理)，并注册全局`components`组件。
   ```javascript
   /**
     * 创建Vue MicroApp组件
    */
    export default {
        name: 'MicroApp',
        data() {
            return {
                app: null // 子系统实例
            }
        },
        props: {
            name: { // 各个子系统唯一
                type: String,
                default: ''
            },
            url: { // 子系统入口文件地址（index.html地址）
                type: String,
                default: ''
            }
        },
        mounted() {
            const { name, url } = this;
            if(!name || !url) return ;
            // 从缓存中取子系统实例
            let app = cache[name];
            if(app) { // 存在实例，就挂载
                this.app = app;
                this.app.mount();
            } else { // 不存在实例，就初始化
                this.app = new MicroApp();
                cache[name] = this.app;
                this.app.init(name, url);
            }
        },
        beforeDestroy() {
            // 取消挂载
            this.app.unmount();
        },
        render(h) {
            var name = this.name;
            return h('div', {
                attrs: {  // 生成唯一属性
                    id: `zxj_micro-${name}`,
                    name: `zxj_micro_${name}`
                }
            })
        }
    }
   ```
2. 在主系统创建各个子系统的页面，作为路由页面，这里须用到`MicroApp`组件。
   ```javascript
   <template>
        <!-- 针对子系统的布局组件 -->
        <micro-layout>
            <!-- name：唯一值，url：index.html入口访问地址，会自动添加域名地址 -->
            <micro-app name="alioms" url="/alioms" />
        </micro-layout>
    </template>

    <script>
        import { MicroLayout } from '@/layouts';
        export default {
            components: {
                MicroLayout
            }
        };
    </script>
   ```
3. 创建所有子系统路由配置文件，用于动态注册路由。
   ```javascript
   /**
     * 记录所有子系统
    */
    export default [{
        path: '/alioms/*',
        name: 'alioms',
        component: () => import(/* webpackChunkName: "alioms" */ '@/views/sub/alioms.vue')
    }]
   ```
4. 根据角色权限注册对应子系统的路由，这样就由主系统的路由控制对应子系统显示。
    <!-- 子系统HTML内容渲染，主要是根据入口文件(`index.html`)的位置，获取html内容，并 -->

    ```javascript
    
    import { fetchResource, getUrlOrigin, getUrl, requestHostCallback } from './utils';
    import { parseHtml, scopedCssStyle, getPrefetchSource } from './utils/html';
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
                fragment.appendChild(node)
            })
            this.el.appendChild(fragment);
        }
        /**
        * 监听head元素，
        * 如果有新的style元素添加就设置css作用域
        * 也处理动态script
        */
        observerHeadFn() {
            const head = document.querySelector('head');
            const config = { attributes: false, childList: true, subtree: false };
            const callback = (mutationsList) => {
                [...mutationsList].forEach(mutation => {
                    if (mutation.type !== 'childList') {
                        return ;
                    }
                    if(!mutation.addedNodes || !mutation.addedNodes.length) {
                        return ;
                    }
                    [...mutation.addedNodes].forEach(node => {
                        const nodeName = node.nodeName;
                        if(nodeName !== 'STYLE' && nodeName !== 'SCRIPT') {
                            return ;
                        }
                        const id = Math.round((Math.random() * 1000)) + '-' + Date.now();
                        node.id = id;
                        switch(nodeName) {
                            case 'STYLE':
                                this.headAddStyleIds.push(id);
                                scopedCssStyle(node, this);
                                break;
                            case 'SCRIPT':
                                this.headAddStyleIds.push(id);
                                break;
                        }
                        
                    })
                })
            };
            const observer = new _JsMutationObserver(callback);
            observer.observe(head, config);
            this.observerHead = observer;
        }
        /**
        * 监听Body元素
        * 只监听当前body下的子级（不是子子级）增删变化
        * 如果有新增元素就设置name属性'_zxj_micro_' + name
        */
        observerBodyFn() {
            const body = document.querySelector('body');
            const config = { attributes: false, childList: true, subtree: false };
            const callback = (mutationsList) => {
                [...mutationsList].forEach(item => {
                    item.addedNodes.forEach(node => {
                        const nodeName = node.nodeName;
                        if(nodeName === 'STYLE' || nodeName === 'IFRAME') return ;
                        node.setAttribute('name', 'zxj_micro_' + this.name);
                    })
                })
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
            fetchResource(this.url).then(html => {
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
                this.mount();
                requestHostCallback(getPrefetchSource.bind(null, this));
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
        * @param {*} name 唯一值
        * @param {*} url 入口文件
        */
        init(name, url) {
            this.status = 'init';
            this.name = name;
            this.url = getUrl(url);
            this.container = null;
            this.origin = getUrlOrigin(this.url);
            this.el = null;
            // 记录在head标签中动态添加的style、script
            this.headAddStyleIds = [];
            // 用于css、javascript资源请求计数
            this.fetchCount = 0;
            // 存放JavaScript代码
            this.scriptCodes = [];
            // 统一设置作用域名称
            this.scopedName = `zxj_micro_` + name;
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
            // 预加载script代码
            this.prefetchScripts = [];
            // 预加载css样式代码
            this.prefetchStyles = [];
            // 预加载资源
            this.prefetchSource = [];
            // 沙箱
            this.sandbox = new Sandbox(name);
            // 处理入口文件
            this.parseEntry(this.mount);
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
                })
            } catch (error) {
                console.log(error)
            }
        }
        /**
        * 执行JavaScript代码
        */
        execScript(scriptCodes) {
            try {
                scriptCodes.forEach(code => {
                    code = this.sandbox.bindScope(code);
                    Function(code)();
                    // (0, eval)(this.sandbox.bindScope(code))
                })
            } catch (error) {
                console.log(error);
            }
        }
        /**
        * 清空head标签动态添加的style、script标签
        */
        clearHeadStyle() {
            const head = document.querySelector('head');
            this.headAddStyleIds.forEach(id => {
                head.removeChild(document.getElementById(id))
            })
            this.headAddStyleIds = [];
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
            // 监听head
            this.observerHeadFn();

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
                    this.sandbox.sideEffect.evt.dispatch('mount');
                    if(!prevStatusIsInit) {
                        this.execPrefetchCode();
                    }
                    // 监听body
                    this.observerBodyFn();
                } catch (error) {
                    console.log(error)
                }
            }, 0);
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
            // 触发unmount事件
            this.sandbox.sideEffect.evt.dispatch('unmount');
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
    ```
##### 3.4、沙箱隔离
> 沙箱隔离是保证各个系统之间的JS代码不冲突。

目前采用的沙箱隔离方式是`Diff`沙箱，大概原理就是：在进入子系统的时候，将`window`上的属性拷贝一份，生成一份`快照`，在离开子系统的时候，对比`快照`和目前的`window`上的属性，并还原`window`。
但是采用`Diff`沙箱，只能支持单个子系统存在，不然子系统之间可能会代码冲突。不过，目前`用户中心2.0`同时只会存在一个子系统，可适用该方案。

`Diff`沙箱代码核心逻辑：
```javascript
/**
 * 基于Diff沙箱
 */
class DiffSandbox {
  constructor() {
    this.active = false; // 沙箱状态
    this.modifyMap = {} // 存放修改的属性
    this.windowSnapshot = {} // windows的快照
    // this.proxyWindow = window;
  }
  start() {
    if(this.active) {
        return ;
    }
    this.active = true;
    // 缓存window对象上的属性
    this.windowSnapshot = {}
    for (const item in window) {
      this.windowSnapshot[item] = window[item]
    }
    // 还原上次改动的属性
    Object.keys(this.modifyMap).forEach((p) => {
      window[p] = this.modifyMap[p]
    })
  }
  stop() {
    if(!this.active) {
        return ;
    }
    this.active = false;
    // 还原window的属性
    for (const item in window) {
      if (this.windowSnapshot[item] !== window[item]) {
        // 记录变更的属性
        this.modifyMap[item] = window[item]
        // 还原window
        if(item === '0') continue;
        window[item] = this.windowSnapshot[item]
      }
    }
  }
}
```

沙箱创建逻辑，包括JS沙箱及副作用处理：
```javascript
/**
 * 沙箱
 */

import DiffSandbox from './diff';
import SideEffect from './sideEffect';
// import ProxSandbox from './proxySandbox';
class Sandbox {
  constructor(name) {
    // this.supportProxy = !!window.Proxy
    // if(this.supportProxy) {
    //     this.proxyWindow = new ProxSandbox()
    // } else {
    //     this.proxyWindow = new DiffSandbox()
    // }
    this.id = '_zxj_micro_' + name;
    this.name = name;
    // 副作用处理
    this.sideEffect = new SideEffect(window);
    // 沙箱实例
    this.proxyWindow = new DiffSandbox();
    this.active = false;
  }
  // 修改js作用域
  bindScope(code) {
    return `;(function(window, self){with(window){;${code}\n}}).call(window, window, window);`;
  }
  // 开启沙箱
  start() {
    if (this.active) return;
    this.active = true;
    // 每个子系统独有副作用处理
    window[this.id] = this.sideEffect;
    // 先启副作用
    this.sideEffect.start();
    // 再启沙箱
    this.proxyWindow.start();
  }
  // 关闭沙箱
  stop() {
    if (!this.active) return;
    this.active = false;
    delete window[this.id];
    // 先停止沙箱
    this.proxyWindow.stop();
    // 再清副作用
    this.sideEffect.clear();
  }
}

export default Sandbox

```

由于目前我们的项目都是采用`vueCli`打包，每个系统默认打包的包名都为`jsonpFunction`，在加载系统的时候会导致加载资源出错，如组件无法找到...。目前的方案就是，更改`vue.config.js`中的`webpack`配置，给每个子应用设置一个单独的名称。
```javascript
module.exports = {
  //其它代码
  configureWebpack: {
    //其它代码
    output: {
        jsonpFunction: `${子系统前缀}JsonpFunction`,
    }
  }
  
}
```
##### 3.5、样式隔离
> 样式隔离保证子系统的样式不会影响其它系统和主系统。

样式隔离主要逻辑：
1. 首先为子系统的容器设置一个独有`name`属性，生成逻辑为`zxj_micro_子系统前缀`。
2. 拿到子系统`link`标签中的`css`链接，请求该链接，拿到`样式`代码，并在每个`选择器`前加上一层`[name="zxj_micro_子系统前缀"]`选择器。
3. 如果是动态生成的`style`标签，就需要使用`MutationObserver`API监听`head`元素中元素改变，并设置`style`标签的样式，在每个`选择器`前加上一层`[name="zxj_micro_子系统前缀"]`选择器。
   
样式隔离的核心代码：
```javascript
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
```
##### 3.6、副作用处理
> 副作用处理包括系统之间通信、及对子系统副作用代理

1. 系统之间相互通信，目前是实现了一套全局共享的事件发布订阅系统。
   ```javascript
   
    /**
    * 事件处理器
    */
    class Event {
        /**
        * 事件记录
        */
        event = {};
        /**
        * 事件绑定
        * @param {*} name 事件名称
        * @param {*} callback 事件回调
        * @returns 
        */
        on(name, callback) {
            if(!name || typeof callback !== 'function')
            return ;
            if(this.event[name]) {
                this.event[name].push(callback);
            } else {
                this.event[name] = [callback];
            }
        }
        /**
        * 取消事件绑定
        * @param {*} name 事件名称 
        * @param {*} callback 事件回调
        */
        off(name, callback) {
            if(callback) {
                this.event[name] = this.event[name].filter(fn => fn !== callback);
            } else {
                this.event[name] = [];
            }
        }
        /**
        * 触发事件
        * @param {*} name 事件名称
        * @param {*} data 数据
        */
        dispatch(name, data) {
            const callbackList = this.event[name];
            if(Array.isArray(callbackList)) {
                callbackList.forEach(callback => callback(data));
            }
        }
        /**
        * 清空事件
        */
        clear() {
            Object.keys(this.event).forEach(key => {
                this.off(key);
            })
        }
    }
    /**
    * 生成全局事件实例
    * 主系统和子系统共用
    */
    const newEvent = new Event();

    export default newEvent;


    /**
    * 主系统事件处理
    */
    class BaseAppEvent {
        setData(data) {
            newEvent.dispatch('data', data);
        }
        onData(callback) {
            newEvent.on('data', callback);
        }
        on(key, callback) {
            newEvent.on(key, callback);
        }
        dispatch(key, data) {
            newEvent.dispatch(key, data);
        } 
    }

    export const baseAppEvent = new BaseAppEvent();

   ```
2. 子系统副作用处理，包括每个子系统有个独立的事件通信机制及原生副作用的拦截处理
   ```javascript
    import eventInstance from './event'
    const addEventListener = window.addEventListener;
    const removeEventListener = window.removeEventListener;
    const cloneSetInterval = window.setInterval;
    const cloneClearInterval = window.clearInterval;
    // const defaultEvt = { on: () => {}, dispatch: () => {}, clear: () => {}, off: () => {} };
    /**
    * 子系统副作用处理
    * 原生addEventListener、removeEventListener、setInterval、clearInterval拦截代理
    * 自定义事件处理器
    */
    class SideEffect {
        constructor(proxyWindow) {
            // 代理的环境
            this.proxyWindow = proxyWindow;
            // 自定义事件处理器
            this.evt = {};
            // 记录绑定自定义事件
            this.evtListenerTypes = {};
            // 记录绑定事件
            this.listeners = {};
            // 记录定时器
            this.intervalTimers = [];
        }
        start() {
            const _this = this;
            // 代理原生addEventListener
            this.proxyWindow.addEventListener = function(type, listener, options) {
                const newListener = {
                    listener,
                    options
                }
                if(_this.listeners[type]) {
                    _this.listeners[type].push(newListener)
                } else {
                    _this.listeners[type] = [newListener];
                }
                addEventListener.call(this, type, listener, options);
            }
            // 代理原生removeEventListener
            this.proxyWindow.removeEventListener = function(type, listener, options){
                const listeners = _this.listeners[type];
                if(listeners && listener) {
                    _this.listeners[type] = listeners.filter(item => listener !== item.listener);
                }
                removeEventListener.call(this, type, listener, options);
            }
            // 代理原生setInterval
            this.proxyWindow.setInterval = function(...args) {
                const intervalID = cloneSetInterval.call(this, ...args);
                _this.intervalTimers.push(intervalID);
                return intervalID;
            }
            // 代理原生clearInterval
            this.proxyWindow.clearInterval = function(intervalID) {
                _this.intervalTimers = _this.intervalTimers.filter(id => id !== intervalID);
                return cloneClearInterval.call(this, intervalID);
            }
            // 事件处理器
            this.evt = { 
                on: (key, listener) => {
                    this.evtListenerTypes[key] = 1;
                    eventInstance.on(key, listener);
                }, 
                dispatch: (...args) => {
                    eventInstance.dispatch(...args);
                }, 
                off: (...args) => {
                    eventInstance.off(...args);
                },
                clear: () => {
                    Object.keys(this.evtListenerTypes).forEach(key => {
                        eventInstance.off(key);
                    })
                    this.evtListenerTypes = {};
                } 
            };
        }
        /**
        * 清空代理事件及自定义事件
        */
        clear() {
            // 清空事件处理器
            this.evt.clear();
            Object.keys(this.listeners).forEach(key => {
                const listeners = this.listeners[key];
                listeners.forEach(item => {
                    removeEventListener.call(null, key, item.listener, item.options);
                })
            })
            this.listeners = {};
            this.intervalTimers.forEach(intervalID => {
                cloneClearInterval.call(null, intervalID);
            })
            this.intervalTimers = [];
            this.proxyWindow.setInterval = cloneSetInterval;
            this.proxyWindow.clearInterval = cloneClearInterval;
            this.proxyWindow.addEventListener = addEventListener;
            this.proxyWindow.removeEventListener = removeEventListener;
        }
    }

    export default SideEffect;
   ```
   
#### 3.7、路由处理
路由处理是直接使用`VueRouter`控制，未做单独处理，目前主、子系统的路由模式都是`hash`，也可以弄成`history`模式，但是会有点麻烦，运维做处理、前端也需要做处理（想了想，好像用`history`的代价要低一点，就不会去在子系统的路由加什么前缀了）。
由于`hash`模式不能设置`base`(基础路径)，所以子系统的路由配置都需要在已有路由配置套一层`系统前缀`路由，由于目前路由`path`配置都建议写成`绝对路径`，所以`path`都需要加上`/系统前缀`：
```javascript
// 微前端时需要在外面加一层路由
const newRouters = [{
    path: defaultSettings.prefix + '/*', // 必须加 "/*"
    meta: { title: defaultSettings.title },
    component: BlankLayout,
    redirect: routers[0].path, // 默认重定向到第一个
    children: routers // 原本路由
}];
```
不过现在已有系统、PC模板在处理动态路由的时候都默认加上了前缀，所以后续新系统给后端的路由配置都不需要加前缀：
```javascript
/**
 * 格式化树形结构数据 生成 vue-router 层级路由表
 * @param routerMap
 * @param parent
 * @returns {*}
 */
export const generator = (routerMap, permisssions, parent) => {
    return routerMap.map(item => {
        const currentRouter = {
            // 如果路由设置了 path，没有给404
            path: item.path ? `${defaultSettings.prefix}${item.path}` : '/404',
            // 其它代码
            // ...
        };
        // 子菜单，递归处理
        if (item.children && item.children.length > 0) {
            // 重定向
            item.redirect && (currentRouter.redirect = defaultSettings.prefix + item.redirect);
        }
        return currentRouter;
    });
};
```
以及在进行页面跳转的时候，也不需要加上前缀，因为这里对`VueRouter`的`push`方法做了代理，如果不存在前缀就默认加上前缀：
```javascript
// hack router push callback
const originalPush = Router.prototype.push;
Router.prototype.push = function push (location, onResolve, onReject) {
    // 由于采用微前端且主系统采用的hash路由
    // 所以需要在子系统的路由上再套一层路由，path为`/系统前缀/`如：'/infoget/'
    // 且每个路由的path也会加上这个前缀，如'/infoget/other'
    // 为了兼容以前的老代码，所以做了跳转拦截，如果当前path不存在前缀，就加上这个前缀
    if (typeof location === 'string') {
        if (!location.startsWith(defaultSettings.prefix)) {
            location = defaultSettings.prefix + location;
        }
    } else if (location.path && !location.path.startsWith(defaultSettings.prefix)) {
        location.path = defaultSettings.prefix + location.path;
    }

    if (onResolve || onReject) return originalPush.call(this, location, onResolve, onReject);

    return originalPush.call(this, location).catch(err => err);
};
```
注意：由于在主系统注册子系统路由的时候，`path`都会设置成`/系统前缀/*`，这样是为了匹配所有`/系统前缀/`下的路由，也是子系统张中路由切换的必要条件，所以主系统中就要避免`/系统前缀/other`这样的`path`，现在UAA已经出现了这样的问题。
### 4、需要优化的地方
----
* 目前加载每一次子系统，内存就增加，而且是递增的，虽然生产环境上不会出什么大问题，也不可能有人有全系统，就算有也不可能每个子系统都去点一次。
* 其它域的远程资源的处理
### 5、需要注意
----
* 其它域的远程资源未处理，加载资源会存在跨域，如使用`百度地图`，到时候需要使用的时候再处理，有两种办法：
  * 运维配置跨域域名，尽量还是不要麻烦运维。
  * 框架配置忽略域名，以`script`标签加载。（后面去验证下）
* 在使用IE的时候，子系统使用的`zxj-ui`框架的一些组件传参和默认值失效，但是`智能机器人`系统就是正常的，还不知道原因，目前发现有问题的组件：`Modal`、`Menu`、`Rate`。
* 子系统的资源引用尽量使用`绝对路径`，虽然框架已经处理了`backgroundImage`、`font-face`引用相对路径资源。
* 虽然做了样式隔离，但是主系统的样式还是会影响子系统，主、子系统都要做好样式处理，尽量别写全局样式，特别是修改`zxj-ui`组件的样式时。

#### 5、操作入口文件的代码
----

```javascript
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
 * 获取预加载资源
 * @param {*} app 
 */
export function getPrefetchSource(app) {
    const source = app.prefetchSource;
    const jsList = [], cssList = [];
    source.forEach(item => {
        const { type, href } = item;
        switch(type) {
            case 'css':
                cssList.push(setRemoteCssScoped(href, app));
                break;
            case 'js':
                jsList.push(fetchResource(href));
                break;
        }
    })
    Promise.all(jsList).then(scripts => {
        app.prefetchScripts = scripts;
        app.loadPrefetchCode();
    });
    Promise.all(cssList).then(styles => {
        app.prefetchStyles = styles;
        app.loadPrefetchCode();
    });
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
 * 获取远程JavaScript
 * @param {*} app 应用实例
 */
function getScript(app) {
    const scripts = app.scripts;
    const list = [];
    scripts.forEach(item => {
        if(item.href) {
            list.push(fetchResource(item.href));
        } else {
            list.push(item.code)
        }
    })
    Promise.all(list).then(codes => {
        app.scriptCodes = codes;
        app.loadCode();
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
    [...element.childNodes].forEach(child => {
        const nodeName = child.nodeName;
        switch(nodeName) {
            case 'META':
            case 'TITLE':
                break;
            case 'STYLE':
                parseStyle(element, child, app);
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
        const newSrc = getAbsoluteHref(src, app.origin);
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
    const as = node.getAttribute('as');
    // const type = node.getAttribute('type');
    const newHref = getAbsoluteHref(href, app.origin); // getUrlOrigin(href) ? href : `${app.origin}${href.startsWith('/') ? href: '/' + href}`;
    
    if(href && rel === 'stylesheet') { // 外部链接
        app.links.push({
            href: newHref,
            code: ''
        });
        const comment = document.createComment(`<link href="${newHref}" rel="stylesheet" />`);
        parentNode.insertBefore(comment, node);
        parentNode.removeChild(node);
    } else if (!as && rel === 'prefetch') { // 处理空闲时间加载的资源
        const comment = document.createComment(`<link href="${newHref}" rel="prefetch" />`);
        const result = /\.(js|css)$/.exec(newHref);
        if(!result) {
            node.setAttribute('href', newHref);
        } else {
            const type = result[1];
            app.prefetchSource.push({
                type,
                href: newHref
            })
            parentNode.insertBefore(comment, node);
            parentNode.removeChild(node);
        }
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
```