# area-map

在父级盒子，通过鼠标左键拖拽画出矩形，形成可跳转链接的热区，双击矩形可编辑跳转属性。
通过鼠标拖拽，可实现矩形的移动、伸缩

## Build Setup

``` bash
# install dependencies
npm install area-map

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build
```

安装后引入： 
javascript:

import AreaMap from 'area-map'
export default {
  components: {
    AreaMap
  },
  data () {
    return {
      hrefInitData: []
    }
  },
  methods: {
    saveHrefData (data) {
      console.log(data)
    }
  }
}

模版： 

<area-map @saveData="saveHrefData" :initData="hrefInitData"></area-map>
其中 @saveData="saveHrefData" 绑定保存数据回调时间， :initData="hrefInitData" 绑定初始化热区数据
