<template>
  <a-layout style="min-height: 100vh;">
    <a-layout-sider width="280">
      <a-menu mode="inline" theme="dark" :style="{ height: '100%', borderRight: 0 }">
        <a-menu-item v-for="item in routes" :key="item.name">
          <router-link :to="{ path: item.path }">{{ item.name }}</router-link>
        </a-menu-item>
      </a-menu>
    </a-layout-sider>
    <a-layout>
      <a-layout-content
        :style="{
          background: '#fff',
          padding: '24px',
          margin: 0,
          minHeight: '280px',
        }"
      >
        <router-view />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script>
import routes from '@/router/routes'
export default {
  data() {
    return {
      routes,
    }
  },
}
</script>

<style lang="less" scoped></style>
