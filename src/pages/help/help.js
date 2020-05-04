//help.js
const arrowsUp = "../../images/arrows_up.png";
const arrowsDown = "../../images/arrows_down.png";
Page({
  data: {
    Q1: true,
    Q1Class: "show",
    Q1src: arrowsUp,
    Q2: false,
    Q2Class: "hidden",
    Q2src: arrowsDown,
    Q3: false,
    Q3Class: "hidden",
    Q3src: arrowsDown,
  },

  // 分享
  onShareAppMessage: function(res) {
    return {
      title: '朋友圈，微博，抖音 都在玩的小程序！！！',
      path: '/pages/index/index',
      imageUrl: '../../images/sharImg.jpg'
    }
  },

  // 点击问题 显示或隐藏
  toggle: function(e) {
    let str = e.currentTarget.dataset.str;
    let Q = this.data[str];
    let obj = {};
    let classStr = str + "Class";
    let srcStr = str + "src";
    if(Q){
      obj[classStr] = "hidden";
      obj[str] = false;
      obj[srcStr] = arrowsDown;
    } else {
      obj[classStr] = "show";
      obj[str] = true;
      obj[srcStr] = arrowsUp;
    }
    this.setData(obj)
  },
})