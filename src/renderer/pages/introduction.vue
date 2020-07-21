<template>
    <b-row align-h="center" align-v="center" class="h-100">
      <b-col cols="12">
        <b-jumbotron header="Homey Community Store" bg-variant="transparent" lead="Welcome to the Homey Community Store Installer">
          <p>As of Homey firmware version 5.x.x it is no longer possible for the Homey Community Store to install apps
             remotely. Don't worry, I have found a way.</p>
          <p>The only thing you need to do as of the new version is to install the Homey Community Store app for the
             Homey. Sadly, Athom won't allow this app in the official store. Therefor, I created this so you don't have to know
             any command line interface commands 😉</p>
          <b-button variant="primary" @click="nextStep">Let's get started!</b-button>
          <p class="text-danger mt-3">Please note(!) this installer only works if your Homey is in the same local network as your computer!</p>
        </b-jumbotron>
      </b-col>
    </b-row>
</template>

<script>
  import {ipcRenderer} from 'electron';

  export default {
    name: "index",
    data() {
      return {
        authenticated: false
      }
    },
    beforeMount() {
      ipcRenderer.once('authentication-check-complete', (event, args) => {
        this.authenticated = args.authenticated;
      });
      ipcRenderer.send('authentication-check');
    },
    methods: {
      nextStep() {
        if (this.authenticated) {
          this.$router.push('step2');
        } else {
          this.$router.push('step1');
        }
      }
    }
  }
</script>

<style scoped lang="scss">

</style>
