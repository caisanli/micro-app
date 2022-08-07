<template>
  <div>Index1</div>
  <Button @click="onClickOpen">打开模态24</Button>
  <Modal v-model:visible="visible" />
</template>
<script setup lang="ts">
  import { Modal, Button } from 'ant-design-vue'
  import { ref } from "vue";
  let visible = ref(false)

  function onClickOpen() {
    visible.value = true;
  }
</script>
