<template>
  <div>
    <basic-layout />
    <!-- <h1>主应用</h1>
    <ul>
        <li><router-link to="/">首页</router-link></li>
        <li><router-link to="/vue2/">vue2子应用</router-link></li>
    </ul>
    <router-view /> -->
  </div>
</template>

<script>
import BasicLayout from '@/layout/BasicLayout.vue';
export default {
  name: 'App',
  components: {
    BasicLayout
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
