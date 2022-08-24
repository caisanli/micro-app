/**
 * 创建Vue MicroApp组件
 */
// import type { MicroApp } from '@zxj/micro';
import ZMicroApp from './app';
import cache from './utils/cache';
import Vue from 'vue';
import type { CreateElement, VNode } from 'vue';
import Component from 'vue-class-component';

const GreetingProps = Vue.extend({
  props: {
    name: String, // 全局唯一,
    url: String, // 子系统入口文件地址（index.html）
    disableStyleSandbox: Boolean, // 是否禁用样式沙箱 默认值（true）
    externalLinks: Array, // externalLinks 外部链接不处理
    module: Boolean // 是否支持 module
  }
});

@Component
class MicroAppClass extends GreetingProps {

  app: ZMicroApp;

  mounted() {
    const { name, url, disableStyleSandbox, externalLinks, module } = this;
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
        module
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
