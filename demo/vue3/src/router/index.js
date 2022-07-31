import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
    history: createWebHashHistory(),
    routes: [{
      path: '/vue3/*',
      name: 'index',
      component: () => import('@/views/index.vue')
    }]
})

export default router;