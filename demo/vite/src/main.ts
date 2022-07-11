import { createApp, App as VueApp } from 'vue';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';

const microEffect: MicroSideEffect | undefined = window['_zxj_micro_vite'];

function createVueApp(): VueApp {
  const app:VueApp = createApp(App);
  app.use(router);
  app.use(createPinia())
  app.mount('#vite');
  return app;
}

const isMicro:boolean = window['_zxj_is_micro'] || false;

if (isMicro && microEffect) {
  let app:VueApp;
  
  // 当所有module都加载完后
  microEffect.evt.on('module-mount', () => {
    console.log('module-mount');
    app = createVueApp();
  });
  // 因为当触发mount事件时，module还没加载完成
  microEffect.evt.on('mount', () => {
    console.log('mount');
  });
  // 卸载
  microEffect.evt.on('unmount', () => {
    app.unmount();
  });
} else {
  createVueApp();
}
