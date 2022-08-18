import { isSameVnode } from ".";

export function createElm(vnode) {
  let { tag, data, children, text } = vnode
  if (typeof tag === 'string') {
    vnode.el = document.createElement(tag);//这里将真实节点和虚拟节点相对应，后续如果修改属性了，通过虚拟节点找到真实节点

    patchProps(vnode.el,{}, data)

    children.forEach(child => {
      vnode.el.appendChild(createElm(child))
    })
  } else {
    vnode.el = document.createTextNode(text)
  }
  return vnode.el
}
export function patchProps(el, oldProps, props) {
  // 老的属性中有，新的没有，要删除老的
  let oldStyles = oldProps.style || {}
  let newStyles = props.style || {}
  for(let key in oldStyles) { //老的样式中有 新的没有则删除
    if(!newStyles[key]) {
      el.style[key] = ''
    }
  }
  for(let key in oldProps) { //老的属性有
    if(!props[key]) { //新的没有则删除属性
      el.removeAttribute(key)
    }
  }

  for(let key in props) { //用新的覆盖掉老的
    if(key === 'style') {
      for(let styleName in props.style) {
        el.style[styleName] = props.style[styleName];
      }
    } else {
      el.setAttribute(key, props[key])
    }
  }
}

export function patch(oldVNode, vnode) {
  const isRealElement = oldVNode.nodeType;
  if (isRealElement) {
    const elm = oldVNode; //获取真实元素

    const parentElm = elm.parentNode; //拿到父元素
    let newElm = createElm(vnode);
    // console.log(newElm);
    parentElm.insertBefore(newElm, elm.nextSibling); //找到老节点将新生成的插入到他后面
    parentElm.removeChild(elm); //删除节点

    return newElm

  } else {
    // diff算法
    // 1.两个节点不是同一个节点，直接删除老的换上新的 （没有比对了）
    // 2.两个节点是同一个节点（判断节点的tag和节点的key） 比较两个节点的属性是否有差异（复用老的节点，将差异的属性更新）
    return patchVNode(oldVNode, vnode)
  }
}
function patchVNode(oldVNode, vnode) {

  let el = vnode.el = oldVNode.el //复用老节点的元素
  if(!isSameVnode(oldVNode, vnode)) {
    // 用老节点进行替换
    let el = createElm(vnode)
    oldVNode.el.parentNode.replaceChild(el ,oldVNode.el)
    return el
  }
  // 文本的情况，文本我们要比较下文本的内容
  if(!oldVNode.tag) { // 文本
    if(!oldVNode.text !== vnode.text) {
      el.textContent = vnode.text; //用新的文本覆盖掉老的
    }
  }
  // 是标签， 我们比较标签的属性
  patchProps(el, oldVNode.data, vnode.data)

  // 比较子节点 比较的时候 一方有儿子 一方没有儿子
  // 两方都有儿子
  let oldChildren = oldVNode.children || []
  let newChildren = vnode.child || []
  console.log(oldChildren, newChildren);
  if(oldChildren.length > 0 && newChildren.length > 0) {
    // 需要完整diff算法
    updateChildren(el, oldChildren, newChildren)
  } else if (newChildren.length > 0) { //没有老的有新的
    mountChildren(el, newChildren)
  } else if (oldChildren.length > 0) { //新的没有老的有要删除
    // el.innerHTML = ''
    unmountChildren(el, oldChildren)
  }


  // console.log(oldChildren, newChildren);
  return el
}

function mountChildren(el, newChildren) {
  for(let i = 0; i<newChildren.length; i++) {
    let child = newChildren[i]
    el.appendChild(createElm(child))
  }
}
function unmountChildren(el, children) {
  children.forEach((child) => removeChild(el, child.el));
}
function updateChildren(el, oldChildren, newChildren) {
  // 我们操作列表经常会是有 push shift pop unshift reverse sort这些方法（针对这些情况做一个优化） 
  // vue2中采用双指针的方式 比较两个节点
  let oldStartIndex = 0;
  let newStartIndex = 0;
  let oldEndIndex = oldChildren.length - 1;
  let newEndIndex = newChildren.length - 1;

  let oldStartVnode = oldChildren[0];
  let newStartVnode = newChildren[0];

  let oldEndVnode = oldChildren[oldEndIndex];
  let newEndVnode = newChildren[newEndIndex];

  while(oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) { //有一个不满足就停止
    // 双方有一方指针，大于尾部指针则停止循环
  }

  console.log(oldStartVnode, newStartVnode, oldEndVnode, newEndVnode);
}
