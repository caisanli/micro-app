import eventInstance from './event'
const addEventListener = window.addEventListener;
const removeEventListener = window.removeEventListener;
const defaultEvt = { on: () => {}, dispatch: () => {}, clear: () => {}, off: () => {} };
class SideEffect {
    constructor(proxyWindow) {
        this.proxyWindow = proxyWindow;
        this.evt = {...defaultEvt};
        this.listeners = {};
        this.evtListenerTypes = {};
    }
    start() {
        const _this = this;
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
        this.proxyWindow.removeEventListener = function(type, listener, options){
            const listeners = _this.listeners[type];
            if(listeners && listener) {
                _this.listeners[type] = listeners.filter(item => listener !== item.listener);
            }
            removeEventListener.call(this, type, listener, options);
        }
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
    clear() {
        this.evt.clear();
        this.evt = {...defaultEvt};
        Object.keys(this.listeners).forEach(key => {
            const listeners = this.listeners[key];
            listeners.forEach(item => {
                removeEventListener(key, item.listener, item.options);
            })
        })
        this.proxyWindow.addEventListener = addEventListener;
        this.proxyWindow.removeEventListener = removeEventListener;
    }
}

export default SideEffect;