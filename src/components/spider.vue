<template>
<div>
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
  
  <x-dialog v-model="showDataDetail" :hide-on-blur="true">
    <view-box :style="{height: dialogHeight}">
      <img :src="showData.headimgurl" style="height:100px;margin-top:30px;">
      <group>
        <cell :title="showData.fans"></cell>
        <cell v-for="(item, index) in showData.introlist" :title="item" :key="index"></cell>
      </group>
    </view-box>
  </x-dialog>
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
      listHeight: "",
      dialogHeight: "",
      showDataDetail: false,
      keyword: "",
      dataList: [],
      showData: {},
      totalPage: "",
    }
  },
  computed: {
    ...mapGetters([
      "creepAccount",
      "accountlist",
    ])
  },
  methods: {
    showThisData: function(data) {
      this.showData = data;
      this.showDataDetail = true;
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
          this.$store.commit("creepAccount", -1);
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
    this.listHeight = H - 44 - 49 - 37 + "px";
    this.dialogHeight = H - 100 + "px";
  }
}
</script>

<style>

</style>
