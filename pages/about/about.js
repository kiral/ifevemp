

var Api = require('../../utils/api.js');
var util = require('../../utils/util.js');
var WxParse = require('../../wxParse/wxParse.js');
var wxApi = require('../../es6-promise/utils/wxApi.js')
var wxRequest = require('../../es6-promise/utils/wxRequest.js')


Page({
  data: {
    title: '页面内容',
    pageData: {},
    pagesList: {},
    hidden: false,
    wxParseData: []
  },
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '关于并发编程网',
      success: function (res) {
        // success
      }
    });
    this.fetchData(1136);

  },
  onShareAppMessage: function () {
    return {
      title: '关于并发编程网',
      path: 'pages/about/about',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  //给a标签添加跳转和复制链接事件
  wxParseTagATap: function (e) {
      var self = this;
      var href = e.currentTarget.dataset.src;
      console.log(href);
      var domain = Api.getDomain();
      //我们可以在这里进行一些路由处理
      if (href.indexOf(domain) == -1) {
          wx.setClipboardData({
              data: href,
              success: function (res) {
                  wx.getClipboardData({
                      success: function (res) {
                          wx.showToast({
                              title: '链接已复制',
                              //icon: 'success',
                              image: '../../images/link.png',
                              duration: 2000
                          })
                      }
                  })
              }
          })
      }
      else {

          var slug = util.GetUrlFileName(href, domain);
          if (slug == 'index') {
              wx.switchTab({
                  url: '../index/index'
              })
          }
          else {

              var getPostSlugRequest = wxRequest.getRequest(Api.getPostBySlug(slug));
              getPostSlugRequest
                  .then(res => {

                      var postID = res.data[0].id;
                      var openLinkCount = wx.getStorageSync('openLinkCount') || 0;
                      if (openLinkCount > 4) {
                          wx.redirectTo({
                              url: '../detail/detail?id=' + postID
                          })
                      }
                      else {
                          wx.navigateTo({
                              url: '../detail/detail?id=' + postID
                          })
                          openLinkCount++;
                          wx.setStorageSync('openLinkCount', openLinkCount);
                      }

                  })

          }




      }

  },
  fetchData: function (id) {
    var self = this;
    self.setData({
      hidden: false
    });

    var getPageRequest = wxRequest.getRequest(Api.getPageByID(id));

    getPageRequest.then(response =>{
        console.log(response);
        self.setData({
            pageData: response.data,
            // wxParseData: WxParse('md',response.data.content.rendered)
            wxParseData: WxParse.wxParse('article', 'html', response.data.content.rendered, self, 5)
        });
        setTimeout(function () {
            self.setData({
                hidden: true
            });
        }, 300);
    })
    
  }
})