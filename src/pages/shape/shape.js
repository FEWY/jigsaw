// pages/shape/shape.js
const shape = require('../../utils/shape.js');
const ctx = wx.createCanvasContext('myCanvas');
// 一个格子的宽度，也就是canvas的宽度/9
const grid = 35;
// canvas的宽度
const maxWidth = 315;
// canvas上画的线的颜色
const lineColor = '#93E0FE';
// 初始时拼图形状的颜色
const heartColor = '#FF9CC2';

Page({
  data: {
    // 拼图形状的数组
    heart: [],
    // 自定义形状的名称
    shapeName: "",
    defaultShapeIndex: 0,
    clear: [
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
  },

  onLoad: function() {
    // 调用重置方法，重置拼图形状
    this.reset();
  },
  // 获取自定义形状名称
  getShapeName: function(e) {
    this.setData({
      shapeName: e.detail.value
    })
  },
  // 重置
  reset: function() {
    let defaultShapeIndex = this.data.defaultShapeIndex;
    let heart = JSON.parse(JSON.stringify(shape.shapeData[defaultShapeIndex]));
    this.setData({
      heart,
    })

    ctx.setFillStyle('#ffffff')
    ctx.fillRect(0, 0, maxWidth, maxWidth)
    ctx.draw()

    // 重置，画出拼图形状
    for (let i = 0; i < heart.length; i++) {
      for (let j = 0; j < heart[i].length; j++) {
        if (heart[i][j] == 1) {
          ctx.rect(j * grid, i * grid, grid, grid);
          ctx.setFillStyle(heartColor)
          ctx.fill();
        }
      }
    }
    ctx.draw(true);
    // 画九宫格的线
    this.drawLine();
  },
  // 画九宫格的线
  drawLine: function() {
    ctx.setStrokeStyle(lineColor);
    for (let i = 1; i < 3; i++) {
      ctx.moveTo(i * grid * 3, 0);
      ctx.lineTo(i * grid * 3, maxWidth);
      ctx.stroke();

      ctx.moveTo(0, i * grid * 3);
      ctx.lineTo(maxWidth, i * grid * 3);
      ctx.stroke();
    }
    ctx.draw(true);
  },
  // 选择格子
  selectGrid: function(e) {
    // 获取点击时 x 轴的值
    let x = e.changedTouches[0].x;
    // 获取点击时 y 轴的值
    let y = e.changedTouches[0].y;

    // 确定 x 轴是在第几个格子
    x = Math.floor(x / grid);
    // 确定 y 轴是在第几个格子
    y = Math.floor(y / grid);

    let heart = this.data.heart;
    let fillColor = "";
    let attribute = "heart[" + y + "]" + "[" + x + "]";
    if (heart[y][x] == 0) {
      fillColor = heartColor;
      this.setData({
        [attribute]: 1,
      })
    } else {
      fillColor = "#ffffff";
      this.setData({
        [attribute]: 0,
      })
    }
    ctx.rect(x * grid, y * grid, grid, grid);
    ctx.setFillStyle(fillColor)
    ctx.fill();
    ctx.draw(true);

    // 画九宫格的线
    this.drawLine();
  },
  // 清除选择的格子
  clear: function() {
    let that = this;
    that.setData({
      heart: that.data.clear,
    })
    ctx.setFillStyle('#ffffff')
    ctx.fillRect(0, 0, maxWidth, maxWidth)
    ctx.draw()
    // 画九宫格的线
    that.drawLine();
  },
  // 保存形状
  save: function() {
    let that = this;
    let shapeName = that.data.shapeName;
    if (!shapeName) {
      wx.showToast({
        title: '请输入自定义形状的名称',
        icon: 'none',
        duration: 2000
      })
      return;
    }
    wx.getStorage({
      key: 'shapeData',
      success: function(res) {
        let data = res.data;
        data.push(that.data.heart);
        wx.setStorage({
          key: 'shapeData',
          data: data,
        })
      },
    })

    wx.getStorage({
      key: 'shapeName',
      success: function(res) {
        let storageShapeName = res.data;
        // 添加自定义形状的名称
        storageShapeName.splice(-1, 0, shapeName);
        let shapeIndex = storageShapeName.length - 2;
        wx.setStorage({
          key: 'shapeName',
          data: storageShapeName,
        })
        wx.setStorage({
          key: 'shapeIndex',
          data: shapeIndex,
        })
        wx.switchTab({
          url: '../index/index',
        })
      },
    })

  },
})