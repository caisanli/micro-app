import { createApp, App as VueApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';

const microEffect: MicroSideEffect | undefined = window['_zxj_micro_vue3-ts'];

function createVueApp(): VueApp {
  const app:VueApp = createApp(App);
  app.use(store);
  app.use(router);
  app.mount('#vue3-ts');
  return app;
}

const isMicro = window['_zxj_is_micro'];

if(isMicro && microEffect) {

  let app:VueApp;

  microEffect.evt.on('mount', () => {
    app = createVueApp();
  });

  microEffect.evt.on('unmount', () => {
    app.unmount();
  })

} else {
  createVueApp();
}
// createApp(App).use(store).use(router).mount('#vue3-ts');
