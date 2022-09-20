/* eslint-disable */
import "core-js/stable";
import "regenerator-runtime/runtime";

import Vue from 'vue'
import router from './router';
import App from './App.vue'
import antv from 'ant-design-vue';
import 'ant-design-vue/dist/antd.css';
import system from './config/system'
import { setPreload } from '../../../src/index';

setPreload([system.vue3, system.vue2, system.vite])

Vue.use(antv)

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
