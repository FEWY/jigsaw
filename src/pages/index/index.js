//index.js
//获取应用实例
const app = getApp()
Page({
  data: {
    // 表示九宫格心形的数组
    heart: [
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 1, 1, 0, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1],
      [0, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 1, 1, 1, 0, 0],
      [0, 0, 0, 1, 1, 1, 0, 0, 0],
      [0, 0, 0, 0, 1, 0, 0, 0, 0],
    ],
    // 大的canvas 是 小的canvas 的 multiple 倍
    multiple: 3,
    // 一个格子的宽度，也就是 小的canvas的宽度/9
    grid: 35,
    // 小canvas的宽度
    maxWidth: 315,
    // 判断 保存图片 按钮，是否禁用
    btnDis: false,
    // 是否显示进度条
    progressVis: "none",
    // 进度条的进度 
    percent: 0,
    // 背景颜色，就是在小canvas上画的线的颜色
    bgColor: '#93E0FE',
    // 初始时心形的颜色
    heartColor: '#FF9CC2',
    // 用来补充心形的图片
    images: [
      '../../images/1.jpg',
      '../../images/2.jpg',
      '../../images/3.jpg',
      '../../images/4.jpg',
      '../../images/5.jpg',
      '../../images/6.jpg',
      '../../images/7.jpg',
      '../../images/8.jpg',
      '../../images/9.jpg',
      '../../images/10.jpg',
    ]
  },


  onLoad: function() {
    var that = this;
    var ctx = wx.createCanvasContext('myCanvas');
    var ctx2 = wx.createCanvasContext('myCanvas2');

    var multiple = that.data.multiple;
    var grid = that.data.grid;
    var maxWidth = that.data.maxWidth;


    // 给两个canvas先填充上颜色，避免最后保存时，产生黑色背景
    ctx.setFillStyle('#fff')
    ctx.fillRect(0, 0, maxWidth, maxWidth)
    ctx.draw()

    ctx2.setFillStyle('#fff')
    ctx2.fillRect(0, 0, maxWidth * multiple, maxWidth * multiple)
    ctx2.draw()

    // 调用重置方法，画出心形
    that.reset();

    // 画出所有网格
    // for (var i = 0; i < 10; i++) {
    //   ctx.moveTo(i * grid, 0);
    //   ctx.lineTo(i * grid, maxWidth);
    //   ctx.stroke();

    //   ctx.moveTo(0, i * grid);
    //   ctx.lineTo(maxWidth, i * grid);
    //   ctx.stroke();

    //   ctx2.moveTo(i * grid * multiple, 0);
    //   ctx2.lineTo(i * grid * multiple, maxWidth * multiple);
    //   ctx2.stroke();

    //   ctx2.moveTo(0, i * grid * multiple);
    //   ctx2.lineTo(315 * multiple, i * grid * multiple);
    //   ctx2.stroke();
    // }
  },

  // 点击心形，选择一张图片 
  oneImg: function(e) {
    const ctx = wx.createCanvasContext('myCanvas')
    const ctx2 = wx.createCanvasContext('myCanvas2')

    var that = this;
    var multiple = that.data.multiple;
    var maxWidth = that.data.maxWidth;
    var grid = that.data.grid;
    var heart = that.data.heart;

    // 获取点击时 x 轴的值
    var x = e.changedTouches[0].x;
    // 获取点击时 y 轴的值
    var y = e.changedTouches[0].y;

    // 确定 x 轴是在第几个格子
    x = Math.floor(x / grid);

    // 确定 y 轴是在第几个格子
    y = Math.floor(y / grid);

    // 判断是不是在心形范围内
    if (!heart[y][x] > 0) {
      return;
    }

    // 选择图片
    wx.chooseImage({
      // 点击心形时，只能选一张图片
      count: 1,
      success: function(res) {
        console.log('res', res);
        var fileUrl = res.tempFilePaths[0];
        // 获取图片信息
        wx.getImageInfo({
          src: res.tempFilePaths[0],
          success: function(res) {
            console.log('图片信息', res);
            // 调用 drawImg 方法，画出选择的图片
            that.drawImg(fileUrl, res, x, y);

            // 点击心形区域，画的图片等级是3
            heart[y][x] = 3;
          }
        })
      }
    })
  },
  // 选择多张图片
  moreImg: function() {
    var that = this;
    var ctx = wx.createCanvasContext('myCanvas');
    var ctx2 = wx.createCanvasContext('myCanvas2');
    var multiple = that.data.multiple;
    var grid = that.data.grid;
    var heart = that.data.heart;

    // 选择图片
    wx.chooseImage({
      success: function(res) {
        console.log('res', res);
        // imgNum 表示选择的图片数量
        var imgNum = res.tempFilePaths.length;
        // 画一张图片，num 就+1
        var num = 0;
        for (let i = 0; i < heart.length; i++) {
          for (let j = 0; j < heart[i].length; j++) {
            // 当num >= imgNum 时，表示所有选择的图片都画完了
            if (num >= imgNum) {
              return;
            }

            if (heart[i][j] == 1) {
              let fileUrl = res.tempFilePaths[num++];
              // 获取图片信息
              wx.getImageInfo({
                src: fileUrl,
                success: function(res) {
                  console.log('图片信息', res);
                  // 调用 drawImg 方法，画出选择的图片
                  that.drawImg(fileUrl, res, j, i);

                  // 点击 选择多张图片 按钮，画的图片的等级是2
                  heart[i][j] = 2;
                }
              })
            }
          }
        }
      }
    })
  },
  // drawImg方法用来在canvas上画出选择的图片
  // fileUrl 是图片路径
  // res 是图片信息
  // x 表示 x轴第几个格子
  // y 表示 y轴第几个格子
  drawImg: function(fileUrl, res, x, y) {
    var that = this;
    var ctx = wx.createCanvasContext('myCanvas');
    var ctx2 = wx.createCanvasContext('myCanvas2');

    var multiple = that.data.multiple;
    var grid = that.data.grid;
    var heart = that.data.heart;


    var width = res.width;
    var height = res.height;

    //  如果图片不是正方形，只画中间的部分
    var sWidth = width > height ? height : width;
    var sx = 0;
    var sy = 0;
    if (width > height) {
      sx = (width - height) / 2;
    }
    if (width < height) {
      sy = (height - width) / 2;
    }

    ctx.drawImage(fileUrl, sx, sy, sWidth, sWidth, x * grid, y * grid, grid, grid);
    ctx.draw(true)

    ctx2.drawImage(fileUrl, sx, sy, sWidth, sWidth, x * grid * multiple, y * grid * multiple, grid * multiple, grid * multiple);
    ctx2.draw(true)
  },

  // 保存九张图片
  saveImg: function() {
    var that = this;
    var multiple = that.data.multiple;
    var grid = that.data.grid;
    var maxWidth = that.data.maxWidth;
    var width = grid * 3 * multiple;

    // 显示进度条，并禁用 保存 按钮
    that.setData({
      btnDis: true,
      progressVis: "block",
    })

    save(2, 2);

    function save(x, y) {
      if (y < 0) {
        --x;
        y = 2;
      }
      if (x < 0) {
        console.log("小于0 停止函数");
        return;
      }
      console.log("x和y", x, y);
      wx.canvasToTempFilePath({
        x: x * width,
        y: y * width,
        width: grid * 3 * multiple,
        height: grid * 3 * multiple,
        canvasId: 'myCanvas2',
        quality: 1,
        fileType: 'jpg',
        success: function(res) {
          console.log(res.tempFilePath)
          // 保存图片到相册
          wx.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success(res) {
              // 保存下一张
              save(x, --y);
              // 增加进度条的值
              that.progressAdd();
            },
            fail(res) {
              console.log(res.errMsg)
            }
          })
        }
      })
    }

  },
  // 进度条
  progressAdd: function() {
    var that = this;
    // 保存一张图片，进度条增加12
    that.setData({
      percent: that.data.percent + 12
    })

    // 进度条超过100，就把进度条的值改为0，并且隐藏了，并把 保存心形 按钮设置为可用
    if (that.data.percent > 100) {
      that.setData({
        percent: 0,
        btnDis: false,
        progressVis: "none",
      })
    }
  },
  // 分享
  onShareAppMessage: function(res) {
    return {
      title: '朋友圈，微博，抖音 都在玩的小程序！！！',
      path: '/pages/index/index'
    }
  },
  setBtn: function() {
    var that = this;
    wx.showActionSheet({
      itemList: ['补充图片', '重置'],
      success: function(res) {
        console.log(res.tapIndex);
        // 补充图片
        if (res.tapIndex == 0) {
          that.replenishImg();
        }

        // 重置，清除所有已经画的图片
        if (res.tapIndex == 1) {
          that.reset();
        }

      },
      fail: function(res) {
        console.log(res.errMsg)
      }
    })
  },
  // 补充图片
  replenishImg: function() {
    var that = this;
    var ctx = wx.createCanvasContext('myCanvas');
    var ctx2 = wx.createCanvasContext('myCanvas2');
    var multiple = that.data.multiple;
    var grid = that.data.grid;
    var maxWidth = that.data.maxWidth;

    var heart = that.data.heart;
    var images = that.data.images;
    var len = images.length - 1;

    // 获取 from 到 to 的随机数
    function randomNum(from, to) {
      var Range = to - from;
      var num = from + Math.round(Math.random() * Range);
      return num;
    }

    for (let i = 0; i < heart.length; i++) {
      for (let j = 0; j < heart[i].length; j++) {
        if (heart[i][j] == 1) {
          // 随机获取一张图片的路径
          let url = images[randomNum(0, len)];
          ctx.drawImage(url, j * grid, i * grid, grid, grid);
          ctx.draw(true)

          ctx2.drawImage(url, j * grid * multiple, i * grid * multiple, grid * multiple, grid * multiple)
          ctx2.draw(true)
        }
      }
    }
    //画出九宫格
    that.drawLine();
  },

  // 重置
  reset: function() {
    var that = this;
    var ctx = wx.createCanvasContext('myCanvas');
    var ctx2 = wx.createCanvasContext('myCanvas2');
    var multiple = that.data.multiple;
    var grid = that.data.grid;
    var maxWidth = that.data.maxWidth;
    var heartColor = that.data.heartColor;

    var heart = [
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 1, 1, 0, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1],
      [0, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 1, 1, 1, 0, 0],
      [0, 0, 0, 1, 1, 1, 0, 0, 0],
      [0, 0, 0, 0, 1, 0, 0, 0, 0],
    ];
    that.setData({
      heart: heart
    })
    for (let i = 0; i < heart.length; i++) {
      for (let j = 0; j < heart[i].length; j++) {
        if (heart[i][j] == 1) {
          ctx.rect(j * grid, i * grid, grid, grid);
          ctx.setFillStyle(heartColor)
          ctx.fill();

          ctx2.rect(j * grid * multiple, i * grid * multiple, grid * multiple, grid * multiple);
          ctx2.setFillStyle(heartColor)
          ctx2.fill()
        }
      }
    }
    ctx2.draw(true);
    ctx.draw(true);

    //画出九宫格
    that.drawLine();
  },
  // 画九宫格的线
  drawLine: function() {
    var that = this;
    var ctx = wx.createCanvasContext('myCanvas');
    var ctx2 = wx.createCanvasContext('myCanvas2');

    var multiple = that.data.multiple;
    var grid = that.data.grid;
    var maxWidth = that.data.maxWidth;
    var bgColor = that.data.bgColor;

    // 画出九宫格
    ctx.setStrokeStyle(bgColor);
    ctx2.setStrokeStyle(bgColor);
    for (var i = 1; i < 3; i++) {
      ctx.moveTo(i * grid * 3, 0);
      ctx.lineTo(i * grid * 3, maxWidth);
      ctx.stroke();

      ctx.moveTo(0, i * grid * 3);
      ctx.lineTo(maxWidth, i * grid * 3);
      ctx.stroke();

      // ctx2.moveTo(i * grid * multiple * 3, 0);
      // ctx2.lineTo(i * grid * multiple * 3, maxWidth * multiple);
      // ctx2.stroke();

      // ctx2.moveTo(0, i * grid * multiple * 3);
      // ctx2.lineTo(315 * multiple, i * grid * multiple * 3);
      // ctx2.stroke();
    }
    ctx.draw(true);
    ctx2.draw(true);
  }

})