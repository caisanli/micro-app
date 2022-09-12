import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
    history: createWebHistory(),
    routes: [{
      path: '/wvue3/index',
      name: 'index',
      component: () => import('@/views/index.vue')
    },{
      path: '/wvue3/user',
      name: 'user',
      component: () => import('@/views/user.vue')
    }]
})

export default router;
