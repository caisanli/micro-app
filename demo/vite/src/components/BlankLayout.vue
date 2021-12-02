<template>
  <ul>
    <router-link :to="{path: '/vite/index'}">index</router-link>
    <router-link :to="{path: '/vite/user'}">user</router-link>
    <router-link :to="{path: '/vite/blog'}">blog</router-link>
  </ul>
  <router-view />
</template>

<script>
export default {
  name: "BlankLayout"
}
</script>

<style scoped>

</style>