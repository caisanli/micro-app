import Vue from 'vue'
import router from './router';
import App from './App.vue'
// alert('1111')
Vue.config.productionTip = false

new Vue({
    router,
  render: h => h(App),
}).$mount('#child')
