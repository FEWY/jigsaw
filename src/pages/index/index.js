//index.js
const WeCropper = require('../../we-cropper/we-cropper.js');
const shape = require('../../utils/shape.js');
const device = wx.getSystemInfoSync();
const ctx = wx.createCanvasContext('myCanvas');
const ctx2 = wx.createCanvasContext('myCanvas2');
// 大的canvas 是 小的canvas 的 multiple 倍
const multiple = 3;
// 一个格子的宽度，也就是 小的canvas的宽度/9
const grid = 35;
// 小canvas的宽度
const maxWidth = 315;
// 初始时拼图形状的颜色
const heartColor = '#FF9CC2';
// 在小canvas上画的线的颜色
const lineColor = '#93E0FE';
Page({
  data: {
    // 拼图形状的数组
    heart: [],
    // 判断 保存图片 按钮，是否禁用
    btnDis: false,
    // 是否显示进度条
    progressVis: true,
    // 进度条的进度 
    percent: 0,
    // 保存用户选择的图片的路径
    chooseImgUrl: {},
    // 补充拼图形状的图片
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
    // 判断裁剪的 canvas 是否显示
    wrapperHidden: true,
    // 保存裁剪后的图片，在拼图形状中的位置
    tailorPosition: {
      x: "",
      y: ""
    },
    // 判断拼图形状 canvas 是否显示
    canvasHidden: false,
    // 用户选的是第几个拼图形状
    shapeIndex: "",
    // 默认所选的拼图形状是第一个
    defaultShapeIndex: 0,
  },

  onLoad: function () {
    let that = this;
    let defaultShapeIndex = that.data.defaultShapeIndex;
    that.setData({
      heart: JSON.parse(JSON.stringify(shape.shapeData[defaultShapeIndex])),
    })

    that.setData({
      imgArr2: [...that.data.imgArr0, ...that.data.imgArr1]
    })
    // 获取用户选择的拼图形状
    that.getShapeIndex();
    // 更新通知
    that.notice();

    const {
      cropperOpt
    } = this.data

    new WeCropper(cropperOpt)
      .on('ready', function (ctx) {
        console.log(`wecropper is ready for work!`)
      })
      .on('beforeImageLoad', (ctx) => {
        wx.showToast({
          title: '加载中...',
          icon: 'loading',
          duration: 2000
        })
      })
      .on('imageLoad', (ctx) => {
        wx.hideToast();
      })
  },

  onShow: function () {
    // 获取用户选择的拼图形状
    this.getShapeIndex();
  },

  // 点击拼图形状，选择一张图片 
  oneImg: function (e) {
    let that = this;
    let heart = that.data.heart;

    // 获取点击时 x 轴的值
    let x = e.changedTouches[0].x;
    // 获取点击时 y 轴的值
    let y = e.changedTouches[0].y;

    // 确定 x 轴是在第几个格子
    x = Math.floor(x / grid);
    // 确定 y 轴是在第几个格子
    y = Math.floor(y / grid);

    // 判断是不是在拼图形状范围内
    if (!heart[y][x] > 0) {
      return;
    }

    // 判断是手动裁剪，还是自动裁剪
    wx.getStorage({
      key: 'tailorIndex',
      success: function (res) {
        // 手动裁剪
        if (res.data == 1) {
          let tailorPosition = {
            x: x,
            y: y
          }
          // 调用裁剪的选择图片方法
          that.uploadTap();
          // 显示裁剪canvas，记录裁剪后图片在拼图形状中的位置，隐藏拼图形状 canvas
          that.setData({
            wrapperHidden: false,
            tailorPosition: tailorPosition,
            canvasHidden: true
          })
        } else {
          // 自动裁剪
          autoTailor()
        }
      },
      fail: function () {
        // 如果获取失败，就选择自动裁剪
        autoTailor();
      }
    })

    // 自动裁剪
    function autoTailor() {
      // 选择图片
      wx.chooseImage({
        // 点击拼图形状时，只能选一张图片
        count: 1,
        success: function (res) {
          let fileUrl = res.tempFilePaths[0];
          // 获取图片信息
          wx.getImageInfo({
            src: fileUrl,
            success: function (res) {
              // 调用 drawImg 方法，画出选择的图片
              that.drawImg(fileUrl, res, x, y);
              // 把选择的图片路径保存在 chooseImgUrl 中
              let chooseImgUrl = that.data.chooseImgUrl;
              chooseImgUrl['' + x + y] = fileUrl;
              that.setData({
                chooseImgUrl,
              })
              // 点击拼图形状区域，画的图片等级是3
              heart[y][x] = 3;
            }
          })
        }
      })
    }

  },
  // 选择多张图片
  moreImg: function () {
    let that = this;
    let heart = that.data.heart;

    // 选择图片
    wx.chooseImage({
      success: function (res) {
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
                success: function (res) {
                  // 调用 drawImg 方法，画出选择的图片
                  that.drawImg(fileUrl, res, j, i);
                  // 把选择的图片路径保存在 chooseImgUrl 中
                  let chooseImgUrl = that.data.chooseImgUrl;
                  chooseImgUrl['' + j + i] = fileUrl;
                  that.setData({
                    chooseImgUrl,
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
  drawImg: function (fileUrl, res, x, y) {
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
    ctx.draw(true);

    ctx2.drawImage(fileUrl, sx, sy, sWidth, sWidth, x * grid * multiple, y * grid * multiple, grid * multiple, grid * multiple);
    ctx2.draw(true);
  },

  // 保存图片
  saveImg: function () {
    let that = this;

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
              saveImg();
            },
            fail() {
              wx.showModal({
                content: '保存图片功能需要授权相册权限，请授权',
                success(res) {
                  if (res.confirm) {
                    wx.openSetting()
                  }
                }
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
        success: function (res) {
          if (res.data == 1) {
            // 保存为一张
            saveOne();
          } else if (res.data == 9) {
            // 保存为九张
            saveNine();
          }
        },
        fail: function (res) {
          saveNine();
        },
      })
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
        success: function (res) {
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
          })
        }
      })
    }
    // 保存为九张图片
    function saveNine() {
      let x = 2;
      let y = 2;
      // 显示进度条，并禁用 保存图片 按钮
      that.setData({
        btnDis: true,
        progressVis: false,
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
          x: x * maxWidth,
          y: y * maxWidth,
          width: maxWidth,
          height: maxWidth,
          canvasId: 'myCanvas2',
          quality: 1,
          fileType: 'jpg',
          success: function (res) {
            // 保存图片到相册
            wx.saveImageToPhotosAlbum({
              filePath: res.tempFilePath,
              success(res) {
                // 保存下一张
                save(--x, y);
                // 增加进度条的值
                that.progressAdd();
              },
            })
          }
        })
      }
    }

  },
  // 进度条
  progressAdd: function () {
    let that = this;
    // 保存一张图片，进度条增加12
    that.setData({
      percent: that.data.percent + 12
    })

    // 进度条超过100，就把进度条的值改为0，并且隐藏了，并把 保存图片 按钮设置为可用
    if (that.data.percent > 100) {
      that.setData({
        percent: 0,
        btnDis: false,
        progressVis: true,
      })
    }
  },
  // 分享
  onShareAppMessage: function (res) {
    return {
      title: '朋友圈，微博，抖音 都在玩的小程序！！！',
      path: '/pages/index/index',
      imageUrl: '../../images/sharImg.jpg'
    }
  },
  // 更新通知
  notice: function () {
    wx.getStorage({
      key: 'notice',
      fail: function () {
        wx.showModal({
          confirmColor: "#66a6ff",
          cancelColor: "#cccccc",
          content: '你要试试 自定义拼图形状 吗？',
          success(res) {
            if (res.confirm) {
              wx.setStorage({
                key: 'notice',
                data: true,
              })
              wx.switchTab({
                url: "/pages/help/help",
              })
            }
          }
        })
      },
    })
  },

  // 点击补充按钮
  replenishBtn: function () {
    let that = this;
    wx.showActionSheet({
      itemList: ['补充图片', '重置'],
      success: function (res) {
        // 补充图片
        if (res.tapIndex == 0) {
          that.replenishImg();
        }
        // 重置，清除所有已经画的图片
        if (res.tapIndex == 1) {
          that.reset();
        }
      },
    })
  },

  // 补充图片
  replenishImg: function () {
    let that = this;
    let heart = that.data.heart;

    // 获取补充图片类型
    wx.getStorage({
      key: 'imgType',
      success: function (res) {
        let imgType = res.data;
        selType(imgType)
      },
      fail: function () {
        selType(0);
      }
    })

    // 判断补充图片类型
    function selType(imgType) {
      // 补充已选图片
      if (imgType == 3) {
        addSelImg();
      } else {
        // 获取补充图片路径的数组
        let tmp_images = that.data['imgArr' + imgType];
        // 补充除已选图片外的其他类型
        draw(tmp_images);
      }
    }

    // 补充已选图片
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
      wx.showLoading({
        title: '加载中',
      })

      for (let k in chooseImgUrl) {
        tmp_images.push(chooseImgUrl[k]);
      }

      let len = tmp_images.length - 1;
      for (let i = 0; i < heart.length; i++) {
        for (let j = 0; j < heart[i].length; j++) {
          if (heart[i][j] == 1) {
            // 随机选取一张用户选择的图片
            let fileUrl = tmp_images[randomNum(0, len)];
            // 获取图片信息
            wx.getImageInfo({
              src: fileUrl,
              success: function (res) {
                // 调用 drawImg 方法，用临时路径画出图片
                that.drawImg(fileUrl, res, j, i);
              }
            })
          }
        }
      }
      wx.hideLoading();
    }

    // 补充除已选图片外的其他类型
    function draw(tmp_images) {
      if (tmp_images.length == 0) {
        return;
      }
      wx.showLoading({
        title: '加载中',
      })
      let len = tmp_images.length - 1;
      for (let i = 0; i < heart.length; i++) {
        for (let j = 0; j < heart[i].length; j++) {
          if (heart[i][j] == 1) {
            // 随机获取一张图片的路径
            let url = tmp_images[randomNum(0, len)];
            // 在canvas上画出补充的图片
            ctx.drawImage(url, j * grid, i * grid, grid, grid);
            ctx.draw(true);

            ctx2.drawImage(url, j * grid * multiple, i * grid * multiple, grid * multiple, grid * multiple);
            ctx2.draw(true);
          }
        }
      }
      // 画九宫格的线
      that.drawLine();
      wx.hideLoading();
    }
    // 获取 from 到 to 的随机数
    function randomNum(from, to) {
      let Range = to - from;
      let num = from + Math.round(Math.random() * Range);
      return num;
    }
  },

  // 获取用户选择的拼图形状
  getShapeIndex: function () {
    let that = this;
    wx.getStorage({
      key: 'shapeIndex',
      success: function (res) {
        let shapeIndex = that.data.shapeIndex;
        if (shapeIndex !== res.data) {
          that.setData({
            shapeIndex: res.data
          })
          that.getShapeData(res.data);
        }
      },
      fail: function () {
        // 设置默认拼图形状
        that.setDefaultShapeData();
      },
    })
  },
  // 获取存储的拼图形状数据
  getShapeData: function (shapeIndex) {
    let that = this;
    wx.getStorage({
      key: 'shapeData',
      success: function (res) {
        let shapeData = res.data;
        if (shapeData[shapeIndex]) {
          let data = JSON.parse(JSON.stringify(shapeData[shapeIndex]));
          that.setData({
            heart: data
          })
        }
        // 调用重置方法，重置拼图形状
        that.reset();
      },
    })
  },
  // 设置默认拼图形状
  setDefaultShapeData: function () {
    let defaultShapeIndex = this.data.defaultShapeIndex;
    let data = JSON.parse(JSON.stringify(shape.shapeData[defaultShapeIndex]));
    this.setData({
      heart: data,
    })
    wx.setStorage({
      key: 'shapeIndex',
      data: defaultShapeIndex,
    })
    wx.setStorage({
      key: 'shapeData',
      data: shape.shapeData,
    })
    // 调用重置方法，重置拼图形状
    this.reset();
  },
  // 重置
  reset: function () {
    let heart = this.data.heart;

    // 给两个canvas先填充上颜色，避免最后保存时，产生黑色背景
    ctx.setFillStyle('#ffffff');
    ctx.fillRect(0, 0, maxWidth, maxWidth);
    ctx.draw();

    ctx2.setFillStyle('#ffffff');
    ctx2.fillRect(0, 0, maxWidth * multiple, maxWidth * multiple);
    ctx2.draw();

    this.setData({
      chooseImgUrl: {},
    })
    // 重置，画出拼图形状
    for (let i = 0; i < heart.length; i++) {
      for (let j = 0; j < heart[i].length; j++) {
        if (heart[i][j] != 0) {
          ctx.rect(j * grid, i * grid, grid, grid);
          ctx.setFillStyle(heartColor);
          ctx.fill();

          ctx2.rect(j * grid * multiple, i * grid * multiple, grid * multiple, grid * multiple);
          ctx2.setFillStyle(heartColor);
          ctx2.fill();

          heart[i][j] = 1;
        }
      }
    }
    ctx.draw(true);
    ctx2.draw(true);
    // 画九宫格的线
    this.drawLine();
  },
  // 画九宫格的线
  drawLine: function () {
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
      wx.showTabBar();
      if (src) {
        that.setData({
          wrapperHidden: true,
          canvasHidden: false
        });
        // 在拼图形状上画出裁剪的图片
        that.drawTailorImg(src);
      }
    })
  },
  uploadTap() {
    let that = this;
    wx.hideTabBar();
    that.wecropper.updateCanvas();
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success(res) {
        let src = res.tempFilePaths[0];
        that.wecropper.pushOrign(src);
      },
      fail() {
        that.setData({
          wrapperHidden: true,
          canvasHidden: false
        });
        wx.showTabBar();
      }
    })
  },

  // 在拼图形状上画出裁剪的图片
  drawTailorImg: function (url) {
    let heart = this.data.heart;
    let x = this.data.tailorPosition.x;
    let y = this.data.tailorPosition.y;
    let chooseImgUrl = this.data.chooseImgUrl;
    chooseImgUrl['' + x + y] = url;
    this.setData({
      chooseImgUrl,
    })

    ctx.drawImage(url, x * grid, y * grid, grid, grid);
    ctx.draw(true)

    ctx2.drawImage(url, x * grid * multiple, y * grid * multiple, grid * multiple, grid * multiple)
    ctx2.draw(true)

    heart[y][x] = 3;
  }
})