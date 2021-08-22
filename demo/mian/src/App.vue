<template>
  <div id="app">
    <h1>主应用</h1>
    <ul>
        <li><router-link to="/">首页</router-link></li>
        <li><router-link to="/child/">子应用</router-link></li>
    </ul>
    <router-view />
  </div>
</template>

<script>

export default {
  name: 'App',
  components: {
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
