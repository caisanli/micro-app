<template>
  <div id="vue2">
    <h1>vue2 子应用</h1>
    <button @click="onClickToMain">想主系统发消息</button>
    <ul>
        <li><router-link to="/vue2/index">首页</router-link></li>
        <li><router-link to="/vue2/password">密码</router-link></li>
    </ul>
    <router-view />
  </div>
</template>

<script>

export default {
  name: 'App',
  methods: {
    onClickToMain() {
      const microApp = window['_zxj_micro_vue2'];
      microApp.evt.dispatch('child', 'vue2 子系统向主系统发消息');
    }
  },
  mounted() {
    // document.body.addEventListener('click', function() {
    //     console.log('click')
    // })
  }
}
</script>

<style>
#vue2 {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
