let id = 0;

class Dep {
  constructor() {
    this.id = id++; // 属性的dep要收集watcher
    this.subs = []; // 这里存放当前属性对应的watcher有哪些
  }
  depend() {
    // 这里我们不希望收集重复的watcher，而且刚才只是一个单向的关系，dep收集watcher
    // watcher同时也要记录dep
    // this.subs.push(Dep.target)
    Dep.target.addDep(this)
  }
  addSub(watcher) {
    this.subs.push(watcher)
  }
  notify() {
    this.subs.forEach(watcher => watcher.update()); //告诉watcher要更新了
  }
}
Dep.target = null;

let stack = [];
export function pushTarget(watcher) {
  stack.push(watcher)
  Dep.target = watcher
}
export function popTarget() {
  stack.pop()
  Dep.target = stack[stack.length - 1]
}

export default Dep
