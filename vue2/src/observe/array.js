// 重写数租中的部分方法


let oldArrayProto = Array.prototype; //获取数组中的原型

export let newArrayProto = Object.create(oldArrayProto);

let methods = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'reverse',
  'sort'
]

methods.forEach(method => { 
  newArrayProto[method] = function (...args) { // 重写数组的方法
    const result = oldArrayProto[method].call(this, ...args) //内部调用原来的方法， 函数的劫持

    let inserted;
    let ob = this.__ob__
    switch(method) {
      case 'push':
      case 'unshift':
        inserted = args
        break;
      case 'splice': 
        inserted = args.slice(2);
      default:
        break
      }
      // console.log(inserted); //新增的内容
      if (inserted) {
        // 对新传递过来的值进行观测
        ob.observeArray(inserted)
      }
      // console.log('更新');
      ob.dep.notify(); //数组变化了通知对应的watcher走更新逻辑
    return result
  }
})
