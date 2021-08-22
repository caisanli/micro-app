import Vue from 'vue';
import VueRouter from 'vue-router';
// import Index from '@/views/index';
// import User from '@/views/user';
Vue.use(VueRouter);

const router =  new VueRouter({
    // mode: 'hash',
    // base: '/child/',
    routes: [{
        path: '/child',
        component: () => import(/* webpackChunkName: "empty" */ '@/views/empty'),
        children: [{
            name: 'index',
            path: '/child/index',
            component: () => import(/* webpackChunkName: "index" */ '@/views/index')
        }, {
            name: 'password',
            path: '/child/password',
            component: () => import(/* webpackChunkName: "password" */ '@/views/password')
        }]
    }]
})

export default router;