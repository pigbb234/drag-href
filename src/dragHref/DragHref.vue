<template>
  <div class="drag-component">
    <button @click="saveData" class="button-save">保存热区数据</button>
    <div
      class="canvas-content"
      id="canvasContent"
      ref="canvas"
      @mousedown="canvasStart($event)"
      @mousemove="canvasMove($event)"
      @mouseup="canvasOver"
      @mouseleave="canvasLeave"
    >
      <div
        class="canvas-outter"
        v-for="(item, index) in createLinkArr"
        :id="item.id"
        :style="item.style"
        :key="index"
      >
        <span
          class="border-area border-area-top"
          @mousedown.stop="changeSizeStart($event, item, 'top')"
          @mouseup="changeSizeOver"
        ></span>
        <span
          class="border-area border-area-right"
          @mousedown.stop="changeSizeStart($event, item, 'right')"
          @mouseup="changeSizeOver"
        ></span>
        <span
          class="border-area border-area-bottom"
          @mousedown.stop="changeSizeStart($event, item, 'bottom')"
          @mouseup="changeSizeOver"
        ></span>
        <span
          class="border-area border-area-left"
          @mousedown.stop="changeSizeStart($event, item, 'left')"
          @mouseup="changeSizeOver"
        ></span>
        <!-- 左上角 -->
        <span
          class="corner-area corner-area-lt"
          @mousedown.stop="changeSizeStart($event, item, 'lt')"
          @mouseup="changeSizeOver"
        ></span>
        <!-- 左下角 -->
        <span
          class="corner-area corner-area-lb"
          @mousedown.stop="changeSizeStart($event, item, 'lb')"
          @mouseup="changeSizeOver"
        ></span>
        <!-- 右下角 -->
        <span
          class="corner-area corner-area-rb"
          @mousedown.stop="changeSizeStart($event, item, 'rb')"
          @mouseup="changeSizeOver"
        ></span>
        <a class="canvas-item-a"></a>
        <div
          class="canvas-item"
          @mousedown.stop
          :draggable="true"
          @dragstart="dragStart"
          @dragover="dragMove($event, item, index)"
          @dragend="dragOver($event, item, index)"
          @dblclick="showHrefDialog(item)"
        >
          <a href="javascript: void(0)" class="canvas-item-close" @click="removeItem(item.id)">×</a>
        </div>
      </div>
      <div class="set-href-dialog" v-show="dialogVisible">
        <span class="dialog-head">
          <h5>设置热区</h5>
        </span>
        <div class="dialog-content">
          <form>
            <div class="form-item">
              <label for class="form-label">标题</label>
              <input class="form-text" type="text" v-model="dialogForm.title">
            </div>
            <div class="form-item">
              <label for class="form-label">链接</label>
              <input class="form-text" type="text" v-model="dialogForm.href">
            </div>
            <div class="form-item">
              <label for class="form-label">打开方式</label>
              <input type="radio" name="target" v-model="dialogForm.target" value="_self">
              <span class="radio-label">当前页面</span>
              <input type="radio" name="target" v-model="dialogForm.target" value="_blank">
              <span class="radio-label">新开页面</span>
            </div>
          </form>
        </div>
        <span class="dialog-footer">
          <button @click="handleClose">取消</button>
          <button class="ok" @click="setHref">确定</button>
        </span>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    initData: { type: Array }
  },
  data () {
    return {
      canvasObject: {},
      parentObject: {},
      drawing: false, // 是否可以绘画
      createNewBox: false, // 是否正在绘画
      endNewBox: false, // 是否结束绘画
      drawingConfig: { // 绘画开始坐标
        startPointX: 0,
        startPointY: 0
      },
      currentBox: '', // 当前绘制的矩形
      createLinkArr: [],
      moving: false, // 是否可以移动
      movingConfig: { // 移动开始坐标
        startPointX: 0,
        startPointY: 0
      },
      changeSize: false, // 是否可以改变矩形大小
      currentItem: {}, // 当前改变大小的矩形
      changeConfig: {}, // 改变矩形大小开始坐标
      direction: '', // 改变矩形大小-被激活的方向
      dialogVisible: false,
      formLabelWidth: '120px',
      dialogForm: {
        title: '',
        href: '',
        target: '_self'
      }
    }
  },
  created () {
    this.initComponent()
  },
  methods: {
    initComponent () {
      if (this.initData) {
        this.createLinkArr = Object.assign(this.createLinkArr, this.initData)
        this.createLinkArr.forEach(item => {
          const cId = 'canvasA' + new Date().getTime()
          item.id = cId
        })
      }
    },
    saveData () {
      this.$emit('saveData', this.createLinkArr)
    },
    showHrefDialog (item) {
      this.dialogForm = {
        title: '',
        href: '',
        target: '_self'
      }
      if (item.link) {
        this.dialogForm = Object.assign({}, item)
      }
      this.dialogVisible = true
    },
    setHref () {
      this.currentItem.link = Object.assign({}, this.dialogForm)
      this.handleClose()
    },
    handleClose () {
      this.dialogVisible = false
    },
    removeItem (id) {
      this.createLinkArr.forEach((item, index) => {
        if (item.id === id) {
          this.createLinkArr.splice(index, 1)
        }
      })
    },
    /* ===========绘制矩形方法开始=========== */
    canvasStart (e) {
      this.drawing = true
      this.endNewBox = false
      this.drawingConfig.startPointX = e.layerX
      this.drawingConfig.startPointY = e.layerY
      this.parentObject = {
        target: e.target,
        width: e.target.offsetWidth,
        height: e.target.offsetHeight,
        left: e.target.offsetLeft,
        top: e.target.offsetTop
      }
    },
    canvasMove (e) {
      // 绘制矩形
      if (this.drawing) {
        const { createNewBox, drawingConfig } = this
        const x = e.layerX
        const y = e.layerY
        const offsetX = x - this.drawingConfig.startPointX
        const offsetY = y - this.drawingConfig.startPointY
        const cId = new Date().getTime()
        let item = {
          id: 'canvasA' + cId,
          style: {
            top: '',
            bottom: '',
            left: '',
            right: '',
            width: '10px',
            height: '10px'
          }
        }
        // 从左上角开始
        if (offsetX > 10 && offsetY > 10 && !this.endNewBox) {
          if (!createNewBox) {
            item.style.top = drawingConfig.startPointY + 'px'
            item.style.left = drawingConfig.startPointX + 'px'
            this.currentBox = item
            this.createLinkArr.push(this.currentBox)
          }
          this.createNewBox = true
          this.currentBox.style.width = Math.abs(offsetX) + 'px'
          this.currentBox.style.height = Math.abs(offsetY) + 'px'
        }
        // 从右上角开始
        else if (offsetX < -10 && offsetY > 10 && !this.endNewBox) {
          if (!createNewBox) {
            const right = this.parentObject.width - this.drawingConfig.startPointX
            item.style.top = drawingConfig.startPointY + 'px'
            item.style.right = right + 'px'
            this.currentBox = item
            this.createLinkArr.push(this.currentBox)
          }
          this.createNewBox = true
          this.currentBox.style.width = Math.abs(offsetX) + 'px'
          this.currentBox.style.height = Math.abs(offsetY) + 'px'
        }
        // 从左下角开始
        else if (offsetX > 10 && offsetY < -10 && !this.endNewBox) {
          if (!createNewBox) {
            const bottom = this.parentObject.height - this.drawingConfig.startPointY
            item.style.bottom = bottom + 'px'
            item.style.left = this.drawingConfig.startPointX + 'px'
            this.currentBox = item
            this.createLinkArr.push(this.currentBox)
          }
          this.createNewBox = true
          this.currentBox.style.width = Math.abs(offsetX) + 'px'
          this.currentBox.style.height = Math.abs(offsetY) + 'px'
        }
        // 从右下角开始
        /* if (offsetX < -10 && offsetY < -10 && !this.endNewBox) {
          if (!this.createNewBox) {
            const right = this.parentObject.width - this.drawingConfig.startPointX
            const bottom = this.parentObject.height - this.drawingConfig.startPointY
            item.style.right = right
            item.style.bottom = bottom
            this.currentBox = item
            this.createLinkArr.push(this.currentBox)
          }
          this.createNewBox = true
          this.currentBox.style.width = Math.abs(offsetX) + 'px'
          this.currentBox.style.height = Math.abs(offsetY) + 'px'
        } */
      }
      //改变矩形大小
      if (this.changeSize) {
        const { direction, currentItem } = this
        const currentHeight = parseInt(currentItem.style.height.slice(0, -2))
        const currentWidth = parseInt(currentItem.style.width.slice(0, -2))
        const x = e.pageX
        const y = e.pageY
        console.log('size(' + x + ',' + y + ')')
        const offsetX = x - this.changeConfig.startPointX
        const offsetY = y - this.changeConfig.startPointY
        // 每次拖动都需要重置起始位置
        this.changeConfig.startPointX = x
        this.changeConfig.startPointY = y
        let newWidth, newHeight
        if (direction === 'top') {
          // 边缘限制
          if (offsetY < 0 && this.getReactStyle('top') <= 0) {
            item.style.top = '0px'
            return
          }
          newHeight = currentHeight - offsetY
        }
        if (direction === 'bottom') {
          // 边缘限制
          if (offsetY > 0 && this.getReactStyle('bottom') <= 0) {
            item.style.bottom = '0px'
            return
          }
          newHeight = currentHeight + offsetY
        }
        if (direction === 'left') {
          // 边缘限制
          if (offsetX < 0 && this.getReactStyle('left') <= 0) {
            item.style.left = '0px'
            return
          }
          newWidth = currentWidth - offsetX
        }
        if (direction === 'right') {
          // 边缘限制
          if (offsetX > 0 && this.getReactStyle('right') <= 0) {
            item.style.right = '0px'
            return
          }
          newWidth = currentWidth + offsetX
        }
        if (direction === 'lt') {
          newHeight = currentHeight - offsetY
          newWidth = currentWidth - offsetX
        }
        if (direction === 'lb') {
          newHeight = currentHeight + offsetY
          newWidth = currentWidth - offsetX
        }
        if (direction === 'rb') {
          newWidth = currentWidth + offsetX
          newHeight = currentHeight + offsetY
        }
        if (newHeight) {
          currentItem.style.height = newHeight + 'px'
        }
        if (newWidth) {
          currentItem.style.width = newWidth + 'px'
        }
      }
    },
    canvasOver () {
      /* 绘画结束，设置相关bool值 */
      this.drawing = false
      this.createNewBox = false
      this.endNewBox = true
      this.changeSize = false
    },
    canvasLeave () {
      this.drawing = false
      this.changeSize = false
    },
    /* ===========绘制矩形方法结束=========== */
    /* ===========拖拽移动矩形方法开始=========== */
    dragStart (e) {
      this.moving = true
      this.movingConfig.startPointX = e.layerX
      this.movingConfig.startPointY = e.layerY
    },
    dragMove (e, item, index) {
      const x = e.layerX
      const y = e.layerY
      console.log(item.style)
      if (this.moving) {
        const offsetX = x - this.movingConfig.startPointX
        const offsetY = y - this.movingConfig.startPointY
        let currentLeft, currentRight, currentTop, currentBottom, newLeft, newRight, newTop, newBottom
        this.currentItem = item
        const itemLeft = this.getReactStyle('left')
        const itemRight = this.getReactStyle('right')
        const itemTop = this.getReactStyle('top')
        const itemBottom = this.getReactStyle('bottom')
        // 向左移动到容器边缘
        if (offsetX < 0 && itemLeft <= 0) {
          item.style.left = '0px'
          return
        }
        // 向右移动到容器边缘
        if (offsetX > 0 && itemRight <= 0) {
          item.style.left = ''
          item.style.right = '0px'
          return
        }
        // 向上移动到容器边缘
        if (offsetY > 0 && itemBottom <= 0) {
          item.style.top = ''
          item.style.bottom = '0px'
          return
        }
        // 向下移动到容器边缘
        if (offsetY < 0 && itemTop <= 0) {
          item.style.top = '0px'
          return
        }
        if (item.style.left) {
          currentLeft = parseInt(item.style.left.slice(0, -2))
          newLeft = currentLeft + offsetX
          item.style.left = newLeft + 'px'
        } else if (item.style.right) {
          currentRight = parseInt(item.style.right.slice(0, -2))
          newRight = currentRight - offsetX
          item.style.right = newRight + 'px'
        }
        if (item.style.top) {
          currentTop = parseInt(item.style.top.slice(0, -2))
          newTop = currentTop + offsetY
          item.style.top = newTop + 'px'
        } else if (item.style.bottom) {
          currentBottom = parseInt(item.style.bottom.slice(0, -2))
          newBottom = currentBottom - offsetY
          item.style.bottom = newBottom + 'px'
        }
      }
    },
    dragOver (e, item, index) {
      this.moving = false
    },
    /* ===========拖拽移动矩形方法结束=========== */
    /* ===========拖拽改变矩形大小开始=========== */
    changeSizeStart (e, item, direction) {
      this.changeSize = true
      this.direction = direction
      this.currentItem = item
      this.changeConfig.startPointX = e.pageX
      this.changeConfig.startPointY = e.pageY
      if (direction === 'top') {
        item.style.bottom = this.getReactStyle('bottom') + 'px'
        item.style.top = ''
      }
      if (direction === 'bottom') {
        item.style.top = this.getReactStyle('top') + 'px'
        item.style.bottom = ''
      }
      if (direction === 'left') {
        item.style.right = this.getReactStyle('right') + 'px'
        item.style.left = ''
      }
      if (direction === 'right') {
        item.style.left = this.getReactStyle('left') + 'px'
        item.style.right = ''
      }
      if (direction === 'lt') {
        item.style.bottom = this.getReactStyle('bottom') + 'px'
        item.style.right = this.getReactStyle('right') + 'px'
        item.style.top = ''
        item.style.left = ''
      }
      if (direction === 'lb') {
        item.style.top = this.getReactStyle('top') + 'px'
        item.style.right = this.getReactStyle('right') + 'px'
        item.style.bottom = ''
        item.style.left = ''
      }
      if (direction === 'rb') {
        item.style.top = this.getReactStyle('top') + 'px'
        item.style.left = this.getReactStyle('left') + 'px'
        item.style.bottom = ''
        item.style.right = ''
      }
    },
    // changeSizeMove冒泡到上层canvasMove
    changeSizeOver () {
      this.changeSize = false
    },
    /* ===========拖拽改变矩形大小结束=========== */
    getReactStyle (direction) {
      const item = this.currentItem
      const width = parseInt(item.style.width.slice(0, -2))
      const height = parseInt(item.style.height.slice(0, -2))
      let top, left, bottom, right
      if (item.style.top) {
        top = parseInt(item.style.top.slice(0, -2))
        bottom = this.parentObject.height - (top + height)
      } else if (item.style.bottom) {
        bottom = parseInt(item.style.bottom.slice(0, -2))
        top = this.parentObject.height - (bottom + height)
      }
      if (item.style.left) {
        left = parseInt(item.style.left.slice(0, -2))
        right = this.parentObject.width - (left + width)
      } else if (item.style.right) {
        right = parseInt(item.style.right.slice(0, -2))
        left = this.parentObject.width - (right + width)
      }
      if (direction === 'top') {
        return top
      }
      if (direction === 'bottom') {
        return bottom
      }
      if (direction === 'left') {
        return left
      }
      if (direction === 'right') {
        return right
      }
    }

  }
}
</script>
<style type="text/css">
.canvas-content {
  width: 100%;
  height: 100%;
  margin: 0 auto;
  position: absolute;
  left: 0;
  top: 0;
}
.canvas-outter {
  box-sizing: border-box;
  position: absolute;
  display: block;
  border: 1px dashed #aaa;
  background: rgba(255, 255, 255, 0.2);
}
.canvas-item {
  width: 100%;
  height: 100%;
  cursor: move;
}
.canvas-outter .border-area {
  position: absolute;
  display: block;
  z-index: 2;
}
.canvas-outter .border-area-top {
  width: 100%;
  height: 10px;
  top: -5px;
  cursor: n-resize;
}
.canvas-outter .border-area-right {
  width: 10px;
  height: 100%;
  right: -5px;
  cursor: e-resize;
}
.canvas-outter .border-area-bottom {
  width: 100%;
  height: 10px;
  bottom: -5px;
  cursor: n-resize;
}
.canvas-outter .border-area-left {
  width: 10px;
  height: 100%;
  left: -5px;
  cursor: e-resize;
}
.canvas-outter .corner-area {
  position: absolute;
  display: block;
  z-index: 3;
  width: 15px;
  height: 15px;
}
.canvas-outter .corner-area-lt {
  left: -7px;
  top: -7px;
  cursor: nw-resize;
}
.canvas-outter .corner-area-rt {
  right: -7px;
  top: -7px;
  cursor: ne-resize;
}
.canvas-outter .corner-area-rb {
  right: -7px;
  bottom: -7px;
  cursor: nw-resize;
}
.canvas-outter .corner-area-lb {
  left: -7px;
  bottom: -7px;
  cursor: ne-resize;
}
.canvas-item-close {
  display: block;
  position: absolute;
  top: -15px;
  right: -15px;
  width: 24px;
  height: 24px;
  border-radius: 15px;
  background: #ddd;
  border: 1px solid #999;
  text-align: center;
  text-decoration: none;
  line-height: 20px;
  color: #333;
  font-size: 26px;
}
.button-save {
  position: absolute;
  z-index: 3;
  padding: 7px 10px;
  border: 1px solid #ddd;
  background: #fff;
}
.set-href-dialog {
  box-sizing: border-box;
  position: fixed;
  left: 50%;
  top: 20%;
  margin-left: -300px;
  width: 600px;
  height: 300px;
  padding: 10px;
  background: #fff;
  box-shadow: 0 0 10px 2px #999;
}
.set-href-dialog .dialog-head h5 {
  margin: 0;
  font-size: 16px;
}
.set-href-dialog .dialog-content {
  padding: 20px 30px;
}
.set-href-dialog .form-item {
  margin: 15px 0;
}
.set-href-dialog .form-item label {
  display: inline-block;
  font-size: 14px;
  font-weight: bold;
  line-height: 32px;
  width: 70px;
  text-align: right;
  margin-right: 10px;
  vertical-align: middle;
}
.set-href-dialog .form-item input.form-text {
  border: 1px solid #ccc;
  border-radius: 3px;
  line-height: 32px;
  padding: 0 10px;
  width: 300px;
}
.set-href-dialog .form-item input {
  vertical-align: middle;
}
.set-href-dialog .form-item .radio-label {
  font-size: 14px;
  vertical-align: middle;
  margin-right: 10px;
}
.set-href-dialog .dialog-footer {
  box-sizing: border-box;
  position: absolute;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 60px;
  padding: 10px 20px;
  text-align: right;
}
.set-href-dialog .dialog-footer button {
  width: 80px;
  height: 40px;
  border-radius: 5px;
  border: 1px solid #ddd;
  background: #fff;
}
.set-href-dialog .dialog-footer button.ok {
  background: #3baeff;
  color: #fff;
}
</style>
