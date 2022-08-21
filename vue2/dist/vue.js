(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

  // 静态方法
  var strats = {};
  var LIFECYCLE = ['beforeCreate', 'created'];
  LIFECYCLE.forEach(function (hook) {
    strats[hook] = function (p, c) {
      if (c) {
        //如果儿子有 父亲有  让父亲和儿子拼在一起
        if (p) {
          return p.concat(c);
        } else {
          return [c]; // 儿子有父亲没有 ，则将儿子包装成数组
        }
      } else {
        return p; // 如果儿子没有则用父亲即可
      }
    };
  });

  strats.components = function (parentVal, childVal) {
    var res = Object.create(parentVal);

    if (childVal) {
      for (var key in childVal) {
        res[key] = childVal[key]; //返回的是构造的对象，可以拿到父亲原型上的属性，并且将儿子的都拷贝到自己身上
      }
    }

    return res;
  };

  function mergeOptions(parent, child) {
    var options = {};

    for (var key in parent) {
      mergeField(key);
    }

    for (var _key in child) {
      if (!parent.hasOwnProperty(_key)) {
        mergeField(_key);
      }
    }

    function mergeField(key) {
      // 采用策略模式 减少if/else
      if (strats[key]) {
        options[key] = strats[key](parent[key], child[key]);
      } else {
        // 不在策略中则以儿子为主
        options[key] = child[key] || parent[key];
      }
    }

    return options;
  }

  function initGlobalAPI(Vue) {
    Vue.options = {};

    Vue.mixin = function (mixin) {
      // 将用户选项和全局options进行合并
      this.options = mergeOptions(this.options, mixin);
      return this;
    }; // 可以手动创建组件进行挂载


    Vue.extend = function (options) {
      function Sub() {
        // 最终使用一个组件，就是new一个实例
        this._init(); //就是默认对子类进行初始化操作

      }

      Sub.prototype = Object.create(Vue.prototype); // sub.prototype.__proto = Vue.prototype

      Sub.prototype.constructor = Sub; // 希望将用户的传递的参数 和全局的Vue.options来合并

      Sub.options = mergeOptions(Vue.options, options); //保存用户传递的选项

      return Sub;
    };

    Vue.options.components = {};

    Vue.component = function (id, definition) {
      // 如果definition已经是一个函数了 说明用户自己调用了Vue.extend
      definition = typeof definition === 'function' ? definition : Vue.extend(definition);
      Vue.options.components[id] = definition;
      console.log(Vue.options.components);
    };
  }

  function _typeof(obj) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArrayLimit(arr, i) {
    var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];

    if (_i == null) return;
    var _arr = [];
    var _n = true;
    var _d = false;

    var _s, _e;

    try {
      for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z]*";
  var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")");
  var startTagOpen = new RegExp("^<".concat(qnameCapture)); // 匹配的分组是个标签名 <xxx 匹配到的是开始 标签的名字

  var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]*>")); // 匹配的是</xxx> 最终匹配到的分组 就是结束标签的名字

  var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性 第一个分组是属性的key value就是分组3/分组4/分组5

  var startTagClose = /^\s*(\/?)>/; // <div> <br/>

  function parseHTML(html) {
    // html最开始肯定是一个 <div>hello</div>
    var ELEMENT_TYPE = 1;
    var TEXT_TYPE = 3;
    var stack = []; // 用于存放元素

    var currentParent; //指向的是栈中的最后一个

    var root;

    function createASTElement(tag, attrs) {
      return {
        tag: tag,
        type: ELEMENT_TYPE,
        children: [],
        attrs: attrs,
        parent: null
      };
    } // 利用栈型结构来构造一颗树


    function start(tag, attrs) {
      // console.log(111, tag, attrs);
      var node = createASTElement(tag, attrs); //创造一个ast节点

      if (!root) {
        // 判断是否是空树
        root = node; //如果为空则当前是树的根节点
      }

      if (currentParent) {
        node.parent = currentParent; // 只赋予了parent属性

        currentParent.children.push(node); // 还需要让父亲记住自己
      }

      stack.push(node);
      currentParent = node; //currentParent为栈中的最后一个
    }

    function chars(text) {
      // 文本直接放到当前指向的节点中
      // console.log(222, text);
      text = text.replace(/\s/g, '');
      text && currentParent.children.push({
        type: TEXT_TYPE,
        text: text,
        parent: currentParent
      });
    }

    function end(tag) {
      // console.log(333, tag);
      stack.pop(); //弹出最后一个，标签是否合法

      currentParent = stack[stack.length - 1];
    }

    function advance(n) {
      html = html.substring(n);
    }

    function parseStartTag() {
      var start = html.match(startTagOpen);

      if (start) {
        var match = {
          tagName: start[1],
          attrs: []
        };
        advance(start[0].length); //截取也就是删除（就是刚刚匹配的标签）
        // 如果不是开始标签的结束就一直匹配下去

        var attr, _end;

        while (!(_end = html.match(startTagClose)) && (attr = html.match(attribute))) {
          advance(attr[0].length);
          match.attrs.push({
            name: attr[1],
            value: attr[3] || attr[4] || attr[5] || true
          });
        } // 有结束标签


        if (_end) {
          advance(_end[0].length);
        }

        return match;
      }

      return false; // 说明不是标签
    }

    while (html) {
      // 如果textEnd为0， 说明是一个开始标签或者结束标签
      // 如果textEnd > 0， 说明就是文本结束的位置
      var textEnd = html.indexOf("<"); //如果indexOf中的索引是0，则说明是个标签

      if (textEnd === 0) {
        var startTagMatch = parseStartTag(); // 开始标签的匹配结果

        if (startTagMatch) {
          // 解析到开始标签
          start(startTagMatch.tagName, startTagMatch.attrs);
          continue;
        }

        var endTagMatch = html.match(endTag);

        if (endTagMatch) {
          advance(endTagMatch[0].length);
          end(endTagMatch[1]);
          continue;
        }
      }

      if (textEnd > 0) {
        var text = html.substring(0, textEnd); // 就是文本内容

        if (text) {
          chars(text);
          advance(text.length); // 解析到的文本
        } // break

      }
    }

    return root;
  }

  function genProps(attrs) {
    var str = '';

    for (var i = 0; i < attrs.length; i++) {
      var attr = attrs[i];

      if (attr.name === 'style') {
        (function () {
          var obj = {};
          attr.value.split(';').forEach(function (item) {
            var _item$split = item.split(':'),
                _item$split2 = _slicedToArray(_item$split, 2),
                key = _item$split2[0],
                value = _item$split2[1];

            obj[key] = value;
          });
          attr.value = obj;
        })();
      }

      str += "".concat(attr.name, ": ").concat(JSON.stringify(attr.value), ",");
    }

    return "{".concat(str.slice(0, -1), "}");
  }

  var defaultTagRE = /\{\{((?:.|\n)+?)\}\}/g; // {{xxx}} 匹配小胡子语法

  function gen(node) {
    if (node.type === 1) {
      return codegen(node);
    } else {
      var text = node.text;

      if (!defaultTagRE.test(text)) {
        return "_v(".concat(JSON.stringify(text), ")");
      } else {
        var tokens = [];
        var match;
        defaultTagRE.lastIndex = 0;
        var lastIndex = 0;

        while (match = defaultTagRE.exec(text)) {
          // console.log(match, '-------------');
          var index = match.index; //匹配的位置

          if (index > lastIndex) {
            tokens.push(JSON.stringify(text.slice(lastIndex, index)));
          }

          tokens.push("_s(".concat(match[1].trim(), ")"));
          lastIndex = index + match[0].length;
        } // console.log(tokens);


        if (lastIndex < text.length) {
          tokens.push(text.slice(lastIndex));
        }

        return "_v(".concat(tokens.join('+'), ")");
      }
    }
  }

  function genChildren(children) {
    return children.map(function (child) {
      return gen(child);
    }).join(',');
  }

  function codegen(ast) {
    var children = genChildren(ast.children); // let code = (`_c('${ast.tag}',${ast.attrs.length > 0 ? genProps(ast.attrs) : 'null'}${ast.children.length ? `,${children}` : ''})`)

    var code = "_c('".concat(ast.tag, "',").concat(ast.attrs.length > 0 ? genProps(ast.attrs) : 'null').concat(ast.children.length ? ",".concat(children) : '', ")");
    return code;
  }

  function compileToFunction(template) {
    // 1.将template转换成ast语法树
    var ast = parseHTML(template); // 2.生成render方法，render方法执行后返回的结果就是虚拟dom
    // 模板引擎实现原理都是with + new Function

    var code = codegen(ast);
    code = "with(this){return ".concat(code, "}");
    var render = new Function(code); //根据代码生成render函数
    // console.log(render.toString());

    return render;
  }

  var id$1 = 0;

  var Dep = /*#__PURE__*/function () {
    function Dep() {
      _classCallCheck(this, Dep);

      this.id = id$1++; // 属性的dep要收集watcher

      this.subs = []; // 这里存放当前属性对应的watcher有哪些
    }

    _createClass(Dep, [{
      key: "depend",
      value: function depend() {
        // 这里我们不希望收集重复的watcher，而且刚才只是一个单向的关系，dep收集watcher
        // watcher同时也要记录dep
        // this.subs.push(Dep.target)
        Dep.target.addDep(this);
      }
    }, {
      key: "addSub",
      value: function addSub(watcher) {
        this.subs.push(watcher);
      }
    }, {
      key: "notify",
      value: function notify() {
        this.subs.forEach(function (watcher) {
          return watcher.update();
        }); //告诉watcher要更新了
      }
    }]);

    return Dep;
  }();

  Dep.target = null;
  var stack = [];
  function pushTarget(watcher) {
    stack.push(watcher);
    Dep.target = watcher;
  }
  function popTarget() {
    stack.pop();
    Dep.target = stack[stack.length - 1];
  }

  var id = 0; // 1).当我们创建渲染watcher时候会把当前的渲染watcher放到Dep.target上
  // 2).调用_render()会取值  走到get上

  var Watcher = /*#__PURE__*/function () {
    // 不同组件有不同的watcher  目前只有一个 渲染根实例的
    function Watcher(vm, expOrfn, options, cb) {
      _classCallCheck(this, Watcher);

      this.id = id++;
      this.renderWatcher = options;

      if (typeof expOrfn === 'string') {
        this.getter = function () {
          return vm[expOrfn];
        };
      } else {
        this.getter = expOrfn; // getter意味着调用这个函数可以发生取值操作
      }

      this.deps = []; // 后续我们实现计算属性和一些清理工作要用到

      this.cb = cb;
      this.depsId = new Set();
      this.lazy = options.lazy;
      this.dirty = this.lazy; //缓存值

      this.vm = vm;
      this.user = options.user; //标识是否是用户自己的watcher

      this.value = this.lazy ? undefined : this.get();
    }

    _createClass(Watcher, [{
      key: "addDep",
      value: function addDep(dep) {
        // 一个组件对应多个属性  重复属性不用记录
        var id = dep.id;

        if (!this.depsId.has(id)) {
          this.deps.push(dep);
          this.depsId.add(id);
          dep.addSub(this); // watcher已经记住dep并且去重了，此时让dep也记住watcher
        }
      }
    }, {
      key: "evaluate",
      value: function evaluate() {
        this.value = this.get(); //获取到用户函数返回值，并标识为脏

        this.dirty = false;
      }
    }, {
      key: "get",
      value: function get() {
        pushTarget(this); // Dep.target = this; // 静态属性只有一份

        var value = this.getter.call(this.vm); //一进来就会调下  会去vm上取值

        popTarget(); // Dep.target = null; // 渲染完毕清空

        return value;
      }
    }, {
      key: "depend",
      value: function depend() {
        var i = this.deps.length;

        while (i--) {
          this.deps[i].depend(); //让计算属性watcher也收集渲染watcher
        }
      }
    }, {
      key: "update",
      value: function update() {
        if (this.lazy) {
          // 如果计算属性 依赖的值变化了 就标识计算属性是脏值了
          this.dirty = true;
        } else {
          queueWatcher(this); //把当前watcher暂存起来
          // this.get() //重新渲染更新
        }
      }
    }, {
      key: "run",
      value: function run() {
        var oldValue = this.value;
        var newValue = this.get();

        if (this.user) {
          this.cb.call(this.vm, newValue, oldValue);
        }
      }
    }]);

    return Watcher;
  }();

  var queue = [];
  var has = {};
  var pending = false; //防抖

  function flushSchedulerQueue() {
    var flushQueue = queue.slice(0);
    queue = [];
    has = {};
    pending = false;
    flushQueue.forEach(function (q) {
      return q.run();
    });
  }

  function queueWatcher(watcher) {
    var id = watcher.id;

    if (!has[id]) {
      queue.push(watcher);
      has[id] = true; // 无论update执行多少次，最终我们只执行一轮更新操作

      if (!pending) {
        nextTick(flushSchedulerQueue);
        pending = true;
      }
    }
  }

  var callbacks = [];
  var waiting = false;

  function flushCallbacks() {
    var cbs = callbacks.slice(0);
    waiting = false;
    callbacks = [];
    cbs.forEach(function (cb) {
      return cb();
    }); // 按照顺序依次执行
  } // nextTick 没有直接使用某个api，而是采用优雅降级的方式
  // 内部采用的是promise(ie不兼容), MutationObserver（h5） 可以考虑ie专享的 setImmediate setTimeout


  var timerFunc;

  if (Promise) {
    timerFunc = function timerFunc() {
      Promise.resolve().then(flushCallbacks);
    };
  } else if (MutationObserver) {
    var observer = new MutationObserver(flushCallbacks);
    var textNode = document.createTextNode(1);
    observer.observe(textNode, {
      characterData: true
    });

    timerFunc = function timerFunc() {
      textNode.textContent = 2;
    };
  } else if (setImmediate) {
    timerFunc = function timerFunc() {
      setImmediate(flushCallbacks);
    };
  } else {
    timerFunc = function timerFunc() {
      setTimeout(flushCallbacks);
    };
  }

  function nextTick(cb) {
    callbacks.push(cb); // 维护nextTick中的callback方法

    if (!waiting) {
      setTimeout(function () {
        timerFunc(flushCallbacks); //最后一起更新
      }, 0);
      waiting = true;
    }
  } // 需要给每个属性增加一个dep，目的是收集watcher

  // h()  _c()
  function createElementVNode(vm, tag) {
    var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    if (data == null) {
      data = {};
    }

    var key = data.key;

    if (key) {
      delete data.key;
    }

    for (var _len = arguments.length, children = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
      children[_key - 3] = arguments[_key];
    }

    return vnode(vm, tag, key, data, children);
  } // _v()

  function createTextVNode(vm, text) {
    return vnode(vm, undefined, undefined, undefined, undefined, text);
  } // ast做的是 语法层面的转化，描述的是语法本身（描述html，css，js）
  // 这里则是虚拟dom描述的是dom元素，可以增加一些自定义属性（描述dom的）

  function vnode(vm, tag, key, data, children, text) {
    return {
      vm: vm,
      tag: tag,
      key: key,
      data: data,
      children: children,
      text: text
    };
  }

  function isSameVnode(vnode1, vnode2) {
    return vnode1.tag === vnode2.tag && vnode1.key === vnode2.key;
  }

  function createElm(vnode) {
    var tag = vnode.tag,
        data = vnode.data,
        children = vnode.children,
        text = vnode.text;

    if (typeof tag === 'string') {
      vnode.el = document.createElement(tag); //这里将真实节点和虚拟节点相对应，后续如果修改属性了，通过虚拟节点找到真实节点

      patchProps(vnode.el, {}, data);
      children.forEach(function (child) {
        vnode.el.appendChild(createElm(child));
      });
    } else {
      vnode.el = document.createTextNode(text);
    }

    return vnode.el;
  }
  function patchProps(el) {
    var oldProps = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var props = arguments.length > 2 ? arguments[2] : undefined;
    // 老的属性中有，新的没有，要删除老的
    var oldStyles = oldProps.style || {};
    var newStyles = props.style || {};

    for (var key in oldStyles) {
      //老的样式中有 新的没有则删除
      if (!newStyles[key]) {
        el.style[key] = '';
      }
    }

    for (var _key in oldProps) {
      //老的属性有
      if (!props[_key]) {
        //新的没有则删除属性
        el.removeAttribute(_key);
      }
    }

    for (var _key2 in props) {
      //用新的覆盖掉老的
      if (_key2 === 'style') {
        for (var styleName in props.style) {
          el.style[styleName] = props.style[styleName];
        }
      } else {
        el.setAttribute(_key2, props[_key2]);
      }
    }
  }
  function patch(oldVNode, vnode) {
    var isRealElement = oldVNode.nodeType;

    if (isRealElement) {
      var elm = oldVNode; //获取真实元素

      var parentElm = elm.parentNode; //拿到父元素

      var newElm = createElm(vnode); // console.log(newElm);

      parentElm.insertBefore(newElm, elm.nextSibling); //找到老节点将新生成的插入到他后面

      parentElm.removeChild(elm); //删除节点

      return newElm;
    } else {
      // diff算法
      // 1.两个节点不是同一个节点，直接删除老的换上新的 （没有比对了）
      // 2.两个节点是同一个节点（判断节点的tag和节点的key） 比较两个节点的属性是否有差异（复用老的节点，将差异的属性更新）
      return patchVNode(oldVNode, vnode);
    }
  }

  function patchVNode(oldVNode, vnode) {
    var el = vnode.el = oldVNode.el; //复用老节点的元素

    if (!isSameVnode(oldVNode, vnode)) {
      // 用老节点进行替换
      var _el = createElm(vnode);

      oldVNode.el.parentNode.replaceChild(_el, oldVNode.el);
      return _el;
    } // 文本的情况，文本我们要比较下文本的内容


    if (!oldVNode.tag) {
      // 文本
      if (!oldVNode.text !== vnode.text) {
        el.textContent = vnode.text; //用新的文本覆盖掉老的
      }
    } // 是标签， 我们比较标签的属性


    patchProps(el, oldVNode.data, vnode.data); // 比较子节点 比较的时候 一方有儿子 一方没有儿子
    // 两方都有儿子

    var oldChildren = oldVNode.children || [];
    var newChildren = vnode.child || []; // console.log(oldChildren, newChildren);

    if (oldChildren.length > 0 && newChildren.length > 0) {
      // 需要完整diff算法
      updateChildren(el, oldChildren, newChildren);
    } else if (newChildren.length > 0) {
      //没有老的有新的
      mountChildren(el, newChildren);
    } else if (oldChildren.length > 0) {
      //新的没有老的有要删除
      el.innerHTML = ''; // unmountChildren(el, oldChildren)
    } // console.log(oldChildren, newChildren);


    return el;
  }

  function mountChildren(el, newChildren) {
    for (var i = 0; i < newChildren.length; i++) {
      var child = newChildren[i];
      el.appendChild(createElm(child));
    }
  }

  function updateChildren(el, oldChildren, newChildren) {
    // 我们操作列表经常会是有 push shift pop unshift reverse sort这些方法（针对这些情况做一个优化） 
    // vue2中采用双指针的方式 比较两个节点
    var oldStartIndex = 0;
    var newStartIndex = 0;
    var oldEndIndex = oldChildren.length - 1;
    var newEndIndex = newChildren.length - 1;
    var oldStartVnode = oldChildren[0];
    var newStartVnode = newChildren[0];
    var oldEndVnode = oldChildren[oldEndIndex];
    var newEndVnode = newChildren[newEndIndex];

    function makeIndexByKey(children) {
      var map = {};
      children.forEach(function (child, index) {
        map[child.key] = index;
      });
      return map;
    }

    var map = makeIndexByKey(oldChildren);
    console.log(map);

    while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
      //有一个不满足就停止
      // 双方有一方指针，大于尾部指针则停止循环
      if (!oldStartVnode) {
        oldStartVnode = oldChildren[++oldStartIndex];
      } else if (!oldEndVnode) {
        oldEndVnode = oldChildren[--oldEndIndex];
      } else if (isSameVnode(oldStartVnode, newStartVnode)) {
        patchVNode(oldStartVnode, newStartVnode); // 如果是相同节点，则递归比较子节点

        oldStartVnode = oldChildren[++oldStartIndex];
        newStartVnode = newChildren[++newStartIndex]; // 比较开头节点
      } else if (isSameVnode(oldEndVnode, newEndVnode)) {
        patchVNode(oldEndVnode, newEndVnode); // 如果是相同节点，则递归比较子节点

        oldEndVnode = oldChildren[--oldEndIndex];
        newEndVnode = newChildren[--newEndIndex]; // 比较开头节点
      } else // 交叉比对 abcd => dabc
        if (isSameVnode(oldEndVnode, newStartVnode)) {
          patchVNode(oldEndVnode, newStartVnode); // insertBefore具备移动性 会将原来的元素移动

          el.insertBefore(oldEndVnode.el, oldStartVnode.el); //将老的尾部移动到老的前面去

          oldEndVnode = oldChildren[--oldEndIndex];
          newStartVnode = newChildren[++newStartIndex];
        } else if (isSameVnode(oldStartVnode, newEndVnode)) {
          patchVNode(oldEndVnode, newStartVnode); // insertBefore具备移动性 会将原来的元素移动

          el.insertBefore(oldStartVnode.el, oldStartVnode.el.nextSibling); //将老的尾部移动到老的头部

          oldStartVnode = oldChildren[++oldStartIndex];
          newEndVnode = newChildren[--newEndIndex];
        } else {
          // 在给动态列表添加key的时候，要尽量避免使用索引，因为索引前后都是从0开始，可能会发生错误复用
          // 乱想比对
          // 根据老的列表做一个映射关系，用新的去找，找到则移动，找不到则添加，最后多余的就删除
          var moveIndex = map[newStartVnode.key]; // 如果拿到则说明是我要移动的索引

          if (moveIndex !== undefined) {
            var moveVnode = oldChildren[moveIndex];
            el.insertBefore(moveVnode.el, oldStartVnode.el);
            oldChildren[moveIndex] = undefined; //表示这个节点已经移动走了

            patchVNode(moveVnode, newStartVnode); //比对属性和子节点
          } else {
            el.insertBefore(create(newStartVnode), oldStartVnode.el);
          }

          newStartVnode = newChildren[++newStartIndex];
        }
    }

    if (newStartIndex <= newEndIndex) {
      // 新的多了多于的插入进去
      for (var i = newStartIndex; i <= newEndIndex; i++) {
        var childEl = createElm(newChildren[i]); // el.appendChild(childEl)
        // 这里可能向后追加，还有可能向前追加

        var anchor = newChildren[newEndIndex + 1] ? newChildren[newEndIndex + 1].el : null; //获取下一个元素
        // console.log(anchor);

        el.insertBefore(childEl, anchor); // anchor 为null的时候则会认为是appendChild
      }
    }

    if (oldStartIndex <= oldEndIndex) {
      // 老的多了删掉老的
      for (var _i = oldStartIndex; _i <= oldEndIndex; _i++) {
        if (oldChildren[_i].el) {
          var _childEl = oldChildren[_i].el;
          el.removeChild(_childEl);
        }
      }
    } // 我们为了比较两个儿子的时候  增强性能  我们会有些优化手段
    // 如果批量向页面中修改出入内容，浏览器会自动优化

  }

  function initLifeCycle(Vue) {
    // 将vnode转化成真实dom
    Vue.prototype._update = function (vnode) {
      var vm = this;
      var el = vm.$el; // console.log(vnode, el);
      // patch既有初始化的功能，又有更新的功能
      // const prevNode = vm._vnode
      // vm._vnode = vnode; //把组件第一次产生的虚拟节点保存到_vnode上
      // if(prevNode) { //之前渲染过了
      //   vm.$el = patch(prevNode, vnode);
      // } else {
      //   vm.$el = patch(el, vnode);
      // }

      vm.$el = patch(el, vnode);
    }; // _c('div',{}, ...children)


    Vue.prototype._c = function () {
      return createElementVNode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
    }; // _v(text)


    Vue.prototype._v = function () {
      return createTextVNode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
    };

    Vue.prototype._s = function (value) {
      if (_typeof(value) !== 'object') return value;
      return JSON.stringify(value);
    }; // 渲染虚拟dom


    Vue.prototype._render = function () {
      var vm = this; // console.log(vm.name);
      // 让with中的this指向vm
      // 当渲染的时候回去实例取值，我们可以将属性和视图绑定在一起

      return vm.$options.render.call(vm); // vm是通过ast语法转义生成的render方法
    };
  }
  function mountComponent(vm, el) {
    //这里的el是通过querySelect处理过的
    vm.$el = el; // 1. 调用render方法产生虚拟节点 虚拟dom

    var updateComponent = function updateComponent() {
      vm._update(vm._render()); //vm.$options.render() 返回的是虚拟节点

    };

    new Watcher(vm, updateComponent, true); // true用来表示是个渲染watcher
    // console.log(watcher);
    // 2. 根据虚拟dom产生真实dom
    // 3. 插入到el元素
  } // vue核心流程 
  // 1）创建了响应式数据  2）模板转换成ast语法树
  // 3） 将ast语法树转换成render函数  4）后续每次数据更新就可以只执行render函数（无需再次执行ast转化成的过程）
  // render函数会去产生虚拟节点 （使用响应式数据)
  // 根据生成的虚拟节点创造真实的dom

  function callHook(vm, hook) {
    var handlers = vm.$options[hook];

    if (handlers) {
      handlers.forEach(function (handler) {
        return handler.call(vm);
      });
    }
  }

  // 重写数租中的部分方法
  var oldArrayProto = Array.prototype; //获取数组中的原型

  var newArrayProto = Object.create(oldArrayProto);
  var methods = ['push', 'pop', 'shift', 'unshift', 'splice', 'reverse', 'sort'];
  methods.forEach(function (method) {
    newArrayProto[method] = function () {
      var _oldArrayProto$method;

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      // 重写数组的方法
      var result = (_oldArrayProto$method = oldArrayProto[method]).call.apply(_oldArrayProto$method, [this].concat(args)); //内部调用原来的方法， 函数的劫持


      var inserted;
      var ob = this.__ob__;

      switch (method) {
        case 'push':
        case 'unshift':
          inserted = args;
          break;

        case 'splice':
          inserted = args.slice(2);
      } // console.log(inserted); //新增的内容


      if (inserted) {
        // 对新传递过来的值进行观测
        ob.observeArray(inserted);
      } // console.log('更新');


      ob.dep.notify(); //数组变化了通知对应的watcher走更新逻辑

      return result;
    };
  });

  var Observer = /*#__PURE__*/function () {
    function Observer(data) {
      _classCallCheck(this, Observer);

      // Object.defineProperty只能劫持已经存在的属性(vm里面会单独为此写一些api  $set $delete)
      // 给每个对象都增加收集功能
      this.dep = new Dep(); // data.__ob__ = this

      Object.defineProperty(data, "__ob__", {
        //给对象添加个标识___ob___，判断是否被观测过
        value: this,
        enumerable: false //不可枚举

      }); // 判断是否是数组   

      if (Array.isArray(data)) {
        // 重写数组中的方法，可以修改数组本身的7个变异方法
        data.__proto__ = newArrayProto; //保留数组原有特性，并重写部分方法

        this.observeArray(data); // 观测数组
      } else {
        this.walk(data);
      }
    }

    _createClass(Observer, [{
      key: "walk",
      value: function walk(data) {
        //循环对象 对属性进行劫持
        // 重新定义属性  性能差
        Object.keys(data).forEach(function (key) {
          return defineReactive(data, key, data[key]);
        });
      }
    }, {
      key: "observeArray",
      value: function observeArray(data) {
        data.forEach(function (item) {
          return observe(item);
        }); //检测数组中的对象
      }
    }]);

    return Observer;
  }(); // 深层次嵌套会递归  递归多了性能差，不存在属性监控不到，存在的属性要重写方法


  function dependArray(value) {
    for (var i = 0; i < value.length; i++) {
      var current = value[i];
      current.__ob__ && current.__ob__.dep.depend();

      if (Array.isArray(current)) {
        dependArray(current);
      }
    }
  }

  function defineReactive(target, key, value) {
    var childOb = observe(value); //对所有对象进行属性劫持  childOb.dep就是用来收集依赖的

    var dep = new Dep(); // 让每个属性都有一个dep

    Object.defineProperty(target, key, {
      get: function get() {
        if (Dep.target) {
          dep.depend(); //这个属性收集器dep记住当前的watcher

          if (childOb) {
            childOb.dep.depend(); //让数组和对象本身也进行依赖收集

            if (Array.isArray(value)) {
              dependArray(value);
            }
          }
        }

        return value;
      },
      set: function set(newValue) {
        if (newValue === value) return;
        observe(newValue);
        value = newValue;
        dep.notify();
      }
    });
  }
  function observe(data) {
    // console.log(data);
    // 对对象进行数据劫持
    if (_typeof(data) !== 'object' || data == null) {
      return; // 只对对象进行劫持
    }

    if (data.__ob__ instanceof Observer) {
      //说明这个对象被代理过看
      return data.__ob__;
    } // 判断对象是否被劫持 （添加一个实例，用实例判断是否被劫持过）


    return new Observer(data);
  }

  function initState(vm) {
    // 数据劫持
    var opts = vm.$options; //获取所有的选项

    if (opts.data) {
      //有数据初始化数据
      initData(vm);
    }

    if (opts.computed) {
      initComputed(vm);
    }

    if (opts.watch) {
      initWatch(vm);
    }
  }

  function initWatch(vm) {
    var watch = vm.$options.watch;

    for (var key in watch) {
      var handler = watch[key];

      if (Array.isArray(handler)) {
        for (var i = 0; i < handler.length; i++) {
          createWatcher(vm, key, handler[i]);
        }
      } else {
        createWatcher(vm, key, handler);
      }
    }
  }

  function createWatcher(vm, key, handler) {
    if (typeof handler === 'string') {
      handler = vm[handler];
    }

    return vm.$watch(key, handler);
  }

  function proxy(vm, target, key) {
    Object.defineProperty(vm, key, {
      get: function get() {
        return vm[target][key];
      },
      set: function set(newValue) {
        vm[target][key] = newValue;
      }
    });
  }

  function initData(vm) {
    var data = vm.$options.data; //data可能是函数和对象

    data = typeof data === 'function' ? data.call(vm) : data;
    vm._data = data; //将返回的对象放到_data上
    // 对数据进行数据劫持

    observe(data); // 将vm._data 用vm代理

    for (var key in data) {
      proxy(vm, '_data', key);
    }
  }

  function initComputed(vm) {
    var computed = vm.$options.computed;
    var watchers = vm._computedWatchers = {}; //将计算属性watcher保存到vm上

    for (var key in computed) {
      var userDef = computed[key]; // 我们需要监控计算属性中get的变化

      var fn = typeof userDef === 'function' ? userDef : userDef.get; // 默认直接new watcher时候会立即执行fn  将属性和watcher对应起来

      watchers[key] = new Watcher(vm, fn, {
        lazy: true
      });
      defineComputed(vm, key, userDef);
    }
  }

  function defineComputed(target, key, userDef) {
    // console.log(target, key, userDef);
    typeof userDef === 'function' ? userDef : userDef.get;

    var setter = userDef.set || function () {}; // 通过实例获取到对应属性


    Object.defineProperty(target, key, {
      get: createComputedGetter(key),
      set: setter
    });
  } // 计算属性不会收集依赖，只会让自己的依赖属性去收集依赖


  function createComputedGetter(key) {
    // 检查是否要执行这个getter
    return function () {
      var watcher = this._computedWatchers[key]; //获取到对应属性的watcher

      if (watcher.dirty) {
        // 如果是脏就去执行用户传入的函数
        watcher.evaluate(); //求值后 dirty变为false 下次就不求值了
      }

      if (Dep.target) {
        // 计算属性出栈后 还有渲染watcher，应该让计算属性watcher里面的属性 也去收集上一层watcher
        watcher.depend();
      }

      return watcher.value; // 最后返回的是watcher上的值
    };
  }

  function initStateMixin(Vue) {
    Vue.prototype.$nextTick = nextTick; // 最终调用的都是这个方法

    Vue.prototype.$watch = function (expOrFn, cb) {
      new Watcher(this, expOrFn, {
        user: true
      }, cb);
    };
  }

  function initMixin(Vue) {
    Vue.prototype._init = function (options) {
      // 初始化操作
      // vue 自己的属性
      var vm = this; // 我们定义的全局指令和过滤器都会挂载到实例上

      this.$options = mergeOptions(this.constructor.options, options); //将用户的选项挂载到实例上

      callHook(vm, 'beforeCreate'); // 初始化状态 初始化计算属性

      initState(vm);
      callHook(vm, 'created');

      if (options.el) {
        vm.$mount(options.el); //实现数据的挂载
      }
    };

    Vue.prototype.$mount = function (el) {
      var vm = this;
      el = document.querySelector(el);
      var ops = vm.$options;

      if (!ops.render) {
        // 先进行查找有没有render函数
        var template; // 没有render看一下是否有template，没有就才用外部的template

        if (!ops.template && el) {
          // 没有模板但是有el
          template = el.outerHTML;
        } else {
          if (el) {
            template = ops.template; // 有el，就才用模板中的内容
          }
        } // 有template就用template


        if (template) {
          var render = compileToFunction(template);
          ops.render = render;
        }
      }

      mountComponent(vm, el); // 组件的挂载
      // console.log(ops.render); // 获取render方法
      // script 标签引用的vue.global.js，这个编译过程是在浏览器运行的
      // runtime是不包含模板编译的，整个编译是打包的时候通过loader来转义.vue文件的，用runtime的时候不能使用template
    };
  }

  // import compileToFunction from "./compiler";

  function Vue(options) {
    // options就是用户的选项
    this._init(options); // 默认调用了init

  }

  initMixin(Vue); //扩展init方法

  initLifeCycle(Vue); //vm._update vm._render

  initGlobalAPI(Vue); //实现全局api

  initStateMixin(Vue); //实现了nextTick、$watch

  return Vue;

}));
//# sourceMappingURL=vue.js.map
