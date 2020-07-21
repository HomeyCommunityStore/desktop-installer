'use strict';
import Vue from 'vue';
import Index from './index.vue';
import {BootstrapVue, BootstrapVueIcons} from 'bootstrap-vue';
import VueRouter from 'vue-router';
import './scss/custom.scss';

Vue.use(BootstrapVue);
Vue.use(BootstrapVueIcons);
Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    component: require('./pages/introduction.vue').default
  },
  {
    path: '/step1',
    component: require('./pages/step1.vue').default
  },
  {
    path: '/step2',
    component: require('./pages/step2.vue').default
  },
  {
    path: '*',
    redirect: '/'
  }
];

const router = new VueRouter({
  routes
})

function init() {
  Vue.config.devtools = false;
  Vue.config.productionTip = false;
  new Vue({
    router,
    components: {
      Index
    },
    template: `<index></index>`
  }).$mount('#app')
}

init();
