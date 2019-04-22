<template>
  <div id="app">
    <div class="floor floor1">
      <drag-href @saveData="saveHrefData" :initData="hrefInitData"></drag-href>
    </div>
  </div>
</template>
<script>
import DragHref from './dragHref/DragHref.vue'
export default {
  name: 'app',
  components: {
    DragHref
  },
  data() {
    return {
      componentName: '',
      hrefInitData: []
    }
  },
  mounted() {
    this.componentName = 'DragHref'
  },
  methods: {
    saveHrefData(data) {
      console.log(data)
    },
    buildCanvas(event) {
      const parent = event.path[2]
    }
  }
}
</script>
<style type="text/css">
.floor {
  width: 1200px;
  margin: 0 auto;
  border: 1px solid #999;
  position: relative;
  background: #eee;
}
.floor1 {
  height: 1200px;
}
.floor2 {
  height: 300px;
}
.floor3 {
  height: 200px;
}
.floor4 {
  height: 250px;
}
.floor5 {
  height: 600px;
}
</style>

