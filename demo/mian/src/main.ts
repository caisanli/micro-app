/* eslint-disable */
import "core-js/stable";
import "regenerator-runtime/runtime";

import Vue from 'vue'
import router from './router';
import App from './App.vue'
import antv from 'ant-design-vue';
import 'ant-design-vue/dist/antd.css';

Vue.use(antv)

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
