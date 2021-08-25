function Event() {
    this.event = {};
}

Object.assign(Event.prototype, {
    on(name, callback) {
        if(!name || typeof callback !== 'function')
         return ;
        if(this.event[name]) {
            this.event[name].push(callback);
        } else {
            this.event[name] = [callback];
        }
    },
    off(name, callback) {
        if(callback) {
            this.event[name] = this.event[name].filter(fn => fn !== callback);
        } else {
            this.event[name] = [];
        }
    },
    dispatch(name, data) {
        const callbackList = this.event[name];
        if(Array.isArray(callbackList)) {
            callbackList.forEach(callback => callback(data));
        }
    },
    clear() {
        Object.keys(this.event).forEach(key => {
            this.off(key);
        })
    }
})

const newEvent = new Event();

export default newEvent;

function BaseAppEvent() {}

Object.assign(BaseAppEvent.prototype, {
    setData(data) {
        newEvent.dispatch('data', data);
    },
    onData(callback) {
        newEvent.on('data', callback);
    },
    on(key, callback) {
        newEvent.on(key, callback);
    },
    dispatch(key, data) {
        newEvent.dispatch(key, data);
    } 
})

export const baseAppEvent = new BaseAppEvent();
