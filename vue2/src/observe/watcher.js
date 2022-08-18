import Dep, { popTarget, pushTarget } from "./dep";

let id = 0;

// 1).当我们创建渲染watcher时候会把当前的渲染watcher放到Dep.target上
// 2).调用_render()会取值  走到get上

class Watcher { // 不同组件有不同的watcher  目前只有一个 渲染根实例的
  constructor(vm, expOrfn, options, cb) {
    this.id = id++;
    this.renderWatcher = options
    if(typeof expOrfn === 'string') {
      this.getter = function() {
        return vm[expOrfn]
      }
    } else {
      this.getter = expOrfn; // getter意味着调用这个函数可以发生取值操作
    }
    this.deps = []; // 后续我们实现计算属性和一些清理工作要用到
    this.cb = cb
    this.depsId = new Set()
    this.lazy = options.lazy
    this.dirty = this.lazy //缓存值
    this.vm = vm
    this.user = options.user; //标识是否是用户自己的watcher

    this.value = this.lazy ? undefined : this.get();
  }
  addDep(dep) { // 一个组件对应多个属性  重复属性不用记录
    let id = dep.id;
    if (!this.depsId.has(id)) {
      this.deps.push(dep)
      this.depsId.add(id)
      dep.addSub(this); // watcher已经记住dep并且去重了，此时让dep也记住watcher
    }
  }
  evaluate() {
    this.value = this.get(); //获取到用户函数返回值，并标识为脏
    this.dirty = false
  }
  get() {
    pushTarget(this)
    // Dep.target = this; // 静态属性只有一份
    let value = this.getter.call(this.vm); //一进来就会调下  会去vm上取值
    popTarget()
    // Dep.target = null; // 渲染完毕清空
    return value
  }
  depend() {
    let i = this.deps.length
    while(i--) {
      this.deps[i].depend() //让计算属性watcher也收集渲染watcher
    }
  }
  update() {
    if(this.lazy) {
      // 如果计算属性 依赖的值变化了 就标识计算属性是脏值了
      this.dirty = true
    } else {
      queueWatcher(this); //把当前watcher暂存起来
      // this.get() //重新渲染更新
    }
  }
  run() {
    let oldValue = this.value
    let newValue = this.get()
    if(this.user) {
      this.cb.call(this.vm, newValue, oldValue)
    }
  }
}

let queue = [];
let has = {};
let pending = false; //防抖

function flushSchedulerQueue() {
  let flushQueue = queue.slice(0)
  queue = [];
  has = {}
  pending = false
  flushQueue.forEach(q => q.run())
}
function queueWatcher(watcher) {
  const id = watcher.id
  if(!has[id]) {
    queue.push(watcher)
    has[id] = true
    // 无论update执行多少次，最终我们只执行一轮更新操作
    if(!pending) {
      nextTick(flushSchedulerQueue, 0)
      pending = true
    }
  }
}

let callbacks = [];
let waiting = false;
function flushCallbacks() {
  let cbs = callbacks.slice(0)
  waiting = false;
  callbacks = []
  cbs.forEach(cb => cb())// 按照顺序依次执行
}
// nextTick 没有直接使用某个api，而是采用优雅降级的方式
// 内部采用的是promise(ie不兼容), MutationObserver（h5） 可以考虑ie专享的 setImmediate setTimeout
let timerFunc;
if(Promise) {
  timerFunc = () => {
    Promise.resolve().then(flushCallbacks)
  }
} else if(MutationObserver) {
  let observer = new MutationObserver(flushCallbacks)
  let textNode = document.createTextNode(1);
  observer.observe(textNode, {
    characterData: true
  })
  timerFunc = () => {
    textNode.textContent = 2;
  }
} else if (setImmediate) {
  timerFunc = () => {
    setImmediate(flushCallbacks)
  }
} else {
  timerFunc = () => {
    setTimeout(flushCallbacks)
  }
}


export function nextTick(cb) {
  callbacks.push(cb); // 维护nextTick中的callback方法
  if(!waiting) {
    setTimeout(() => {
      timerFunc(flushCallbacks)//最后一起更新
    }, 0)
    waiting = true
  }
}
// 需要给每个属性增加一个dep，目的是收集watcher
// 一个组件中 会有多个属性(n个属性会对应一个组件)，n个dep对应一个watcher
// 1个属性可以对应多个组件 1个dep对应多个watcher

export default Watcher
