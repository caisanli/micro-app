import { MicroApp } from './app';
import cache from './utils/cache';
export default {
    name: 'MicroApp',
    data: function data() {
        return {
            children: '',
            app: null
        }
    },
    props: {
        name: { // 全局唯一
            type: String,
            default: ''
        },
        url: { // index.html地址
            type: String,
            default: ''
        }
    },
    mounted() {
        const { name, url } = this;
        if(!name || !url) return ;
        let app = cache[name];
        if(app) {
            this.app = app;
            this.app.mount();
        } else {
            this.app = new MicroApp();
            cache[name] = this.app;
            this.app.init(name, url);
        }
    },
    beforeDestroy() {
        this.app.destroy();
    },
    render(h) {
        var name = this.name;
        return h('div', {
            // attribute
            attrs: {
                id: `zxj_micro-${name}`,
                name: `zxj_micro_${name}`
            }
        })
    }
}