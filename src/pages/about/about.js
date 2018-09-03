//index.js
//获取应用实例
const app = getApp()
Page({
  data: {

  },
  // 分享
  onShareAppMessage: function (res) {
    return {
      title: '朋友圈，微博，抖音 都在玩的小程序！！！',
      path: '/pages/index/index',
      imageUrl: '../../images/sharImg.jpg'
    }
  },

})