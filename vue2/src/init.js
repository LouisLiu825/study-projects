import compileToFunction from "./compiler";
import { mountComponent, callHook } from "./lifecycle";
import { initState } from "./state";
import { mergeOptions } from "./utils";

export function initMixin(Vue) {
  Vue.prototype._init = function(options) { // 初始化操作
    // vue 自己的属性
    const vm = this
    // 我们定义的全局指令和过滤器都会挂载到实例上
    this.$options = mergeOptions(this.constructor.options ,options); //将用户的选项挂载到实例上

    callHook(vm, 'beforeCreate')
    // 初始化状态 初始化计算属性
    initState(vm)
    callHook(vm, 'created')
    if (options.el) {
      vm.$mount(options.el); //实现数据的挂载
    }
  }
  Vue.prototype.$mount = function(el) {
    const vm = this;
    el = document.querySelector(el)
    let ops = vm.$options
    if(!ops.render) { // 先进行查找有没有render函数
      let template; // 没有render看一下是否有template，没有就才用外部的template
      if(!ops.template && el) { // 没有模板但是有el
        template = el.outerHTML
      } else {
        template = ops.template; // 有el，就才用模板中的内容
      }
      // 有template就用template
      if(template) { // 只要模板就挂载
        const render = compileToFunction(template);
        ops.render = render;
      }
    }

    mountComponent(vm, el); // 组件的挂载
    // console.log(ops.render); // 获取render方法
    // script 标签引用的vue.global.js，这个编译过程是在浏览器运行的
    // runtime是不包含模板编译的，整个编译是打包的时候通过loader来转义.vue文件的，用runtime的时候不能使用template
  }
}

