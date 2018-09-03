# 九宫格心形拼图
这是一个微信小程序，用来生成九宫格心形的图片。

**扫码体验**

![](https://raw.githubusercontent.com/FEWY/jigsaw/master/images/readme0.jpg)  


微信小程序需要的代码，在 src 文件夹中。


#### 说明
前几天在朋友圈看到好几次这种图片。

![这里写图片描述](https://raw.githubusercontent.com/FEWY/jigsaw/master/images/readme1.jpg)  

这种图片，是用九张图片拼成的一个心形。   

感觉很有趣，就上网查了查怎么做，大部分的说法就是用美图秀秀的拼图功能来做， 在微信小程序中也有专门做心形拼图的小程序，我都试了试之后，感觉还可以更加简单一些，于是我就自己做了个小程序。

#### 实现小程序的思路 

1、有两个 canvas，一个小的 canvas 显示最后会是什么样子，一个大的 canvas 用来最后进行截图，生成图片，保存到相册。    
通过CSS的定位，把大的 canvas 移到屏幕外面不让用户看到就可以了。   
而如果用小的canvas 保存图片的话，最后的图片有些模糊。

2、canvas 可以看成一个 9 * 9 的网格，

![这里写图片描述](https://raw.githubusercontent.com/FEWY/jigsaw/master/images/readme2.jpg)

用一个叫 heart  的数组来表示就是这样的。

![这里写图片描述](https://raw.githubusercontent.com/FEWY/jigsaw/master/images/readme3.jpg)

用其中的小格子，来拼出心形，根据数组的内容在 canvas 上进行渲染。


#### 小程序的功能
这个小程序有 选择单张图片，选择多张图片，补充图片，保存图片，重置，推荐，意见反馈，这几个功能。

#### 选择单张图片
当用户点击心形区域的时候，就可以选择单张图片，调用 [wx.chooseImage](https://developers.weixin.qq.com/miniprogram/dev/api/media-picture.html) 就可以从本地相册选择图片，然后就把这张图，画在 canvas上，具体画的位置就是用户点击的位置。

在小的 canvas上绑定 [touchend](https://developers.weixin.qq.com/miniprogram/dev/framework/view/wxml/event.html?search-key=touchend) 事件，触发事件后，事件中有一个 [changedTouches](https://developers.weixin.qq.com/miniprogram/dev/framework/view/wxml/event.html) 属性，这是一个保存了，当前变化的触摸点信息的数组，这个数组中的元素有 x 和 y 属性，也就是触摸点距离 canvas 左上角的距离。
```
// 触摸点在 x 轴的值
var x = e.changedTouches[0].x;
// 触摸点在 y 轴的值
var y = e.changedTouches[0].y;
```

有 x 轴 和 y 轴的距离后，算出具体应该画在哪个格子上。
```
//grid 表示一个格子的宽度

// 确定 x 轴是在第几个格子
x = Math.floor(x / grid);

// 确定 y 轴是在第几个格子
y = Math.floor(y / grid);
```

知道在哪个格子画之后，就要确定画图片的哪部分了，因为所有的格子都是正方形的，但是用户选择的图片不一定是正方形，如果压缩成正方形会很难看，所以我画的时候，选择了正中间的部分来画，

通过 [wx.getImageInfo](https://developers.weixin.qq.com/miniprogram/dev/api/media-picture.html#wxgetimageinfoobject) 来获取图片信息，以短边为正方形的宽，然后从`（长边 - 短边）/2 ` 的地方来画。
```
// 获取图片的宽和高
var width = res.width;
var height = res.height;

//  如果图片不是正方形，只画中间的部分
// sWidth 表示正方形的宽
var sWidth = width > height ? height : width;
// sx 是源图像的矩形选择框的左上角 X 坐标
var sx = 0;
// sy 是源图像的矩形选择框的左上角 y 坐标
var sy = 0;
if (width > height) {
	sx = (width - height) / 2;
}
if (width < height) {
	sy = (height - width) / 2;
}
```
知道画什么，在哪里画之后，调用 [canvasContext.drawImage](https://developers.weixin.qq.com/miniprogram/dev/api/canvas/draw-image.html) 来画就可以了。


#### 选择多张图片
选择多张图片，同样是调用 [wx.chooseImage](https://developers.weixin.qq.com/miniprogram/dev/api/media-picture.html) 方法，成功选择多张图片后，返回的对象中有一个 [tempFilePaths](https://developers.weixin.qq.com/miniprogram/dev/api/media-picture.html#wxchooseimageobject) 属性，这个属性保存了，图片的本地文件路径列表。

![这里写图片描述](https://raw.githubusercontent.com/FEWY/jigsaw/master/images/readme4.jpg)

然后遍历 heart 数组，也就是保存心形数据的数组，如果数组中某个元素的值是1，也就是说在心形范围内，就按顺序从 tempFilePaths 中取一张图片画上去，画的时候同样的，如果不是正方形就只画中间的部分。

#### 补充图片
在 image 的文件中，有保存几张图片，用来补充心形，他们的路径保存在一个数组中。   
```
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
```  
然后就是遍历 heart 数组，如果数组的某个元素的值是1，就随机从这组图片中选择一张画上去。

画一张图片，画多张图片，补充图片，他们都是在 canvas 上画图片，为了避免已经画了图片的位置被覆盖，他们所画的图片的等级是不同的。
```
补充图片：1
画多张图片：2
画一张图片：3
```
等级高的可以覆盖等级低的，等级低的不能覆盖等级高的，同等级的，除了画多张图片的不能覆盖，其余的两种情况，都可以覆盖。

简单意思就是：
补充图片，补充完了之后，再补充会把原来补充的覆盖掉，但是用户选择的图片不会被覆盖掉。      
画多张图片，可以覆盖掉补充的图片，但用户选择的图片也不会覆盖掉。     
画一张图片，不管这个位置有没有图片，都会再画一张。        

#### 保存图片
保存图片的时候，就是按顺序对大的 canvas 进行截取，然后保存成图片，主要靠 [wx.canvasToTempFilePath](https://developers.weixin.qq.com/miniprogram/dev/api/canvas/temp-file.html)  这个API来实现，这个 API ，可以把当前画布指定区域的内容导出生成指定大小的图片，并返回文件路径。

**这里要注意几个细节**

1、为了避免最后保存的图片有黑色背景，最好开始的时候就在 canvas 上画一个 和 canvas 大小一样的矩形，矩形填充上颜色。

2、为了保存的图片，在用户的相册中也能保持心形。需要按下面这个顺序来保存图片 

![这里写图片描述](https://raw.githubusercontent.com/FEWY/jigsaw/master/images/readme5.jpg)

3、[wx.canvasToTempFilePath](https://developers.weixin.qq.com/miniprogram/dev/api/canvas/temp-file.html) 中有两个选填的参数 destWidth 和 destHeight，这个两个参数决定 输出图片宽度和高度，如果不是准确的知道是多少，用默认值就可以。  

`destWidth` 和 `destHeight` 单位是物理像素（pixel），canvas 绘制的时候用的是逻辑像素（物理像素=逻辑像素 * density），所以这里如果只是使用 canvas 中的 width 和 height（逻辑像素）作为输出图片的长宽的话，生成的图片 width 和 height 实际上是缩放了到 canvas 的 `1 / density` 大小了，所以就显得比较模糊了。

而默认值是 width * 屏幕像素密度  

![这里写图片描述](https://raw.githubusercontent.com/FEWY/jigsaw/master/images/readme6.jpg)

[文档](https://developers.weixin.qq.com/miniprogram/dev/api/canvas/temp-file.html)中提到的屏幕像素密度，应该不是指每英寸屏幕所拥有的像素数，而是指设备像素比（pixelRatio），也就是用多少个物理像素去显示 1px 的 CSS 像素。
用API  [wx.getSystemInfo](https://developers.weixin.qq.com/miniprogram/dev/api/systeminfo.html#wxgetsysteminfoobject)  可以查看设备像素比
```
wx.getSystemInfo({
  success: function(res) {
    console.log(res.pixelRatio)
  }
})
```
这里如果我的理解有误，还请知道的小伙伴指出。

说了这么多，主要就是想说用默认的值其实就已经很清晰了。

4、因为要保存9张图片，所以需要一些时间，这个时候就需要一个进度条了，保存图片的时候，显示进度条，禁用保存按钮，毕竟点击一下按钮就是9张图片，所以这个时候还是禁用了好，每保存一张图片进度条的值就 +12 ，超过100的时候，就表示 9张图片都保存好了。

而微信小程序中也刚好有[进度条（progress）这个组件](https://developers.weixin.qq.com/miniprogram/dev/component/progress.html)。 

#### 重置
这个功能就是遍历 heart 数组，用一种颜色，根据数组内容，把心形画出来。然后再在 x 轴 和 y 轴上画两条线，行成九宫格的样子。

#### 推荐 和 意见反馈
```
 <button open-type='share'>推荐给朋友</button>
 <button open-type='feedback'>意见反馈
```
这个两个功能就是用了，微信小程序的 [button 组件](https://developers.weixin.qq.com/miniprogram/dev/component/button.html)，这里需要注意的就是，在清除 button 的默认样式时，需要把 `button 的 after` 伪元素的边框也去掉。
```
button::after{
  border: 0; 
}
```

#### 可以优化的地方
有一些地方是小程序在替用户做选择，比如，如果所选择的图片不是正方形，就画中间的部分，但是中间的部分不一定是用户想要的，而如果每张图片都要用户自己来选择画哪部分，显然是有些麻烦了，这里还可以继续优化下。 
 
还有在补充图片的时候，补充的图片也不一定是用户喜欢的，所以这部分再考虑是不是可以加一些标签，用户选择不同的标签，来补充符合标签的图片，类似 QQ音乐的歌词海报这样。 

![这里写图片描述](https://raw.githubusercontent.com/FEWY/jigsaw/master/images/readme7.jpg)     

#### 总结
这次做的这个九宫格心形拼图的小程序，第一版已经上线了。

![](https://raw.githubusercontent.com/FEWY/jigsaw/master/images/readme0.jpg)

这个小程序不管在代码，还是功能上都还有许多地方可以继续优化，如果有需要的朋友可以直接拿去改。

如果你喜欢这个小程序的话，可以 star 支持一下。


目前，这个小程序有进行一些优化，具体可以点这里。

如果需要最开始的版本，请到[这里](https://github.com/FEWY/jigsaw/tree/3767780059b20c81caa573da5b7730521090cc7b)