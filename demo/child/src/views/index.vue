<template>
    <div class="index">
        首页
    </div>
</template>

<script>
    export default {
        
    }
</script>

<style lang="css" scoped>
    .index {
        color: red;
    }
    .text {
        color: #eee;
    }
    @media screen and (max-width: 900px) and (min-width:300px) {
        .index {
            color: yellow;
        }
    }
    @media screen and (min-width: 900px) {
        .index {
            color: red;
        }
        .test {
            color: violet;
        }
    }
    
</style>
<style>
body, html, #child {
        height: 100%;
    }
</style>