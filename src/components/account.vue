<template>
<div>
  <group>
    <swipeout>
      <swipeout-item v-for="(item, index) in accountlist" transition-mode="follow" :key="index">
        <div slot="right-menu">
          <swipeout-button type="warn" @click.native="deleteAccount(index)">删除</swipeout-button>
        </div>
        <cell :title="item.mobile" :key="index" @click.native="selectAccount(index)" slot="content">
          <x-button v-show="!item.login" type="primary" mini @click.native="prelogin(item)">登录</x-button>
          <icon v-show="creepAccount === index" type="success"></icon>
        </cell>
      </swipeout-item>
    </swipeout>
  </group>
  <div style="padding: 15px;">
    <x-button type="primary" @click.native="showAddAccount = true">添加账号</x-button>
  </div>

  <x-dialog v-model="showPreLogin" :hide-on-blur="true">
    <x-input title="账号" v-model="loginAccount.mobile" disabled></x-input>
    <x-input title="密码" v-model="loginAccount.password" placeholder="输入密码" type="password"></x-input>
    <!-- <x-input title="验证码" v-model="prelogindata.code" placeholder="输入验证码">
      <img :src="prelogindata.codeImg" slot="right">
    </x-input> -->
    <x-button type="primary" mini @click.native="login" style="margin-top:1em;margin-bottom:1em;" :show-loading="loginloading">登录</x-button>
  </x-dialog>
  <x-dialog v-model="showAddAccount" :hide-on-blur="true">
    <x-input title="账号" v-model.trim="newAccount.mobile" placeholder="输入账号"></x-input>
    <x-button type="primary" mini @click.native="addAccount" style="margin-top:1em;margin-bottom:1em;">确定</x-button>
  </x-dialog>
  <actionsheet v-model="showConfirm" :menus="confirmMenu" @on-click-menu-delete="deleteAccountReal" show-cancel></actionsheet>
</div>
</template>

<script>
import Vue from 'vue';
import { mapGetters } from 'vuex';
import { Tab, TabItem, Swiper, SwiperItem, Group, Cell, XInput, XButton, XDialog, Divider, ToastPlugin, Icon, LoadingPlugin, Swipeout, SwipeoutItem, SwipeoutButton, Actionsheet, ViewBox } from 'vux'
Vue.use(ToastPlugin)
Vue.use(LoadingPlugin)

export default {
  props: [],
  components: {
    Tab,
    TabItem,
    Swiper,
    SwiperItem,
    Group,
    Cell,
    XInput,
    XButton,
    XDialog,
    Divider,
    Icon,
    Swipeout,
    SwipeoutItem,
    SwipeoutButton,
    Actionsheet,
    ViewBox,
  },
  data () {
    return {
      confirmMenu: [{
        label: '确定么？<br/><span style="color:#666;font-size:12px;">此操作将无法撤销</span>',
        type: 'info'
      },{
        label: '删除',
        type: 'warn',
        value: 'delete'
      }],
      showPreLogin: false,
      showAddAccount: false,
      showConfirm: false,
      loginloading: false,
      loginAccount: {mobile: "", password: "", login: false},
      newAccount: {mobile: "", password: "", login: false},
      prelogindata: {},
      waitDeleteAccount: -1,
    }
  },
  computed: {
    ...mapGetters([
      "creepAccount",
      "accountlist",
    ])
  },
  methods: {
    deleteAccountReal: function() {
      this.$store.commit("delete_accountlist", this.waitDeleteAccount);
    },
    deleteAccount: function(index) {
      this.showConfirm = true;
      this.waitDeleteAccount = index;
    },
    addAccount: function() {
      let account = _.merge({}, this.newAccount);
      if(!account.mobile) {
        this.$vux.toast.show({
          text: '账号不能为空',
          type: "warn"
        });
        return;
      }
      this.$store.commit("push_accountlist", account);
      this.showAddAccount = false;
      this.newAccount.mobile = "";
    },
    selectAccount: function(index) {
      let creepAccount = this.accountlist[index];
      if(creepAccount.login) {
        this.$store.commit("creepAccount", index);
      }
    },
    testlogin: function() {
      // 获取验证码
      this.axios.get("/api/prelogin")
      .then(result => result.data)
      .then(data => {
        if(data.err) {
          this.$vux.toast.show({
            text: '请求失败',
            type: "warn"
          });
        } else {
          this.prelogindata = data;
          this.showPreLogin = true;
          this.login();
        }
      });
    },
    prelogin: function(account) {
      this.loginAccount = account;
      // 获取验证码
      this.axios.get("/api/prelogin")
      .then(result => result.data)
      .then(data => {
        if(data.err) {
          this.$vux.toast.show({
            text: '请求失败',
            type: "warn"
          });
        } else {
          this.prelogindata = data;
          this.showPreLogin = true;
        }
      });
    },
    login: function() {
      let loginIndex = this.accountlist.indexOf(this.loginAccount),
        req = _.merge({}, this.prelogindata, this.loginAccount);

      if(!req.password) {
        this.$vux.toast.show({
          text: '密码不能为空',
          type: "warn"
        });
        return;
      }
      this.loginloading = true;
      // 登录新浪微博
      this.axios.post("/api/login", req)
      .then(result => result.data)
      .then(data => {
        this.loginloading = false;
        if(data.err) {
          this.$vux.toast.show({
            text: '登录失败',
            type: "warn"
          });
        } else {
          this.showPreLogin = false;
          this.loginAccount.login = true;
          if(this.creepAccount < 0) {
            this.$store.commit("creepAccount", loginIndex);
          }
          this.$vux.toast.show({
            text: '登录成功',
            type: "success"
          });
        }
      });
    },
  }
}
</script>

<style>

</style>
