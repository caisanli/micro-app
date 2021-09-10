/**
 * 创建Vue MicroApp组件
 */
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
        url: { // 子系统入口地址
            type: String,
            default: ''
        }
    },
    mounted() {
        const { name, url } = this;
        if(!name || !url) return ;
        // 从缓存中取子系统实例
        let app = cache[name];
        if(app) { // 存在实例，就挂载
            this.app = app;
            this.app.mount();
        } else { // 不存在实例，就初始化
            this.app = new MicroApp();
            cache[name] = this.app;
            this.app.init(name, url);
        }
    },
    beforeDestroy() {
        // 取消挂载
        this.app.unmount();
    },
    render(h) {
        var name = this.name;
        return h('div', {
            attrs: {  // 生成唯一属性
                id: `zxj_micro-${name}`,
                name: `zxj_micro_${name}`
            }
        })
    }
}