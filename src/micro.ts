/**
 * 创建Vue MicroApp组件
 */
import ZMicroApp from './app';
import cache from './utils/cache';
import Vue from 'vue';
import type { CreateElement, VNode } from 'vue';
import Component from 'vue-class-component';

const GreetingProps = Vue.extend({
  props: {
    // 全局唯一
    name: String,
    // 子系统入口文件地址（index.html）
    url: String,
    // 是否禁用样式沙箱 默认值（true）
    disableStyleSandbox: Boolean,
    // externalLinks 外部链接不处理
    externalLinks: Array,
    // 是否支持 module
    module: Boolean,
    // 是否开启沙箱 默认 false
    sandbox: Boolean
  }
});

@Component
class MicroAppClass extends GreetingProps {

  app: ZMicroApp;

  mounted() {
    const { name, url, disableStyleSandbox, externalLinks, module, sandbox } = this;
    if(!name || !url) return ;
    // 从缓存中取子系统实例
    const app = cache[name];
    if (app) { // 存在实例，就挂载
      this.app = app;
      this.app.mount();
    } else { // 不存在实例，就初始化
      this.app = new ZMicroApp();
      cache[name] = this.app;
      this.app.init({
        name,
        url,
        disableStyleSandbox,
        externalLinks: externalLinks as string[],
        module,
        sandbox
      });
    }
  }

  // 兼容vue3
  beforeUnmount() {
    // 取消挂载
    this.app.unmount();
  }

  beforeDestroy() {
    // 取消挂载
    this.app.unmount();
  }

  render(h: CreateElement):VNode {
    const name = this.name;
    return h('div', {
      attrs: {  // 生成唯一属性
        id: `zxj_micro-${name}`,
        name: `zxj_micro_${name}`
      }
    });
  }
}

export default MicroAppClass;
