import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

const router =  new VueRouter({
    mode: 'history',
    base: '/wvue2/',
    routes: [{
        path: '/vue2/*',
        component: () => import(/* webpackChunkName: "empty" */ '@/views/empty'),
        redirect: '/vue2/index',
        children: [{
            name: 'index',
            path: '/vue2/index',
            component: () => import(/* webpackChunkName: "index" */ '@/views/index')
        }, {
            name: 'password',
            path: '/vue2/password',
            component: () => import(/* webpackChunkName: "password" */ '@/views/password')
        }]
    }]
})

export default router;
