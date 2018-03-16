// pages/uploadImg/uploadImg.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrl: '../../images/example.png',
    stickers: ['../../images/sticker/1.png',
      '../../images/sticker/2.png',
      '../../images/sticker/3.png',
      '../../images/sticker/4.png',
      '../../images/sticker/5.png',
      '../../images/sticker/6.png',
      '../../images/sticker/7.png',
      '../../images/sticker/8.png',
      '../../images/sticker/9.png',
      '../../images/sticker/10.png',
      '../../images/sticker/11.png'],

    x: 160,
    y: 50,
    chosedImg: false,
    stv: {
      offsetX: 160,
      offsetY: 50,
      zoom: false, //是否缩放状态
      distance: 0,  //两指距离
      scale: 1,  //缩放倍数
      width: 50,
      height: 50,
    },
  },
  // 第一张贴图触摸开始
  touchstartCallback: function (e) {
    //console.log('touchstartCallback');
    //console.log(e);
    if (e.touches.length === 1) {
      let { clientX, clientY } = e.touches[0];
      this.startX = clientX;
      this.startY = clientY;
      this.touchStartEvent = e.touches;
    } else {
      let xMove = e.touches[1].clientX - e.touches[0].clientX;
      let yMove = e.touches[1].clientY - e.touches[0].clientY;
      let distance = Math.sqrt(xMove * xMove + yMove * yMove);
      this.setData({
        'stv.distance': distance,
        'stv.zoom': true, //缩放状态
      })
    }
  },

  // 第一张贴图触摸移动中
  touchmoveCallback: function (e) {
    //console.log('touchmoveCallback');
    //console.log(e);
    if (e.touches.length === 1) {
      //单指移动
      if (this.data.stv.zoom) {
        //缩放状态，不处理单指
        return;
      }
      let { clientX, clientY } = e.touches[0];
      let offsetX = clientX - this.startX;
      let offsetY = clientY - this.startY;
      this.startX = clientX;
      this.startY = clientY;
      let { stv } = this.data;
      stv.offsetX += offsetX;
      stv.offsetY += offsetY;
      stv.offsetLeftX = -stv.offsetX;
      stv.offsetLeftY = -stv.offsetLeftY;
      var nowWidth = this.data.stv.width;
      var maxoffsetX = 320 - nowWidth;
      var nowHeight = this.data.stv.height;
      var maxoffsetY = 178.125 - nowHeight;

      if (stv.offsetX > maxoffsetX) {
        stv.offsetX = maxoffsetX;
      } else if (stv.offsetX < 0) {
        stv.offsetX = 0;
      }
      if (stv.offsetY > maxoffsetY) {
        stv.offsetY = maxoffsetY;
      } else if (stv.offsetY < 0) {
        stv.offsetY = 0;
      }
      this.setData({
        stv: stv
      });

    } else {
      //双指缩放
      let xMove = e.touches[1].clientX - e.touches[0].clientX;
      let yMove = e.touches[1].clientY - e.touches[0].clientY;
      let distance = Math.sqrt(xMove * xMove + yMove * yMove);

      let distanceDiff = distance - this.data.stv.distance;
      let newScale = this.data.stv.scale + 0.005 * distanceDiff;
      if (newScale < 0.5) {
        newScale = 0.5;
      }
      if (newScale > 4) {
        newScale = 4;
      }
      let newWidth = newScale * 50;
      let newHeight = newScale * 50;

      this.setData({
        'stv.distance': distance,
        'stv.scale': newScale,
        'stv.width': newWidth,
        'stv.height': newWidth,
      })
      //console.log(this.data.stv.scale)
    }
  },

  // 第一张贴图触摸结束
  touchendCallback: function (e) {
    // console.log('touchendCallback');
    //console.log(e);
    if (e.touches.length === 0) {
      this.setData({
        'stv.zoom': false, //重置缩放状态
      })
    }
  },

  //切换贴纸
  changeImg: function (e) {
    var $img = e.currentTarget.dataset.url;
    var chosedImg = this.data.chosedImg;
    this.setData({
      x: 160,
      y: 50,
      stv: {
        offsetX: 160,
        offsetY: 50,
        zoom: false, //是否缩放状态
        distance: 0,  //两指距离
        scale: 1,  //缩放倍数
        width: 50,
        height: 50,
      },
        chosedImg: $img,
    })
  },

  //取消贴纸
  cancel: function () {
    this.setData({
      chosedImg: false,
      x: 150,
      y: 75,
      stv: {
        offsetX: 75,
        offsetY: 75,
        zoom: false, //是否缩放状态
        distance: 0,  //两指距离
        scale: 1,  //缩放倍数
        width: 50,
        height: 50,
      }
    })
  },

  //将贴纸绘制到canvas的固定
  setSticker: function (context) {
    var Sticker = this.data.chosedImg;
    var newtop = this.data.stv.offsetX * 2;
    var newleft = this.data.stv.offsetY * 2;
    var newswidth = this.data.stv.width * 2;
    var newheight = this.data.stv.height * 2;
    context.drawImage(Sticker, newtop, newleft, newswidth, newheight)
    context.save();
    context.restore();
    context.stroke();
  },

  //将canvas转换为图片保存到本地，然后将图片路径传给image图片的src
  createNewImg: function (imgUrl) {
    var that = this;
    var chosedImg = this.data.chosedImg;
    var path = imgUrl;
    var context = wx.createCanvasContext('mycanvas');

    //防止锯齿，绘的图片是所需图片的两倍
    context.drawImage(path, 0, 0, 640, 356.266);

    //如果有贴纸则绘制贴纸
    if (chosedImg) {
      this.setSticker(context);
    }
    //绘制图片
    context.draw();

    //将生成好的图片保存到本地，需要延迟一会，绘制期间耗时
    setTimeout(function () {
      wx.canvasToTempFilePath({
        canvasId: 'mycanvas',
        success: function (res) {
          var tempFilePath = res.tempFilePath;
          console.log(tempFilePath);
          that.setData({
            imagePath: tempFilePath,
          })
          wx.navigateTo({
            url: '/pages/detail/detail?path=' + tempFilePath,
          })
        },
        fail: function (res) {
          console.log(res);
        },
        complete:function(e){
          wx.hideLoading();
        }
      });
    }, 200);

  },

  //点击保存按钮
  save: function () {
    var that = this;
    wx.showLoading({
      title: '创建中...',
      duration: 10000,
    })
    var imgUrl = that.data.imgUrl
    that.createNewImg(imgUrl);
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})