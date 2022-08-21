
// 静态方法
const strats = {}
const LIFECYCLE = [
  'beforeCreate',
  'created'
]
LIFECYCLE.forEach(hook => {
  strats[hook] = function (p, c) {
    if (c) { //如果儿子有 父亲有  让父亲和儿子拼在一起
      if (p) {
        return p.concat(c)
      } else {
        return [c]; // 儿子有父亲没有 ，则将儿子包装成数组
      }
    } else {
      return p; // 如果儿子没有则用父亲即可
    }
  }
})
strats.components = function(parentVal, childVal) {
  const res = Object.create(parentVal);

  if(childVal) {
    for(let key in childVal) {
      res[key] = childVal[key]; //返回的是构造的对象，可以拿到父亲原型上的属性，并且将儿子的都拷贝到自己身上
    }
  }
  return res
}

export function mergeOptions(parent, child) {
  const options = {}

  for (let key in parent) {
    mergeField(key)
  }
  for (let key in child) {
    if (!parent.hasOwnProperty(key)) {
      mergeField(key)
    }
  }

  function mergeField(key) {
    // 采用策略模式 减少if/else
    if (strats[key]) {
      options[key] = strats[key](parent[key], child[key])
    } else {
      // 不在策略中则以儿子为主
      options[key] = child[key] || parent[key]
    }
  }

  return options
}
