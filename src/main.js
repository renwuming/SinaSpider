import Vue from 'vue'
import App from './components/App'
import axios from 'axios'
import VueAxios from 'vue-axios'
import Vuex from 'vuex'

window._ = require('lodash')

Vue.use(VueAxios, axios);
Vue.use(Vuex);

Vue.config.productionTip = false

const  store = new Vuex.Store({
  state: {
    creepAccount: -1,
    accountlist: [{username: "15510978006", password: "460457", login: false}],
  },
  mutations: {
    creepAccount: (state, index) => {
      state.creepAccount = index;
    },
    push_accountlist: (state, account) => {
      state.accountlist.push(account);
    },
    delete_accountlist: (state, index) => {
      state.accountlist.splice(index, 1);
    }
  },
  getters: {
    creepAccount: state => state.creepAccount,
    accountlist: state => state.accountlist,
  }
});

new Vue({
  el: '#app',
  store: store,
  render: h => h(App)
})
