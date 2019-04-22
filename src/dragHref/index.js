import DragHref from './DragHref'
DragHref.install = Vue => Vue.component(DragHref.name, DragHref)
if (typeof window !== 'undefined' && window.vue) {
  window.DragHref = DragHref
  Vue.use(DragHref)
}
export default DragHref
