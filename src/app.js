
import { fetchResource, getUrlHost, getUrl } from './utils';
import { parseHtml, scopedCssStyle } from './utils/html';
import Sandbox from './sandbox/index.js';

class ZMicroApp {
    /**
     * 插入子系统html内容
     */
    insertHtml() {
        this.el = document.getElementById(`zxj_micro-${this.name}`);
        const fragment = document.createDocumentFragment();
        const cloneContainer = this.container.cloneNode(true);
        cloneContainer.childNodes.forEach(node => {
            fragment.appendChild(node)
        })
        this.el.appendChild(fragment);
    }
    /**
     * 监听head元素，
     * 如果有新的style元素添加就设置css作用域
     * 目前使用MutationObserver，未兼容IE10
     */
    observerHead() {
        const head = document.querySelector('head');
        const config = { attributes: false, childList: true, subtree: false };
        const callback = (mutationsList) => {
            // Use traditional 'for loops' for IE 11
            [...mutationsList].forEach(mutation => {
                if (mutation.type !== 'childList') {
                    return ;
                }
                if(!mutation.addedNodes || !mutation.addedNodes.length) {
                    return ;
                }
                [...mutation.addedNodes].forEach(node => {
                    if(node.nodeName !== 'STYLE') return ;
                    scopedCssStyle(node, this.name)
                })
            })
        };
        const observer = new MutationObserver(callback);
        observer.observe(head, config);
        this.observer = observer;
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
    execCode() {
        if(++this.fetchCount >= 2) {
            this.mount();
        }
    }
    /**
     * 初始化
     * @param {*} name 唯一值
     * @param {*} url 入口文件
     */
    init(name, url) {
        this.name = name;
        this.url = getUrl(url);
        this.container = null;
        this.host = getUrlHost(this.url);
        this.el = null;
        // 用于css、javascript资源请求计数
        this.fetchCount = 0;
        // 存放JavaScript代码
        this.scriptCodes = [];
        // 存放css代码
        this.styleCodes = [];
        // 存放css样式的远程地址、内联代码
        this.links = [];
        // 存放JavaScript的远程地址、内联代码
        this.scripts = [];
        // MutationObserver实例
        this.observer = null;
        // 沙箱
        this.sandbox = new Sandbox(name);
        // 处理入口文件
        this.parseEntry(this.mount);

    }
    /**
     * 执行css代码
     */
    execStyle() {
        (new Promise((resolve) => {
            const firstChild = this.el.firstChild;
            this.styleCodes.forEach(code => {
                const style = document.createElement('style');
                style.textContent = code;
                this.el.insertBefore(style, firstChild);
            })
            resolve();
        })).catch(err => {
            console.log(err)
        })
    }
    /**
     * 执行JavaScript代码
     */
    execScript() {
        (new Promise((resolve) => {
            this.scriptCodes.forEach(code => {
                code = this.sandbox.bindScope(code);
                Function(code)();
                // (0, eval)(this.sandbox.bindScope(code))
            })
            resolve();
        })).catch(err => {
            console.log(err)
        })
    }
    /**
     * 挂载
     */
    mount() {
        window['_zxj_is_micro'] = true;
        // 监听head
        this.observerHead();
        this.insertHtml();
        this.sandbox.start();
        this.execStyle();
        this.execScript();
    }
    /**
     * 取消挂载
     */
    unmount() {
        this.sandbox.stop();
        this.observer && this.observer.disconnect();
        window['_zxj_is_micro'] = false;
    }
}

export const MicroApp = ZMicroApp;