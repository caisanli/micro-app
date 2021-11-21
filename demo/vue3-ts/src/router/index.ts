import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';
import RouterView from '@/layout/RouterView.vue';

const routes: Array<RouteRecordRaw> = [{
  path: '/vue3-ts/*',
  name: 'Home',
  component: RouterView,
  redirect: '/vue3-ts/index',
  children: [{
    path: '/vue3-ts/index',
    component: () => import(/* webpackChunkName: "about" */ '@/views/index.vue'),
  }],
}];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
