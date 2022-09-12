import { createApp, App as VueApp } from 'vue';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';

const microEffect: MicroSideEffect | undefined = window['_zxj_micro_vite'];

function createVueApp(): VueApp {
  const app:VueApp = createApp(App);
  app.use(router);
  app.use(createPinia());
  console.log('root dom：', document.getElementById('vite'));
  app.mount('#vite');
  return app;
}

const isMicro:boolean = window['_zxj_is_micro'] || false;
console.log('isMicro：', isMicro);
if (isMicro && microEffect) {
  let app:VueApp;
  // 因为当触发mount事件时
  console.log('绑定事件...');
  microEffect.evt.on('mount', () => {
    console.log('mounted vite ...');
    app = createVueApp();
  });
  // 卸载
  microEffect.evt.on('unmount', () => {
    app.unmount();
  });
} else {
  createVueApp();
}
