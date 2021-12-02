import { createRouter, createWebHashHistory } from 'vue-router';
import BlankLayout from '@/components/BlankLayout.vue';

const router = createRouter({
  history: createWebHashHistory(),
  routes: [{
    path: '/vite/*',
    component: BlankLayout,
    redirect: '/vite/index',
    children: [{
      path: '/vite/index',
      component: () => import('@/views/index.vue'),
    }, {
      path: '/vite/user',
      component: () => import('@/views/user.vue'),
    }, {
      path: '/vite/blog',
      component: () => import('@/views/blog.vue'),
    }]
  }]
});

export default router;
