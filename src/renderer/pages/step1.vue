<template>
  <div class="content-container">
    <b-row align-h="center">
      <b-col class="text-center">
      <h1>Sign in @ Athom</h1>
      </b-col>
    </b-row>
    <b-row align-h="center">
      <b-col class="text-center" v-if="!isAuthenticated">
        <b-button variant="primary" @click="signIn">Login via Athom</b-button>
      </b-col>
    </b-row>
  </div>
</template>

<script>
  import {ipcRenderer} from 'electron';

  export default {
    name: "step1",
    data() {
      return {
        authenticated: false,
      }
    },
    computed: {
      isAuthenticated() {
        return this.authenticated;
      }
    },
    beforeMount() {
      ipcRenderer.on('authentication-check-complete', (event, args) => {
        const {authenticated} = args;
        this.authenticated = authenticated;
        if (authenticated){
           this.$router.push('step2');
        }
      });
      ipcRenderer.send('authentication-check');
    },
    methods: {
      signIn() {
        ipcRenderer.once('sign-in-complete', (event, args) => {
          ipcRenderer.send('authentication-check');
        });
        ipcRenderer.send('sign-in');
      }
    }
  }
</script>

<style scoped>
  .content-container {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
</style>
