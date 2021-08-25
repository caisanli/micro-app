/**
 * 沙箱
 */
import eventInstance from './event';

class Sandbox {
    constructor(name) {
        // const iframe = document.createElement("iframe");
        // iframe.src="bl"
        this.name = name;
        this.microWindow = {evt: eventInstance};
        this.keys = {};
        this.active = false;
        window['_zxj_micro_' + name] = this.microWindow;
    }
    // 修改js作用域
    bindScope (code) {
        return `;(function(window, self){with(window){;${code}\n}}).call(window, window, window);`
    }
    start() {
        if(!this.active) {
            this.active = true;
        }
    }
    stop() {
        if(!this.active) return ;
        this.active = false;
        Object.keys(this.microWindow).forEach(key => {
            delete this.microWindow[key];
        })
    }
}

export default Sandbox;