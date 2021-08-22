import { MicroApp } from './index';
export default {
    name: 'MicroApp',
    data() {
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
        const app = new MicroApp(name, url);
        this.app = app;
        app.start();
    },
    render(h) {
        const { name } = this;
        return h('div', {
            // attribute
            attrs: {
                id: `zxj_micro-${name}`
            }
        })
    }
}