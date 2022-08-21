import { mergeOptions } from "./utils"


export function initGlobalAPI(Vue) {
  Vue.options = {
    _base: Vue
  }
  
  Vue.mixin = function (mixin) {
    // 将用户选项和全局options进行合并
    this.options = mergeOptions(this.options, mixin);
    return this
  }

  // 可以手动创建组件进行挂载
  Vue.extend = function(options) {
    function Sub() { // 最终使用一个组件，就是new一个实例
      this._init(); //就是默认对子类进行初始化操作
    }
    Sub.prototype = Object.create(Vue.prototype) // sub.prototype.__proto = Vue.prototype
    Sub.prototype.constructor = Sub
    // 希望将用户的传递的参数 和全局的Vue.options来合并
    Sub.options = mergeOptions(Vue.options, options) //保存用户传递的选项

    return Sub
  }
  Vue.options.components = {}
  Vue.component = function(id, definition) {
    // 如果definition已经是一个函数了 说明用户自己调用了Vue.extend
    definition = typeof definition === 'function' ? definition : Vue.extend(definition)

    Vue.options.components[id] = definition
    console.log(Vue.options.components);
  }
}
