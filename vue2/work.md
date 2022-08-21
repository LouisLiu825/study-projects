

Vue.component 作用就是收集全局的定义 id和对应的definition  Vue.options.components[组件名] = 包装成构造函数(定义)
Vue.extend 返回一个子类  而且会在子类上记录自己的选项 

<!-- 
  function extend(选项) {
    function Sub() {
      this._init() //子组件的初始化
    }
    Sub.options = 选项
    return Sub
  }
  let Sub = Vue.extend({data: 数据源})

  new Sub() mergeOptions(Sub.options)  Sub.options.data //如果data是一个对象  就是共享的
  new Sub() mergeOptions(Sub.options)  Sub.options.data

 -->

 创建子类的构造函数的时候，会将全局的组件和自己身上定义的组件进行合并 （组件的合并 会先查找自己再查找全局）
 组件的渲染  开始渲染组件会编译组件的模板变成render函数 =》 调用render方法
 createElementVnode  会根据tag类型来区分是否是组件，如果组件会创造组件的虚拟节点（组件增加初始化的钩子，增加componentOptions选项{Ctor}） 稍后创建组件的真实节点 我们只需要new Ctor()
