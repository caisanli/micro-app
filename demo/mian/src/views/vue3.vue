/* eslint-disable */
<template>
  <div>
    <micro-app name="vue3" url="/vue3" sandbox />
    <micro-app name="vue2" url="/vue2" sandbox />
  </div>
</template>

<script>
/* eslint-disable */
import MicroApp from '../../../../src/index';
export default {
  components: {
    MicroApp,
  },
}
</script>

<style lang="less" scoped></style>
