/* eslint-disable */
<template>
    <div>
        子应用
        <micro-app name="child" url="/child/" />
    </div>
</template>

<script>
    /* eslint-disable */
    import MicroApp from '../../../../src/micro';
    export default {
        components: {
            MicroApp
        }
    }
</script>

<style lang="less" scoped>

</style>