
import { fetchResource, getUrlHost, getUrl } from './utils';
import { parseHtml, scopedCssStyle } from './utils/html';
import Sandbox from './sandbox/index.js';

function ZMicroApp() {
    
}

Object.assign(ZMicroApp.prototype, {
    insertHtml() {
        this.el = document.getElementById(`zxj_micro-${this.name}`);
        const fragment = document.createDocumentFragment();
        const cloneContainer = this.container.cloneNode(true);
        cloneContainer.childNodes.forEach(node => {
            fragment.appendChild(node)
        })
        this.el.appendChild(fragment);
    },
    
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
    },

    // 解析入口文件
    parseEntry() {
        fetchResource(this.url).then(html => {
            this.container = parseHtml(html, this);
            this.insertHtml();
        }).catch((err) => {
            console.log(err);
        });
    },
    execCode() {
        if(++this.fetchCount >= 2) {
            this.mount();
        }
    },
    init(name, url) {
        this.name = name;
        this.url = getUrl(url);
        this.container = null;
        this.host = getUrlHost(this.url);
        this.el = null;
        this.fetchCount = 0;
        this.scriptCodes = [];
        this.styleCodes = [];
        this.links = [];
        this.scripts = [];
        this.observer = null;
        // 沙箱
        this.sandbox = new Sandbox(name);
        this.parseEntry(this.mount)
    },
    mount() {
        window['_zxj_is_micro'] = true;
        // 监听head
        this.observerHead();
        this.insertHtml();
        this.sandbox.start();
        this.execStyle();
        this.execScript();
    },
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
    },
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
    },
    destroy() {
        this.sandbox.stop();
        this.observer && this.observer.disconnect();
        window['_zxj_is_micro'] = false;
    }
})

export const MicroApp = ZMicroApp;