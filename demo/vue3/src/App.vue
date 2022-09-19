<template>
  <img alt="Vue logo" src="./assets/logo.png">
  <button @click="onClickToMain">向主系统发消息</button>
  <router-link to="/wvue3/index">index</router-link>
  <router-link to="/wvue3/user">user</router-link>
  <router-view />
</template>

<script>
export default {
  name: 'App',
  methods: {
    onClickToMain() {
      const microApp = window['_zxj_micro_vue3'];
      microApp.evt.dispatch('child', 'vue3 子系统向主系统发消息');
    }
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
