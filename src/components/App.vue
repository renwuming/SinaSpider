<template>
<div style="height:100%;">
  <tab>
    <tab-item v-for="(item, index) in list" :selected="swiper === index" @on-item-click="swiper = index" :key="index">{{list[index]}}</tab-item>
  </tab>
  <swiper v-model="swiper" :show-dots="false" :height="swiperHeight" :min-moving-distance="1000">
    <swiper-item>
      <account></account>
    </swiper-item>
    <swiper-item>
      <spider></spider>
    </swiper-item>
  </swiper>

</div>
</template>

<script>
import Vue from 'vue';
import { Tab, TabItem, Swiper, SwiperItem } from 'vux'

import account from "./account";
import spider from "./spider";

export default {
  props: [],
  components: {
    Tab,TabItem,Swiper,SwiperItem,
    account,
    spider
  },
  data () {
    return {
      list: ["账号管理", "爬虫"],
      swiperHeight: "",
      swiper: 0,
    }
  },
  methods: {
  },
  mounted() {
    let H = document.getElementsByTagName("body")[0].offsetHeight;
    this.swiperHeight = H - 44 + "px";
  }
}
</script>


<style lang="less">

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
