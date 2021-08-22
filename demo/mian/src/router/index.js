import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

const router = new VueRouter({
    // mode: 'history',
    // base: '/',
    routes: [{
        name: 'index',
        path: '/',
        component: () => import('@/views/index')
    }, {
        name: 'child',
        path: '/child/*',
        // alias: '/child',
        component: () => import('@/views/child')
    }]
})

export default router;