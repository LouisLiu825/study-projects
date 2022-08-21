import { isSameVnode } from ".";

function createComponent(vnode) {
  let i = vnode.data;
  if((i = i.hook) && (i = i.init)) {
    i(vnode); //初始化组件 找到init方法
  }
  if(vnode.componentInstance) {
    return true //说明是组件
  }
}

export function createElm(vnode) {
  let { tag, data, children, text } = vnode
  if (typeof tag === 'string') {

    // 创建真实元素 也要区分是组件还是元素
    if(createComponent(vnode)) { //组件
      return vnode.componentInstance.$el
    }

    vnode.el = document.createElement(tag);//这里将真实节点和虚拟节点相对应，后续如果修改属性了，通过虚拟节点找到真实节点

    patchProps(vnode.el,{}, data)

    children.forEach(child => {
      vnode.el.appendChild(createElm(child)) //会将组件创建的元素插入到父元素中
    })
  } else {
    vnode.el = document.createTextNode(text)
  }
  return vnode.el
}
export function patchProps(el, oldProps = {}, props) {
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

  if(!oldVNode) { //这就是组件的挂载
    return createElm(vnode) //vm.$el 对应的就是组件渲染的结果
  }
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
  // console.log(oldChildren, newChildren);
  if(oldChildren.length > 0 && newChildren.length > 0) {
    // 需要完整diff算法
    updateChildren(el, oldChildren, newChildren)
  } else if (newChildren.length > 0) { //没有老的有新的
    mountChildren(el, newChildren)
  } else if (oldChildren.length > 0) { //新的没有老的有要删除
    el.innerHTML = ''
    // unmountChildren(el, oldChildren)
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

  function makeIndexByKey(children) {
    let map = {}
    children.forEach((child, index) => {
      map[child.key] = index;
    });
    return map
  }
  let map = makeIndexByKey(oldChildren)
  console.log(map);

  while(oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) { //有一个不满足就停止
    // 双方有一方指针，大于尾部指针则停止循环
    if(!oldStartVnode){
      oldStartVnode = oldChildren[++oldStartIndex]
    } else if(!oldEndVnode) {
      oldEndVnode = oldChildren[--oldEndIndex]
    } else if(isSameVnode(oldStartVnode, newStartVnode)) {
      patchVNode(oldStartVnode, newStartVnode); // 如果是相同节点，则递归比较子节点
      oldStartVnode = oldChildren[++oldStartIndex];
      newStartVnode = newChildren[++newStartIndex]
      // 比较开头节点
    } else
    if(isSameVnode(oldEndVnode, newEndVnode)) {
      patchVNode(oldEndVnode, newEndVnode); // 如果是相同节点，则递归比较子节点
      oldEndVnode = oldChildren[--oldEndIndex];
      newEndVnode = newChildren[--newEndIndex]
      // 比较开头节点
    } else

    // 交叉比对 abcd => dabc
    if(isSameVnode(oldEndVnode, newStartVnode)) {
      patchVNode(oldEndVnode, newStartVnode);
      // insertBefore具备移动性 会将原来的元素移动
      el.insertBefore(oldEndVnode.el, oldStartVnode.el); //将老的尾部移动到老的前面去
      oldEndVnode = oldChildren[--oldEndIndex];
      newStartVnode = newChildren[++newStartIndex];

    } else if(isSameVnode(oldStartVnode, newEndVnode)) {
      patchVNode(oldEndVnode, newStartVnode);
      // insertBefore具备移动性 会将原来的元素移动
      el.insertBefore(oldStartVnode.el, oldStartVnode.el.nextSibling); //将老的尾部移动到老的头部
      oldStartVnode = oldChildren[++oldStartIndex];
      newEndVnode = newChildren[--newEndIndex]
    } else {
      // 在给动态列表添加key的时候，要尽量避免使用索引，因为索引前后都是从0开始，可能会发生错误复用
      // 乱想比对
      // 根据老的列表做一个映射关系，用新的去找，找到则移动，找不到则添加，最后多余的就删除
      let moveIndex = map[newStartVnode.key]; // 如果拿到则说明是我要移动的索引
      if(moveIndex !== undefined) {
        let moveVnode = oldChildren[moveIndex];
        el.insertBefore(moveVnode.el, oldStartVnode.el)
        oldChildren[moveIndex] = undefined; //表示这个节点已经移动走了
        patchVNode(moveVnode, newStartVnode); //比对属性和子节点
      } else {
        el.insertBefore(create(newStartVnode), oldStartVnode.el);
      }
      newStartVnode = newChildren[++newStartIndex]
    }
  }
  if (newStartIndex <= newEndIndex) { // 新的多了多于的插入进去
    for(let i = newStartIndex; i <= newEndIndex; i++) {
      let childEl = createElm(newChildren[i])
      // el.appendChild(childEl)
      // 这里可能向后追加，还有可能向前追加
      let anchor = newChildren[newEndIndex + 1] ? newChildren[newEndIndex + 1].el : null; //获取下一个元素
      // console.log(anchor);
      el.insertBefore(childEl, anchor) // anchor 为null的时候则会认为是appendChild
    }
  }
  if (oldStartIndex <= oldEndIndex) { // 老的多了删掉老的
    for(let i = oldStartIndex; i <= oldEndIndex; i++) {
      if(oldChildren[i].el) {
        let childEl = oldChildren[i].el
        el.removeChild(childEl)
      }
    }
  }

  // 我们为了比较两个儿子的时候  增强性能  我们会有些优化手段
  // 如果批量向页面中修改出入内容，浏览器会自动优化
}
