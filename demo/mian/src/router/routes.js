export default [{
  name: 'index',
  path: '/',
  component: () => import('@/views/index')
}, {
  name: 'vue2',
  path: '/vue2/*',
  component: () => import('@/views/vue2')
}, {
  name: 'vue3',
  path: '/vue3/*',
  component: () => import('@/views/vue3')
}, {
  name: 'vue3-ts',
  path: '/vue3-ts/*',
  component: () => import('@/views/vue3-ts')
}]