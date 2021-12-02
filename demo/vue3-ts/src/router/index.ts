import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';
import RouterView from '@/layout/RouterView.vue';

const routes: Array<RouteRecordRaw> = [{
  path: '/vue3-ts/*',
  name: 'Home',
  component: RouterView,
  redirect: '/vue3-ts/index',
  children: [{
    path: '/vue3-ts/index',
    component: () => import(/* webpackChunkName: "index" */ '@/views/index.vue'),
  }, {
    path: '/vue3-ts/blog',
    component: () => import(/* webpackChunkName: "user" */ '@/views/blog.vue'),
  }],
}];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
