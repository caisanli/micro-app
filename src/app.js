
import { fetchResource, getUrlHost, getUrl } from './utils';
import { parseHtml, scopedCssStyle } from './utils/html';
import Sandbox from './sandbox/index.js';

function ZMicroApp() {
    
}

Object.assign(ZMicroApp.prototype, {
    // 解析HTML
    parseHtml(html) {
        // parseHtml(html, this);
        const hrefReg = /href=["'][^"']+["']/g;
        const srcReg = /src=["'][^"']+["']/g;
        const scriptReg = /<script(?:\s+[^>]*)?>(.*?)<\/script\s*>/g;
        html = html.replace(hrefReg, val => {
            const reg = /href=["']([^"']+)["']/g;
            const result = reg.exec(val);
            const address = result[1];
            return val.replace(address, `${this.host}${address}`);
        }).replace(scriptReg, val => {
            this.parseScript(val);
            return '';
        }).replace(srcReg, val => {
            const reg = /src=["']([^"']+)["']/g;
            const result = reg.exec(val);
            const address = result[1];
            return val.replace(address, `${this.host}${address}`);
        })
        return html;
    },
    // 解析script标签
    parseScript(val) {
        const srcReg = /src=["']([^"']+)["']/g;
        const scriptReg = /<script(?:\s+[^>]*)?>(.*?)<\/script\s*>/g;
        const result = srcReg.exec(val);
        // 内联script
        if(!result) {
            this.code.push(
                scriptReg.exec(val)[1]
            )
            return ;
        }
        const url = `${this.host}${result[1]}`;
        this.links.push(url);
    },
    insertHtml() {
        this.el = document.getElementById(`zxj_micro-${this.name}`);
        // const fr = document.createDocumentFragment();
        this.el.innerHTML = this.html;
    },
    init(name, url) {
        this.name = name;
        this.url = getUrl(url);
        this.html = '';
        this.host = getUrlHost(this.url);
        this.el = null;
        this.code = [];
        this.links = [];
        this.observer = null;
        // 沙箱
        this.sandbox = new Sandbox(name);
        this.parseSource(this.mount)
        
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
    parseSource(callback) {
        fetchResource(this.url).then(html => {
            this.html = this.parseHtml(html);
            const links = [];
            this.links.forEach(link => {
                links.push(fetchResource(link));
            })
            // 
            Promise.all(links).then(scripts => {
                this.code.push(...scripts);
            }).then(callback.bind(this)).catch(err => {
                console.log(err)
            })
        }).catch((err) => {
            console.log(err);
        });
    },
    mount() {
        window['_zxj_is_micro'] = true;
        // 监听head
        this.observerHead();
        this.insertHtml();
        this.sandbox.start();
        this.code.forEach(code => {
            code = this.sandbox.bindScope(code);
            Function(code)();
            // (0, eval)(this.sandbox.bindScope(code))
        })
    },
    destroy() {
        this.sandbox.stop();
        this.observer && this.observer.disconnect();
        window['_zxj_is_micro'] = false;
    }
})

export const MicroApp = ZMicroApp;