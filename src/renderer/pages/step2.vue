<template>
  <div class="content-container">
    <b-overlay :show="installing" no-wrap>
      <template v-slot:overlay>
        <div class="text-center">
          <img :src="logo"/>
          <p>Please wait while the app is being installed...</p>
          <p><small>(Sorry, it might take a while)</small></p>
        </div>
      </template>
    </b-overlay>
      <b-row align-h="center">
        <b-col class="text-center">
          <h1>The installation</h1>
          <p class="text-danger">Please note(!) this installer only works if your Homey is in the same local network as your computer!</p>
        </b-col>
      </b-row>
      <b-row align-h="center">
        <b-col class="text-center" v-if="!multipleHomeys">
          <pre>{{activeHomey.name}}</pre>
        </b-col>
        <b-col class="text-center" v-if="multipleHomeys">
          <small class="d-block mb-3">To install the Homey Community Store app for multiple Homey's, just repeat the installation for each Homey you own. You can switch Homey's by selecting another one in the dropdown.</small>
          <b-dropdown right :text="activeHomey.name" class="mb-3">
            <b-dropdown-item v-for="homeyI in homeys" @click="selectHomey(homeyI)">{{homeyI.name}}</b-dropdown-item>
          </b-dropdown>
        </b-col>
      </b-row>
      <b-row align-h="center">
        <b-col class="text-center">
          <b-button variant="primary" @click="installApp">Start the installation</b-button>
          <small class="mt-3 d-block">If the installation is finished, you can close and delete this desktop installer as you won't be needing it anymore 😃</small>
        </b-col>
      </b-row>
    </div>
</template>

<script>
  import {ipcRenderer} from 'electron';
  import {getStatic} from "../utils";

  export default {
    name: "step2",
    data() {
      return {
        homeys: [],
        homey: null,
        installing: false
      }
    },
    beforeMount() {
      ipcRenderer.on('authentication-check-complete', (event, args) => {
        const {profile, activeHomey} = args;
        this.homeys = profile.homeys;
        this.homey = activeHomey;
      });
      ipcRenderer.send('authentication-check');
    },
    computed: {
      logo() {
        return getStatic('logo.svg');
      },
      multipleHomeys() {
        return this.homeys.length > 1;
      },
      activeHomey() {
        return this.homey || {name: ''}
      }
    },
    methods: {
      selectHomey(homey) {
        ipcRenderer.once('set-homey-complete', (event, args) => {
          this.homey = args.homey;
        });
        ipcRenderer.send('set-homey', {homey});
      },
      installApp() {
        this.installing = true;
        this.$bvToast.hide();
        ipcRenderer.once('install-app-complete', (event, args) => {
          this.installing = false;
          let toastMessage = `The Homey Community Store app for your homey '${this.homey.name}' is installed!\nYou may now close and delete this desktop installer 😃`;
          let toastOptions = {
            variant: 'success',
            title: 'Installation success',
            target: 'b-toaster-top-right',
          };

          if (args.error) {
            toastMessage = args.error;
            toastOptions.title = 'Installation failed';
            toastOptions.variant = 'danger';
          } else {
            this.$bvToast.show('install-success');
          }
          this.$bvToast.toast(toastMessage, toastOptions);
        });
        ipcRenderer.send('install-app');
      }
    }
  }
</script>

<style scoped lang="scss">
  .content-container {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .b-overlay {
    img {
      animation: rotate-hue 1750ms linear infinite reverse;
      height: 5rem;
      margin-bottom: 2rem;
    }
  }

  @keyframes rotate-hue {
    0% {
      filter: hue-rotate(0deg) blur(10px) drop-shadow(0px 0px 10px black);
      transform: scale(1);
    }

    50% {
      filter: hue-rotate(180deg) blur(10px) drop-shadow(0px 0px 10px black);
      /*transform: scale(0.95);*/
    }

    100% {
      filter: hue-rotate(360deg) blur(10px) drop-shadow(0px 0px 10px black);
      transform: scale(1);
    }
  }
</style>
