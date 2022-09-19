import { createApp } from 'vue'
import router from './router/index'
import App from './App.vue'

window.testVue = 'vue3';

function createAppFunc() {
  const app = createApp(App);
  app.use(router);
  app.mount('#app');
  return app;
}

if (window._zxj_is_micro) {
  const microApp = window['_zxj_micro_vue3'];
  let app;
  microApp.evt.on('message', (data) => {
    alert('vue3收到消息：' + JSON.stringify(data));
  })
  microApp.evt.on('child', (data) => {
    alert('看能不能收到：' + JSON.stringify(data));
  })
  microApp.evt.on('mount', () => {
    console.log('vue3 mount...');
    app = createAppFunc();
  })

  microApp.evt.on('unmount', () => {
    console.log('vue3 unmount...');
    app.unmount();
    app = null;
  })
  microApp.evt.on('test-EVT', () => {

  })
} else {
  createAppFunc()
}

// const app = createApp(App);
// app.use(router);
// app.mount('#app')

window.onerror = err => {
  console.log('err：', err);
}
