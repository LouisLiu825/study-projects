import Watcher from "./observe/watcher";
import { createElementVNode, createTextVNode } from "./vdom";
import { patch } from "./vdom/patch";



export function initLifeCycle(Vue) {
  // 将vnode转化成真实dom
  Vue.prototype._update = function (vnode) {
    const vm = this;
    const el = vm.$el
    // console.log(vnode, el);
    // patch既有初始化的功能，又有更新的功能
    // const prevNode = vm._vnode
    // vm._vnode = vnode; //把组件第一次产生的虚拟节点保存到_vnode上
    // if(prevNode) { //之前渲染过了
    //   vm.$el = patch(prevNode, vnode);
    // } else {
    //   vm.$el = patch(el, vnode);
    // }
    vm.$el = patch(el, vnode);
  }
  // _c('div',{}, ...children)
  Vue.prototype._c = function () {
    return createElementVNode(this, ...arguments)
  }
  // _v(text)
  Vue.prototype._v = function () {
    return createTextVNode(this, ...arguments)
  }
  Vue.prototype._s = function (value) {
    if (typeof value !== 'object') return value
    return JSON.stringify(value)
  }
  // 渲染虚拟dom
  Vue.prototype._render = function () {
    const vm = this
    // console.log(vm.name);
    // 让with中的this指向vm
    // 当渲染的时候回去实例取值，我们可以将属性和视图绑定在一起
    return vm.$options.render.call(vm); // vm是通过ast语法转义生成的render方法
  }
}

export function mountComponent(vm, el) { //这里的el是通过querySelect处理过的
  vm.$el = el
  // 1. 调用render方法产生虚拟节点 虚拟dom
  const updateComponent = () => {
  vm._update(vm._render()); //vm.$options.render() 返回的是虚拟节点

  }
  const watcher = new Watcher(vm, updateComponent, true) // true用来表示是个渲染watcher
  // console.log(watcher);
  // 2. 根据虚拟dom产生真实dom
  // 3. 插入到el元素

}

// vue核心流程 
// 1）创建了响应式数据  2）模板转换成ast语法树
// 3） 将ast语法树转换成render函数  4）后续每次数据更新就可以只执行render函数（无需再次执行ast转化成的过程）



// render函数会去产生虚拟节点 （使用响应式数据)
// 根据生成的虚拟节点创造真实的dom

export function callHook(vm, hook) {
  const handlers = vm.$options[hook]
  if(handlers) {
    handlers.forEach(handler => handler.call(vm))
  }

}
