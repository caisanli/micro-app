import { createApp } from 'vue'
import router from './router/index'
import App from './App.vue'

console.log('isMicro：', window['_zxj_is_micro'])

const app = createApp(App);
app.use(router);
app.mount('#app')

window.onerror = err => {
  console.log('err：', err);
}
