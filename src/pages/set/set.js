//set.js
//获取应用实例
const app = getApp()

Page({
  data: {
    save: ['保存9张', '保存1张'],
    saveIndex: 0,
    add: ['小哥哥', '小姐姐','随机', '已选图片'],
    addIndex: 0, 
    tailor: ["自动裁剪", "手动裁剪"],
    tailorIndex:0
  },
  //  保存张数改变
  saveChange: function(e) {
    this.setData({
      saveIndex: e.detail.value
    })

    var num = e.detail.value == 0 ? 9 : 1;
    wx.setStorage({
      key: 'saveNum',
      data: num,
    })
  },
  // 补充图片类型改变
  addChange: function(e) {
    this.setData({
      addIndex: e.detail.value
    })
    var imgType = e.detail.value;
    wx.setStorage({
      key: 'imgType',
      data: imgType,
    })
  },
  // 单选图片是否自动裁剪
  tailorChange:function(e){
    this.setData({
      tailorIndex: e.detail.value
    })
    var tailorIndex = e.detail.value;
    wx.setStorage({
      key: 'tailorIndex',
      data: tailorIndex,
    })
  },
  onLoad: function() {
    var that = this;

    // 如果保存图片张数有缓存，调用缓存
    wx.getStorage({
      key: 'saveNum',
      success: function(res) {
        var data = res.data == 1 ? 1 : 0;
        that.setData({
          saveIndex: data
        })
      },
    })

    // 如果补充图片类型有缓存，调用缓存
    wx.getStorage({
      key: 'imgType',
      success: function(res) {
        console.log(res);
        that.setData({
          addIndex: res.data
        })
      },
    })

    // 如果裁剪模式有缓存，调用缓存
    wx.getStorage({
      key: 'tailorIndex',
      success: function (res) {
        console.log(res);
        that.setData({
          tailorIndex: res.data
        })
      },
    })
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