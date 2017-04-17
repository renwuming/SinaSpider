<template>
<div style="height:100%;">
  <tab>
    <tab-item v-for="(item, index) in list" :selected="swiper === index" @on-item-click="swiper = index" :key="index">{{list[index]}}</tab-item>
  </tab>
  <swiper v-model="swiper" :show-dots="false" :height="swiperHeight" :min-moving-distance="1000">
    <swiper-item>
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
    </swiper-item>
    <swiper-item>
      <group>
        <x-input title="关键字" v-model.trim="keyword" placeholder="输入关键字">
          <x-button slot="right" type="primary" mini @click.native="creep">开始爬虫</x-button>
        </x-input>

        <divider v-show="dataList.length > 0">爬虫结果</divider>
        <view-box v-show="dataList.length>0" :style="{height: listHeight}">
          <cell v-for="(item, index) in dataList" :title="item.introlist[0].split(':')[1]+' - '+item.fans" :key="index" @click.native="showThisData(item)">
            <img :src="item.headimgurl" style="height:60px;">
          </cell>
        </view-box>
      </group>
    </swiper-item>
  </swiper>
  <x-dialog v-model="showPreLogin" :hide-on-blur="true">
    <x-input title="账号" v-model="loginAccount.mobile" disabled></x-input>
    <x-input title="密码" v-model="loginAccount.password" placeholder="输入密码" type="password"></x-input>
    <x-input title="验证码" v-model="prelogindata.code" placeholder="输入验证码">
      <img :src="prelogindata.codeImg" slot="right">
    </x-input>
    <x-button type="primary" mini @click.native="login" style="margin-top:1em;margin-bottom:1em;" :show-loading="loginloading">登录</x-button>
  </x-dialog>
  <x-dialog v-model="showAddAccount" :hide-on-blur="true">
    <x-input title="账号" v-model.trim="newAccount.mobile" placeholder="输入账号"></x-input>
    <x-button type="primary" mini @click.native="addAccount" style="margin-top:1em;margin-bottom:1em;">确定</x-button>
  </x-dialog>
  <x-dialog v-model="showDataDetail" :hide-on-blur="true">
    <view-box :style="{height: dialogHeight}">
      <img :src="showData.headimgurl" style="height:100px;margin-top:30px;">
      <group>
        <cell :title="showData.fans"></cell>
        <cell v-for="(item, index) in showData.introlist" :title="item" :key="index"></cell>
      </group>
    </view-box>
  </x-dialog>
  <actionsheet v-model="showConfirm" :menus="confirmMenu" @on-click-menu-delete="deleteAccountReal" show-cancel></actionsheet>

</div>
</template>

<script>
import Vue from 'vue';
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
      list: ["账号管理", "爬虫"],
      confirmMenu: [{
        label: '确定么？<br/><span style="color:#666;font-size:12px;">此操作将无法撤销</span>',
        type: 'info'
      },{
        label: '删除',
        type: 'warn',
        value: 'delete'
      }],
      swiperHeight: "",
      listHeight: "",
      dialogHeight: "",
      swiper: 0,
      accountlist: [{mobile: "15510978006", password: "460457", login: false}],
      creepAccount: -1,
      waitDeleteAccount: -1,
      loginAccount: {mobile: "15510978006", password: "460457", login: false},
      newAccount: {mobile: "", password: "", login: false},
      showPreLogin: false,
      showAddAccount: false,
      showConfirm: false,
      showDataDetail: false,
      prelogindata: {},
      loginloading: false,
      keyword: "",
      dataList: [],
      showData: {},
      totalPage: "",
    }
  },
  computed: {
  },
  methods: {
    showThisData: function(data) {
      this.showData = data;
      this.showDataDetail = true;
    },
    deleteAccountReal: function() {
      this.accountlist.splice(this.waitDeleteAccount, 1);
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
      this.accountlist.push(account);
      this.showAddAccount = false;
      this.newAccount.mobile = "";
    },
    selectAccount: function(index) {
      let creepAccount = this.accountlist[index];
      if(creepAccount.login) {
        this.creepAccount = index;
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
            this.creepAccount = loginIndex;
          }
          this.$vux.toast.show({
            text: '登录成功',
            type: "success"
          });
        }
      });
    },
    creep: function() {
      let account = this.accountlist[this.creepAccount];
      if(!account) {
        this.$vux.toast.show({
          text: '请选择一个账号',
          type: "warn"
        });
        return;
      }
      if(!this.keyword) {
        this.$vux.toast.show({
          text: '请输入关键字',
          type: "warn"
        });
        return;
      }
      this.$vux.loading.show({
        text: '数据爬取ing'
      })
      this.axios.post("/api/creep", {
        keyword: this.keyword,
        cookie: account.mobile
      })
      .then(result => result.data)
      .then(data => {
        this.$vux.loading.hide();
        if(data.err) {
          this.$vux.toast.show({
            text: '爬虫失败',
            type: "warn"
          });
        } else if(data.cookiefail) {
          account.login = false;
          this.creepAccount = -1;
          this.$vux.toast.show({
            text: '账号登录超时',
            type: "warn"
          });
        } else {
          this.dataList = data.rows;
          this.totalPage = data.totalPage;
          if(this.dataList.length <= 0) {
            this.$vux.toast.show({
              text: '无结果',
              type: "cancel"
            });
          }
        }
      });
    }
  },
  mounted() {
    let H = document.getElementsByTagName("body")[0].offsetHeight;
    this.swiperHeight = H - 44 + "px";
    this.listHeight = H - 44 - 49 - 37 + "px";
    this.dialogHeight = H - 100 + "px";

    this.testlogin();
  }
}
</script>

<style>
html,body {
  height: 100%;
  margin: 0;
  overflow-x: hidden;
}
.weui-cells:first-child:before {
  display: none;
}
.weui-cells > div.vux-x-input:first-of-type:after {
  content: " ";
  position: absolute;
  left: 0;
  bottom: 0;
  right: 0;
  height: 1px;
  border-bottom: 1px solid #D9D9D9;
  color: #D9D9D9;
  transform-origin: 0 100%;
  transform: scaleY(0.5);
}
.weui-cells > div.vux-x-input:last-of-type:after {
  border-bottom: none;
}
.vux-swipeout-item .weui-cell:before {
  display: block !important;
}
.vux-swipeout-item:first-child .weui-cell:before {
  display: none !important;
}
.weui-dialog .weui-tab__panel {
  padding-bottom: 0 !important;
}
</style>
