import { newArrayProto } from "./array"
import Dep from "./dep"

class Observer{
  constructor(data) {
    // Object.defineProperty只能劫持已经存在的属性(vm里面会单独为此写一些api  $set $delete)

    // 给每个对象都增加收集功能
    this.dep = new Dep()

    // data.__ob__ = this
    Object.defineProperty(data, "__ob__", { //给对象添加个标识___ob___，判断是否被观测过
      value: this,
      enumerable: false //不可枚举
    })
    // 判断是否是数组   
    if (Array.isArray(data)) {
      // 重写数组中的方法，可以修改数组本身的7个变异方法
      data.__proto__ = newArrayProto //保留数组原有特性，并重写部分方法
      this.observeArray(data) // 观测数组
    } else {
      this.walk(data)
    }
  }

  walk(data) { //循环对象 对属性进行劫持
    // 重新定义属性  性能差
    Object.keys(data).forEach(key => defineReactive(data, key, data[key]))
  }
  observeArray(data) {
    data.forEach(item => observe(item)) //检测数组中的对象
  }
}
// 深层次嵌套会递归  递归多了性能差，不存在属性监控不到，存在的属性要重写方法
function dependArray(value) {
  for(let i = 0; i < value.length; i++) {
    let current = value[i]
    current.__ob__ && current.__ob__.dep.depend()
    if(Array.isArray(current)) {
      dependArray(current)
    }
  }
}
export function defineReactive(target, key, value) {
  let childOb = observe(value) //对所有对象进行属性劫持  childOb.dep就是用来收集依赖的
  let dep = new Dep(); // 让每个属性都有一个dep
  Object.defineProperty(target, key, {
    get() {
      if(Dep.target) {
        dep.depend(); //这个属性收集器dep记住当前的watcher
        if(childOb) {
          childOb.dep.depend() //让数组和对象本身也进行依赖收集
          if(Array.isArray(value)) {
            dependArray(value)
          }
        }
      }
      return value
    },
    set(newValue) {
      if(newValue === value) return
      observe(newValue)
      value = newValue
      dep.notify();
    }
  })
}

export function observe(data) {
    // console.log(data);
    // 对对象进行数据劫持
    if (typeof data !== 'object' || data == null) {
      return // 只对对象进行劫持
    }
    if (data.__ob__ instanceof Observer) { //说明这个对象被代理过看
      return data.__ob__
    }
    // 判断对象是否被劫持 （添加一个实例，用实例判断是否被劫持过）
    return new Observer(data)
}
