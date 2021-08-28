import eventInstance from './event'
const addEventListener = EventTarget.prototype.addEventListener;
const removeEventListener = EventTarget.prototype.removeEventListener;
class SideEffect {
    constructor() {
        this.evt = { }
        this.listeners = {};
    }
    start() {
        EventTarget.prototype.addEventListener = (type, listener, options) => {
            const newListener = {
                listener,
                options
            }
            console.log('时间类型：', type)
            if(this.listeners[type]) {
                this.listeners[type].push(newListener)
            } else {
                this.listeners[type] = [newListener];
            }
            addEventListener(type, listener, options);
        }
        EventTarget.prototype.removeEventListener = (type, listener, options) => {
            const listeners = this.listeners[type];
            if(listeners && listener) {
                this.listeners[type] = listeners.filter(item => listener !== item.listener);
            }
            removeEventListener(type, listener, options);
        }
        this.evt.eventInstance = eventInstance;
    }
    clear() {
        this.evt.eventInstance.clear();
        this.evt = { }
        Object.keys(this.listeners).forEach(key => {
            const listeners = this.listeners[key];
            listeners.forEach(item => {
                removeEventListener(key, item.listener, item.options);
            })
        })
        EventTarget.prototype.addEventListener = addEventListener;
        EventTarget.prototype.removeEventListener = removeEventListener;
    }
}

export default SideEffect;