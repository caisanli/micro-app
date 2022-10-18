/**
 * 创建Vue MicroApp组件
 */
import ZMicroApp from './app';
import cache, { global } from './utils/cache';
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

const NEED_UPDATE_SOURCE_MSG = 'Uncaught SyntaxError: Unexpected token \'<\'';

@Component
class MicroAppClass extends GreetingProps {

  app: ZMicroApp | null = null;

  bindGlobalEvent() {
    if (global.isBindGlobalEvent) return;
    global.isBindGlobalEvent = true;
    // 监听错误事件
    window.addEventListener('error', (e) => {
      if (!e) return ;
      if (e.message === NEED_UPDATE_SOURCE_MSG) {
        console.error(`执行 ${ e.filename } JavaScript文件失败，可能是文件地址发生了变化，需要重新刷新浏览器。`);
        confirmReload();
      } else if(
        e.message === undefined
        && (e.target as HTMLElement).nodeName === 'SCRIPT'
        && (e.target as HTMLScriptElement).type === 'module'
      ) {
        console.error(`执行 ${ (e.target as HTMLScriptElement).src } ESMODULE 失败，可能是文件地址发生了变化，需要重新刷新浏览器。`);
        confirmReload();
      }
    }, true);

    function confirmReload() {
      const is = confirm('当前系统代码有更新，请刷新页面');
      if (is) {
        window.location.reload();
      }
    }
  }

  mounted() {
    const { name, url, disableStyleSandbox, externalLinks, module, sandbox } = this;
    if(!name || !url) return ;
    this.bindGlobalEvent();
    // 从缓存中取子系统实例
    const app = cache[name];
    if (app) { // 存在实例，就挂载
      this.app = app;
      this.app.mount();
    } else { // 不存在实例，就初始化
      this.app = new ZMicroApp({
        name,
        url,
        disableStyleSandbox,
        externalLinks: externalLinks as string[],
        module,
        sandbox
      });
      cache[name] = this.app;
    }
  }

  // 兼容vue3
  beforeUnmount() {
    // 取消挂载
    this.app && this.app.unmount();
  }

  beforeDestroy() {
    // 取消挂载
    this.app && this.app.unmount();
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
