<template>
  <div id="child">
    <h1>子应用</h1>
    <ul>
        <li><router-link to="/child/index">首页</router-link></li>
        <li><router-link to="/child/password">密码</router-link></li>
    </ul>
    <router-view />
  </div>
</template>

<script>

export default {
  name: 'App',
  components: {
      
  },
  mounted() {
    document.body.addEventListener('click', function() {
        console.log('click')
    })
  }
}
</script>

<style>
#child {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
