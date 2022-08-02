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
  console.log('micro vite ...');
  // 因为当触发mount事件时
  microEffect.evt.on('mount', () => {
    app = createVueApp();
  });
  // 卸载
  microEffect.evt.on('unmount', () => {
    app.unmount();
  });
} else {
  createVueApp();
}
