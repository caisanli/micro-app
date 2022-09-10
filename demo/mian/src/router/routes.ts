export default [{
  name: 'index',
  path: '/index',
  component: () => import('@/views/index.vue')
},
  {
    name: 'vue2',
    path: '/wvue2/*',
    component: () => import('@/views/vue2.vue')
  }, {
    name: 'vue3',
    path: '/wvue3/*',
    component: () => import('@/views/vue3.vue')
  }, {
    name: 'vue3-ts',
    path: '/wvue3-ts/*',
    component: () => import('@/views/vue3-ts.vue')
  }, {
    name: 'vite',
    path: '/wvite/*',
    component: () => import('@/views/vite.vue')
  }, {
    name: 'vite2',
    path: '/wvite2/*',
    component: () => import('@/views/vite2.vue')
  }
];
