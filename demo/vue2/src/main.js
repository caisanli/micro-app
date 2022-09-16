import Vue from 'vue'
import router from './router'
import App from './App.vue'
Vue.config.productionTip = false
window.testVue = 'vue2';

function createAppFunc() {
  const app = new Vue({
    router,
    render: (h) => h(App),
  })
  console.log('vue2开始创建...');
  app.$mount('#vue2')
  return app
}

if (window._zxj_is_micro) {
  const microApp = window['_zxj_micro_vue2'];
  let app;
  microApp.evt.on('mount', () => {
    console.log('vue2 mount...');
    app = createAppFunc();
  })

  microApp.evt.on('unmount', () => {
    console.log('vue2 unmount...');
    app.$destroy();
    app = null;
  })
} else {
  createAppFunc()
}
