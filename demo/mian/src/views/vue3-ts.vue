/* eslint-disable */
<template>
  <micro-app name="vue3-ts" url="/vue3-ts" :external-links="externalLinks" />
</template>

<script>
// /* eslint-disable */
// import MicroApp from '../../../../src/index';
export default {
  components: {
    // MicroApp,
  },
  data() {
    return {
      externalLinks: ['https://cdn.bootcdn.net/ajax/libs/jquery/3.6.0/jquery.js']
    }
  }
}
</script>

<style lang="less" scoped></style>
