import Vue from 'vue'
import router from './router'
import App from './App.vue'
Vue.config.productionTip = false
try {
  new Vue({
    router,
    render: (h) => h(App),
  }).$mount('#vue2')
} catch (error) {
  console.log(error)
}
