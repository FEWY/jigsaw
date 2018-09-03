//index.js
//获取应用实例
const app = getApp()
import WeCropper from '../../we-cropper/we-cropper.js'
const device = wx.getSystemInfoSync()
Page({
  data: {
    // 表示九宫格心形的数组
    heart: [],
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
    // 在小canvas上画的线的颜色
    lineColor: '#93E0FE',
    // 初始时心形的颜色
    heartColor: '#FF9CC2',
    // 保存用户选择的图片路径
    chooseImgUrl: {},
    // 用来补充心形的图片
    imgArr0: [
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
    ],
    imgArr1: [
      '../../images/x1.jpg',
      '../../images/x2.jpg',
      '../../images/x3.jpg',
      '../../images/x4.jpg',
      '../../images/x5.jpg',
      '../../images/x6.jpg',
      '../../images/x7.jpg',
      '../../images/x8.jpg',
      '../../images/x9.jpg',
      '../../images/x10.jpg',
    ],
    // 保存 imgArr0 和 imgArr1 的元素
    imgArr2: [],
    // 裁剪数据
    cropperOpt: {
      id: 'cropper',
      width: device.windowWidth,
      height: device.windowWidth,
      scale: 2.5,
      zoom: 8,
    },
    // 用来判断裁剪的 canvas 是否显示
    wrapperHidden: true,
    // 保存裁剪后的图片，在心形中的位置
    tailorPosition: {
      x: "",
      y: ""
    },
    // 用来判断心形 canvas 是否显示
    canvasHidden: false
  },


  onLoad: function(option) {
    let that = this;
    let ctx = wx.createCanvasContext('myCanvas');
    let ctx2 = wx.createCanvasContext('myCanvas2');

    let multiple = that.data.multiple;
    let grid = that.data.grid;
    let maxWidth = that.data.maxWidth;

    that.setData({
      imgArr2: [...that.data.imgArr0, ...that.data.imgArr1]
    })

    // 给两个canvas先填充上颜色，避免最后保存时，产生黑色背景
    ctx.setFillStyle('#ffffff')
    ctx.fillRect(0, 0, maxWidth, maxWidth)
    ctx.draw()

    ctx2.setFillStyle('#ffffff')
    ctx2.fillRect(0, 0, maxWidth * multiple, maxWidth * multiple)
    ctx2.draw()

    // 调用重置方法，画出心形
    that.reset();

    const {
      cropperOpt
    } = this.data

    new WeCropper(cropperOpt)
      .on('ready', function(ctx) {
        console.log(`wecropper is ready for work!`)
      })
      .on('beforeImageLoad', (ctx) => {
        console.log(`before picture loaded, i can do something`)
        console.log(`current canvas context:`, ctx)

        wx.showToast({
          title: '加载中...',
          icon: 'loading',
          duration: 2000
        })
      })
      .on('imageLoad', (ctx) => {
        console.log(`picture loaded`)
        console.log(`current canvas context:`, ctx)
        wx.hideToast()
      })



  },

  // 点击心形，选择一张图片 
  oneImg: function(e) {
    const ctx = wx.createCanvasContext('myCanvas')
    const ctx2 = wx.createCanvasContext('myCanvas2')

    let that = this;
    let multiple = that.data.multiple;
    let maxWidth = that.data.maxWidth;
    let grid = that.data.grid;
    let heart = that.data.heart;


    // 获取点击时 x 轴的值
    let x = e.changedTouches[0].x;
    // 获取点击时 y 轴的值
    let y = e.changedTouches[0].y;

    // 确定 x 轴是在第几个格子
    x = Math.floor(x / grid);

    // 确定 y 轴是在第几个格子
    y = Math.floor(y / grid);

    // 判断是不是在心形范围内
    if (!heart[y][x] > 0) {
      return;
    }

    // 判断是手动裁剪，还是自动裁剪
    wx.getStorage({
      key: 'tailorIndex',
      success: function(res) {
        // 手动裁剪
        if (res.data == 1) {
          let tailorPosition = {
            x: x,
            y: y
          }
          // 调用裁剪的选择图片方法
          that.uploadTap();
          // 显示裁剪canvas，记录裁剪后图片在心形中的位置，隐藏心形 canvas
          that.setData({
            wrapperHidden: false,
            tailorPosition: tailorPosition,
            canvasHidden: true
          })

          wx.hideTabBar();
        } else {
          // 自动裁剪
          autoTailor()
        }
      },
      fail: function() {
        // 如果获取失败，就选择自动裁剪
        autoTailor()
      }
    })

    function autoTailor() {
      // 选择图片
      wx.chooseImage({
        // 点击心形时，只能选一张图片
        count: 1,
        success: function(res) {
          console.log('res', res);
          let fileUrl = res.tempFilePaths[0];
          // 获取图片信息
          wx.getImageInfo({
            src: res.tempFilePaths[0],
            success: function(res) {
              console.log('图片信息', res);
              // 调用 drawImg 方法，画出选择的图片
              that.drawImg(fileUrl, res, x, y);

              // 把选择的图片路径保存在 chooseImgUrl 中
              let chooseImgUrl = that.data.chooseImgUrl;
              chooseImgUrl['' + x + y] = fileUrl;

              that.setData({
                chooseImgUrl: chooseImgUrl
              })
              // 点击心形区域，画的图片等级是3
              heart[y][x] = 3;
            }
          })
        }
      })
    }



  },
  // 选择多张图片
  moreImg: function() {
    let that = this;
    let ctx = wx.createCanvasContext('myCanvas');
    let ctx2 = wx.createCanvasContext('myCanvas2');
    let multiple = that.data.multiple;
    let grid = that.data.grid;
    let heart = that.data.heart;

    // 选择图片
    wx.chooseImage({
      success: function(res) {
        console.log('res', res);
        // imgNum 表示选择的图片数量
        let imgNum = res.tempFilePaths.length;
        // 画一张图片，num 就+1
        let num = 0;
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

                  // 把选择的图片路径保存在 chooseImgUrl 中
                  let chooseImgUrl = that.data.chooseImgUrl;
                  chooseImgUrl['' + j + i] = fileUrl;

                  that.setData({
                    chooseImgUrl: chooseImgUrl
                  })

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
    let that = this;
    let ctx = wx.createCanvasContext('myCanvas');
    let ctx2 = wx.createCanvasContext('myCanvas2');

    let multiple = that.data.multiple;
    let grid = that.data.grid;
    let heart = that.data.heart;

    let width = res.width;
    let height = res.height;

    //  如果图片不是正方形，只画中间的部分
    let sWidth = width > height ? height : width;
    let sx = 0;
    let sy = 0;
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
    let that = this;
    let multiple = that.data.multiple;
    let grid = that.data.grid;
    let maxWidth = that.data.maxWidth;
    let width = grid * 3 * multiple;

    // 查看是否有保存到相册权限
    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.writePhotosAlbum']) {
          // 有保存到相册的权限，就保存图片
          saveImg()
        } else {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success() {
              console.log('获取授权成功')
              saveImg()
            },
            fail() {
              console.log('获取授权失败')
              wx.showToast({
                title: '请先打开保存权限',
                icon: 'none',
                duration: 2000
              })
            }
          })
        }
      }
    })

    function saveImg() {
      // 判断是保存一张还是保存九张
      wx.getStorage({
        key: 'saveNum',
        success: function(res) {
          console.log(res);
          if (res.data == 1) {
            // 保存为一张
            saveOne();
          } else if (res.data == 9) {
            // 保存为九张
            saveNine(2, 2);
          }
        },
        fail: function(res) {
          console.log('fail', res);
          saveNine(2, 2);
        },
      })
    }



    // 保存为九张图片
    function saveNine(x, y) {
      // 显示进度条，并禁用 保存 按钮
      that.setData({
        btnDis: true,
        progressVis: "block",
      })
      save(x, y);

      function save(x, y) {
        if (x < 0) {
          --y;
          x = 2;
        }
        if (y < 0) {
          return;
        }
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
                save(--x, y);
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

    }


    // 保存为一张图片
    function saveOne() {
      wx.canvasToTempFilePath({
        x: 0,
        y: 0,
        width: maxWidth * multiple,
        height: maxWidth * multiple,
        canvasId: 'myCanvas2',
        fileType: 'jpg',
        success: function(res) {
          console.log(res.tempFilePath)
          // 保存图片到相册
          wx.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success(res) {
              wx.showToast({
                title: '保存成功',
                icon: 'success',
                duration: 2000
              })
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
    let that = this;
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
      path: '/pages/index/index',
      imageUrl: '../../images/sharImg.jpg'
    }
  },
  setBtn: function() {
    let that = this;
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
    let that = this;
    let ctx = wx.createCanvasContext('myCanvas');
    let ctx2 = wx.createCanvasContext('myCanvas2');
    let multiple = that.data.multiple;
    let grid = that.data.grid;
    let maxWidth = that.data.maxWidth;
    let heart = that.data.heart;

    // 获取补充图片类型
    wx.getStorage({
      key: 'imgType',
      success: function(res) {
        // console.log(res);
        let imgType = res.data;
        selType(imgType)
      },
      fail: function() {
        console.log('getStorage fail');
        selType(0);
      }
    })

    // 判断补充图片类型
    function selType(imgType) {
      // 补充已经选择的图片
      if (imgType == 3) {
        addSelImg()
      } else {
        wx.showLoading({
          title: '加载中',
        })

        // 获取图片路径数组
        let tmp_images = that.data['imgArr' + imgType];
        draw(tmp_images)

        wx.hideLoading();
      }
    }

    // 补充已经选择的图片
    function addSelImg() {
      let chooseImgUrl = that.data.chooseImgUrl;
      let tmp_images = [];

      if (Object.keys(chooseImgUrl).length == 0) {
        wx.showToast({
          title: '请先选择图片哦',
          icon: 'none',
          duration: 2000
        })
        return;
      }

      for (let k in chooseImgUrl) {
        tmp_images.push(chooseImgUrl[k])
      }

      wx.showLoading({
        title: '加载中',
      })

      let len = tmp_images.length - 1;
      for (let i = 0; i < heart.length; i++) {
        for (let j = 0; j < heart[i].length; j++) {
          if (heart[i][j] == 1) {
            // 随机选取一张用户选择的图片
            let fileUrl = tmp_images[randomNum(0, len)];
            // 获取图片信息
            wx.getImageInfo({
              src: fileUrl,
              success: function(res) {
                console.log('图片信息', res);
                // 调用 drawImg 方法，用临时路径画出图片
                that.drawImg(fileUrl, res, j, i);
              }
            })
          }
        }
        // 心形补充完后，隐藏加载状态
        if (i == heart.length - 1) {
          wx.hideLoading();
        }
      }
    }

    function draw(tmp_images) {
      if (tmp_images.length == 0) {
        return;
      }

      let len = tmp_images.length - 1;
      for (let i = 0; i < heart.length; i++) {
        for (let j = 0; j < heart[i].length; j++) {
          if (heart[i][j] == 1) {
            // 随机获取一张图片的路径
            let url = tmp_images[randomNum(0, len)];
            // 在canvas上画出补充的图片
            ctx.drawImage(url, j * grid, i * grid, grid, grid);
            ctx.draw(true)

            ctx2.drawImage(url, j * grid * multiple, i * grid * multiple, grid * multiple, grid * multiple)
            ctx2.draw(true)
          }
        }
      }
      //画出九宫格
      that.drawLine();
    }

    // 获取 from 到 to 的随机数
    function randomNum(from, to) {
      let Range = to - from;
      let num = from + Math.round(Math.random() * Range);
      return num;
    }
  },


  // 重置
  reset: function() {
    let that = this;
    let ctx = wx.createCanvasContext('myCanvas');
    let ctx2 = wx.createCanvasContext('myCanvas2');
    let multiple = that.data.multiple;
    let grid = that.data.grid;
    let maxWidth = that.data.maxWidth;
    let heartColor = that.data.heartColor;

    let heart = [
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
      heart: heart,
      chooseImgUrl: {},
    })

    // 重置，画出心形
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
    let that = this;
    let ctx = wx.createCanvasContext('myCanvas');
    let ctx2 = wx.createCanvasContext('myCanvas2');

    let multiple = that.data.multiple;
    let grid = that.data.grid;
    let maxWidth = that.data.maxWidth;
    let lineColor = that.data.lineColor;

    // 画出九宫格
    ctx.setStrokeStyle(lineColor);
    ctx2.setStrokeStyle(lineColor);
    for (let i = 1; i < 3; i++) {
      ctx.moveTo(i * grid * 3, 0);
      ctx.lineTo(i * grid * 3, maxWidth);
      ctx.stroke();

      ctx.moveTo(0, i * grid * 3);
      ctx.lineTo(maxWidth, i * grid * 3);
      ctx.stroke();
    }
    ctx.draw(true);
    ctx2.draw(true);
  },
  // 裁剪功能
  touchStart(e) {
    this.wecropper.touchStart(e)
  },
  touchMove(e) {
    this.wecropper.touchMove(e)
  },
  touchEnd(e) {
    this.wecropper.touchEnd(e)
  },
  getCropperImage() {
    let that = this;
    this.wecropper.getCropperImage((src) => {
      wx.showTabBar()
      if (src) {
        that.setData({
          wrapperHidden: true,
          canvasHidden: false
        });
        console.log('裁剪路径', src);
        // 画出裁剪的图片
        that.drawTailorImg(src);
      } else {
        console.log('获取图片地址失败，请稍后重试')

      }
    })
  },
  uploadTap() {
    const that = this
    that.wecropper.updateCanvas()
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success(res) {
        console.log('res.tempFilePaths[0]', res)
        const src = res.tempFilePaths[0]
        that.wecropper.pushOrign(src)
      },
      fail() {
        console.log('没有选择图片')
        that.setData({
          wrapperHidden: true,
          canvasHidden: false
        });
        wx.showTabBar()
      }
    })
  },

  // 画出裁剪的图片
  drawTailorImg: function(url) {
    let that = this;
    let ctx = wx.createCanvasContext('myCanvas');
    let ctx2 = wx.createCanvasContext('myCanvas2');
    let multiple = that.data.multiple;
    let grid = that.data.grid;
    let maxWidth = that.data.maxWidth;
    let heart = that.data.heart;

    let x = that.data.tailorPosition.x;
    let y = that.data.tailorPosition.y;

    let chooseImgUrl = that.data.chooseImgUrl;
    chooseImgUrl['' + x + y] = url;

    that.setData({
      chooseImgUrl: chooseImgUrl
    })

    ctx.drawImage(url, x * grid, y * grid, grid, grid);
    ctx.draw(true)

    ctx2.drawImage(url, x * grid * multiple, y * grid * multiple, grid * multiple, grid * multiple)
    ctx2.draw(true)

    heart[y][x] = 3;
  }
})