import { MicroApp } from './app';
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
        const app = new MicroApp();
        this.app = app;
        app.start(name, url);
    },
    beforeDestroy: function beforeDestroy() {
        this.app.destroy();
    },
    render(h) {
        var name = this.name;
        return h('div', {
            // attribute
            attrs: {
                id: `zxj_micro-${name}`
            }
        })
    }
}