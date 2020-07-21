<template>
  <div>
    <b-container class="main">
      <router-view></router-view>
    </b-container>
    <bottom-bar></bottom-bar>
  </div>
</template>

<script>
  import BottomBar from "./components/footer";

  export default {
    name: "index",
    components: {
      BottomBar
    }
  }
</script>

<style scoped lang="scss">
  .main {
    height: calc(100vh - 56px);
    padding: 2rem;
  }
</style>
