
import { fetchResource, getUrlHost, getUrl } from './utils';
import Sandbox from './sandbox';

function ZMicroApp() {
    
}

Object.assign(ZMicroApp.prototype, {
    // 解析HTML
    parseHtml(html) {
        const hrefReg = /href=["'][^"']+["']/g;
        const srcReg = /src=["'][^"']+["']/g;
        const scriptReg = /<script[^>]*>([^<]*)<\/script>/g;
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
        const scriptReg = /<script[^>]*>([^<]*)<\/script>/g;
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
        this.el.innerHTML = this.html;
    },
    init(name, url) {
        this.name = name;
        this.url = getUrl(url);
        this.html = '';
        this.host = '';
        this.el = null;
        this.code = [];
        this.links = [];
        // 沙箱
        this.sandbox = new Sandbox(name);
    },
    start(name, url) {
        this.init(name, url);
        fetchResource(this.url).then(html => {
            this.host = getUrlHost(this.url);
            this.html = this.parseHtml(html);
            this.insertHtml();
            const links = [];
            this.links.forEach(link => {
                links.push(fetchResource(link));
            })
            // 
            this.sandbox.start();
            Promise.all(links).then(scripts => {
                this.code.push(...scripts);
            }).then(() => {
                this.code.forEach(code => {
                    (0, eval)(this.sandbox.bindScope(code))
                })
            }).catch(err => {
                console.log(err)
            })
        }).catch((err) => {
            console.log(err);
        });
    },

    destroy() {
        this.sandbox.stop();
    }
})

export const MicroApp = ZMicroApp;