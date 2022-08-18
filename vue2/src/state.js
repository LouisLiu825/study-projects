import Dep from "./observe/dep"
import { observe } from "./observe/index"
import Watcher, { nextTick } from './observe/watcher'

export function initState(vm) {
  // 数据劫持
  const opts = vm.$options //获取所有的选项
  if (opts.data) { //有数据初始化数据
    initData(vm)
  }
  if (opts.computed) {
    initComputed(vm)
  }
  if (opts.watch) {
    initWatch(vm)
  }
}
function initWatch(vm) {
  let watch = vm.$options.watch;
  for(let key in watch) {
    const handler = watch[key]

    if(Array.isArray(handler)) {
      for(let i = 0; i < handler.length; i++) {
        createWatcher(vm, key, handler[i])
      }
    } else {
      createWatcher(vm, key, handler)
    }
  }
}
function createWatcher(vm, key, handler) {
  if(typeof handler === 'string') {
    handler = vm[handler]
  }
  return vm.$watch(key, handler)
}


function proxy(vm, target, key) {
  Object.defineProperty(vm, key, {
    get() {
      return vm[target][key]
    },
    set(newValue) {
      vm[target][key] = newValue
    }
  })
}
function initData(vm) {
  let data = vm.$options.data //data可能是函数和对象
  data = typeof data === 'function'? data.call(vm) : data
  
  vm._data = data //将返回的对象放到_data上
  // 对数据进行数据劫持
  observe(data)

  // 将vm._data 用vm代理
  for(let key in data) {
    proxy(vm,'_data', key)
  }

}
function initComputed(vm) {
  const computed = vm.$options.computed
  let watchers = vm._computedWatchers = {} //将计算属性watcher保存到vm上
  for(let key in computed) {
    let userDef = computed[key]
    // 我们需要监控计算属性中get的变化
    let fn = typeof userDef === 'function' ? userDef : userDef.get
    // 默认直接new watcher时候会立即执行fn  将属性和watcher对应起来
    watchers[key] = new Watcher(vm, fn, {lazy: true})




    defineComputed(vm, key, userDef)
  }
}
function defineComputed(target, key, userDef) {
  // console.log(target, key, userDef);
  const getter = typeof userDef === 'function' ? userDef : userDef.get
  const setter = userDef.set || (() => {})
  // 通过实例获取到对应属性
  Object.defineProperty(target, key, {
    get: createComputedGetter(key),
    set: setter
  })
}
// 计算属性不会收集依赖，只会让自己的依赖属性去收集依赖
function createComputedGetter(key) {
  // 检查是否要执行这个getter
  return function() {
    const watcher = this._computedWatchers[key]; //获取到对应属性的watcher
    if(watcher.dirty) {
      // 如果是脏就去执行用户传入的函数
      watcher.evaluate() //求值后 dirty变为false 下次就不求值了
    }
    if(Dep.target) { // 计算属性出栈后 还有渲染watcher，应该让计算属性watcher里面的属性 也去收集上一层watcher
      watcher.depend()
    }
    return watcher.value // 最后返回的是watcher上的值
  }
}
export function initStateMixin(Vue) {
  Vue.prototype.$nextTick = nextTick
  // 最终调用的都是这个方法
  Vue.prototype.$watch = function(expOrFn, cb, options = {}) {
  new Watcher(this, expOrFn, {user: true}, cb)
}

}
