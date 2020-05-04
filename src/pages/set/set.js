//set.js
const shape = require('../../utils/shape.js');
Page({
  data: {
    save: ['保存9张', '保存1张'],
    saveIndex: 0,
    add: ['小哥哥', '小姐姐', '随机', '已选图片'],
    addIndex: 0,
    tailor: ["自动裁剪", "手动裁剪"],
    tailorIndex: 0,
    shapeName: shape.shapeName,
    shapeIndex: 0,
    isHiddenDeleteIcon: true,
  },
  // 改变保存张数
  saveChange: function (e) {
    this.setData({
      saveIndex: e.detail.value
    })
    let num = e.detail.value == 0 ? 9 : 1;
    wx.setStorage({
      key: 'saveNum',
      data: num,
    })
  },
  // 改变补充图片类型
  addChange: function (e) {
    let imgType = e.detail.value;
    this.setData({
      addIndex: imgType
    })
    wx.setStorage({
      key: 'imgType',
      data: imgType,
    })
  },
  // 单选图片裁剪模式
  tailorChange: function (e) {
    let tailorIndex = e.detail.value;
    this.setData({
      tailorIndex,
    })
    wx.setStorage({
      key: 'tailorIndex',
      data: tailorIndex,
    })
  },
  // 选择拼图形状
  shapeChange: function (e) {
    let that = this;
    let shapeIndex = e.detail.value;
    that.isHiddenDeleteIconFn(shapeIndex);
    wx.getStorage({
      key: 'shapeIndex',
      success: function (res) {
        let storageShapeIndex = res.data;
        let custom = that.data.shapeName.length - 1;
        custom = shapeIndex == custom;
        // 用户选择自定义，跳转到自定义形状页面
        if (custom) {
          wx.navigateTo({
            url: '../shape/shape',
          })
          // 用户选择其他形状，就修改数据
        } else if (shapeIndex != storageShapeIndex) {
          that.setData({
            shapeIndex,
          })
          wx.setStorage({
            key: 'shapeIndex',
            data: shapeIndex,
          })
        }
      },
    })
  },
  onLoad: function () {
    let that = this;
    // 如果保存图片张数有缓存，调用缓存
    wx.getStorage({
      key: 'saveNum',
      success: function (res) {
        let data = res.data == 1 ? 1 : 0;
        that.setData({
          saveIndex: data
        })
      },
    })

    // 如果补充图片类型有缓存，调用缓存
    wx.getStorage({
      key: 'imgType',
      success: function (res) {
        that.setData({
          addIndex: res.data
        })
      },
    })

    // 如果裁剪模式有缓存，调用缓存
    wx.getStorage({
      key: 'tailorIndex',
      success: function (res) {
        that.setData({
          tailorIndex: res.data
        })
      },
    })

  },
  onShow: function () {
    let that = this;
    // 如果拼图形状的名称列表有缓存，调用缓存
    wx.getStorage({
      key: 'shapeName',
      success: function (res) {
        that.setData({
          shapeName: res.data
        })
      },
      fail: function () {
        wx.setStorage({
          key: 'shapeName',
          data: that.data.shapeName,
        })
      },
    })
    // 如果拼图形状名称列表的index有缓存，调用缓存
    wx.getStorage({
      key: 'shapeIndex',
      success: function (res) {
        that.setData({
          shapeIndex: res.data
        })
        that.isHiddenDeleteIconFn(res.data);
      },
      fail: function () {
        let shapeIndex = that.data.shapeIndex;
        wx.setStorage({
          key: 'shapeIndex',
          data: shapeIndex,
        })
        that.isHiddenDeleteIconFn(shapeIndex);
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
  // 是否隐藏删除图标
  isHiddenDeleteIconFn: function (index) {
    let isHiddenDeleteIcon = false;
    let last = this.data.shapeName.length - 1;
    if (index == 0 || index == last) {
      isHiddenDeleteIcon = true;
    }
    this.setData({
      isHiddenDeleteIcon,
    })
  },
  // 删除自定义形状
  deleteShape: function () {
    let that = this;
    wx.showModal({
      confirmColor: "#66a6ff",
      content: '确定删除这个形状吗？',
      success(res) {
        if (res.confirm) {
          // 删除数据
          deleteData();
        }
      }
    })

    // 删除数据
    function deleteData() {
      wx.getStorage({
        key: 'shapeIndex',
        success: function (res) {
          let shapeIndex = res.data;
          // 删除自定义形状的数组数据
          deleteShapeData(shapeIndex)
          // 删除自定义形状的名称数据
          deleteShapeName(shapeIndex)
        },
      })
    }

    // 删除自定义形状的数组数据
    function deleteShapeData(shapeIndex) {
      wx.getStorage({
        key: 'shapeData',
        success: function (res) {
          let shapeData = res.data;
          shapeData.splice(shapeIndex, 1)
          wx.setStorage({
            key: 'shapeData',
            data: shapeData,
          })
        },
      })
    }

    // 删除自定义形状的名称数据
    function deleteShapeName(shapeIndex) {
      wx.getStorage({
        key: 'shapeName',
        success: function (res) {
          let shapeName = res.data;
          shapeName.splice(shapeIndex, 1);
          shapeIndex--;
          wx.setStorage({
            key: 'shapeName',
            data: shapeName,
          })
          wx.setStorage({
            key: 'shapeIndex',
            data: shapeIndex,
          })
          that.setData({
            shapeName,
            shapeIndex,
          })
          that.isHiddenDeleteIconFn(shapeIndex);
        },
      })
    }

  },
})