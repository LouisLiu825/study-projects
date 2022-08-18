import compileToFunction from "./compiler";
import { initGlobalAPI } from "./globalApi";
import { initMixin } from "./init"
import { initLifeCycle } from "./lifecycle";
// import Watcher,  from "./observe/watcher";
import { initStateMixin } from "./state";
import { createElm, patch } from "./vdom/patch";

function Vue(options) { // options就是用户的选项
  this._init(options) // 默认调用了init
}

initMixin(Vue); //扩展init方法
initLifeCycle(Vue); //vm._update vm._render
initGlobalAPI(Vue); //实现全局api
initStateMixin(Vue); //实现了nextTick、$watch


// 测试
let render1 = compileToFunction(`<ul key="a" style="color: red">
  <li key='a'>a</li>
  <li key='b'>b</li>
  <li key='c'>c</li>
</ul>`)
let vm = new Vue({data:{name: 'zs'}})
let prevNode = render1.call(vm)

let el = createElm(prevNode)
document.body.appendChild(el)

let render2 = compileToFunction(`<ul key="b" style="color: #000;background: #bfc">
  <li key='a'>a</li>
  <li key='b'>b</li>
  <li key='c'>c</li>
  <li key='d'>d</li>
</ul>`)
let vm2 = new Vue({data:{name: '王五'}})
let nextNode = render2.call(vm2)
// console.log(prevNode, nextNode);
// 直接将新的节点替换掉了老的，不是直接替换，而是比较两个人的区别之后在替换，diff算法
// diff算法是一个平级比较的过程 父亲和父亲比 儿子和儿子比
setTimeout(() => {
  patch(prevNode, nextNode)
  // let newEl = createElm(nextNode)
  // el.parentNode.replaceChild(newEl, el)
}, 1000)


export default Vue
