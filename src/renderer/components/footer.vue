<template>
  <b-container fluid class="footer">
    <b-row align-h="center" align-v="center">
      <b-col cols="auto" class="pr-1">
        <img :src="logo"/>
      </b-col>
      <b-col cols="auto" class="text-center pl-1">
        Created by
        <b-link @click="openLink('https://github.com/MaxvandeLaar')">Max van de Laar</b-link>
        for the
        <b-link @click="openLink('https://store.homey.community')">Homey Community Store</b-link>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
  import {shell} from 'electron';
  import {getStatic} from "../utils";

  export default {
    name: "bottomBar",
    computed: {
      logo() {
        return getStatic('logo.svg');
      }
    },
    methods: {
      openLink(url) {
        shell.openExternal(url);
      }
    }
  }
</script>

<style scoped lang="scss">
  .footer {
    position: fixed;
    bottom: 0;
    background-color: white;
    padding: 1rem 0;
    z-index: 99999;

    img {
      height: 18px;
    }
  }
</style>
