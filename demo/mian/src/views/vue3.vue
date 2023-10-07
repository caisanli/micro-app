/* eslint-disable */
<template>
  <div>
    <div>
      <button @click="onClickMainToChild">主系统向子系统发消息</button>
    </div>
    <div>
      <micro-app name="vue3" url="/vue3" sandbox />
      <micro-app name="vue2" url="/vue2" sandbox />
    </div>
  </div>
</template>

<script>
/* eslint-disable */
import MicroApp, { baseAppEvent } from '../../../../src/index';

baseAppEvent.on('child', (data) => {
  alert('主系统收到子系统消息：' + data);
});
export default {
  components: {
    MicroApp,
  },
  methods: {
    // 主系统向子系统发消息
    onClickMainToChild() {
      console.log('开始发消息...')
      baseAppEvent.dispatch('message', '主系统向子系统发消息');
    }
  }
}
</script>

<style lang="less" scoped></style>
