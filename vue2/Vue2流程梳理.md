#### 配置文件

```js
// rollup默认可以导出一个对象 作为打包的配置文件
import babel from "rollup-plugin-babel";
import resolve from 'rollup-plugin-node-resolve'
export default {
  // 入口
  input: "./src/index.js",
  // 出口
  output: {
    // 生成的文件
    file: "./dist/vue.js",
    // 全局对象 Vue 在global(浏览器端就是window)上挂载一个属性 Vue
    name: "Vue",
    // 打包方式 esm commonjs模块 iife自执行函数 umd 统一模块规范 -> 兼容cmd和amd
    format: "umd",
    // 打包后和源代码做关联
    sourcemap: true,
  },
  plugins: [
    babel({
      // 排除第三方模块
      exclude: "node_modules/**",
    }),
    // 自动找文件夹下的index文件
    resolve()
  ],
};xxxxxxxxxx componentInstance// rollup默认可以导出一个对象 作为打包的配置文件import babel from "rollup-plugin-babel";import resolve from 'rollup-plugin-node-resolve'export default {  // 入口  input: "./src/index.js",  // 出口  output: {    // 生成的文件    file: "./dist/vue.js",    // 全局对象 Vue 在global(浏览器端就是window)上挂载一个属性 Vue    name: "Vue",    // 打包方式 esm commonjs模块 iife自执行函数 umd 统一模块规范 -> 兼容cmd和amd    format: "umd",    // 打包后和源代码做关联    sourcemap: true,  },  plugins: [    babel({      // 排除第三方模块      exclude: "node_modules/**",    }),    // 自动找文件夹下的index文件    resolve()  ],};
```

#### 核心流程

1. 创建响应式数据（数据劫持）

2. 模板编译  生成ast

3. ast转换成render函数  后续每次数据更新 只执行render函数（不需要再次进行ast的转化）

4. render函数执行生成vnode节点（会使用到响应式数据）

5. 根据vnode生成真实dom渲染页面

6. 数据更新 重新执行render

   ##### 数据劫持

   Vue2使用的是Object.definedProperty， Vue3使用的是proxy

   ##### 模板编译为ast

   vue2中使用的是正则表达式来匹配，然后转换成ast树

   vue2采用的是虚拟dom数据变化后比较虚拟dom的差异，最后更新需要更新的地方，核心就是我们需要将模板变成我们的js语法 通过js语法生成虚拟dom，语法之间的转化，需要先变成抽象语法树ast在组装新的语法，这里就是把template语法转为render函数

   ##### ast转render

   把生成的ast语法树，通过字符串拼接等方式转为render函数，render函数内部主要用到

   1. _c函数：创建元素虚拟dom节点
   2. _v函数：创建文本虚拟dom节点
   3. _s函数：将函数内部的变量字符串化

   ##### render函数生成真实dom

   调用render函数会生成虚拟dom，然后把虚拟dom转为真实dom挂载到页面

   

   ###### 完成了，虚拟和真实dom的渲染，也完成了响应式数据的处理，之后就需要进行视图和响应式数据的关联，在渲染页面的时候，收集依赖

   1. 使用观察者模式实现依赖收集
   2. 异步更新策略
   3. mixin的实现原理

   ##### 模板的依赖收集

   给模板中属性增加一个收集器（dep）。这个收集器就是给每个属性单独增加的。页面渲染的时候，我们把渲染逻辑封装到watcher中，（就是这个vm._update(vm._render())）。让dep记住这个watcher，在属性变化了以后，可以找到对应的dep中存放的watcher，然后重新渲染页面

   ```js
   watcher进行实际的视图渲染
   每个组件都有自己的watcher，可以减少每次更新页面的部分
   给每个属性增加一个dep，目的是收集watcher
   一个视图（组件）可能会有很多属性，多个属性对应一个视图 n个dep对应1个watcher
   一个属性也可以对应多个视图（组件）
   每个属性都有自己的dep，属性就是被观察者
   watcher就是观察者（属性变化了会通知观察者进行视图更新）
   
   class Watcher{}
   ```

   先让watcher收集dep，如果dep已经收集过，则不会再次收集，当dep被收集时，我们会让dep反向收集当前的watcher，实现二者的双向收集

   

   然后在响应式数据变化时通知dep的观察者进行视图更新，正常情况下，更新两次视图是没有问题的，但是此时两次数据的更新发生在一次同步代码中，我们应该让视图的更新是异步的，这样在一次操作更新多个数据的情况下，也只会渲染一次视图，提高渲染速率。

   这个我们就需要合并更新，在所有的更新数据处理完成后再刷新页面，就是批处理，事件环

   ##### 事件环

   同步代码执行完后，再执行视图的渲染（异步任务），我们把更新操作延迟

   方法就是使用一个队列维护需要更新的watcher，第一次更新属性的时候，就开启一个定时器，清空所有的watcher。后续的数据改变时，都不会再次开启定时器，只需要把新的watcher放入队列（需要去重）

   但这个清空操作是在同步代码执行完毕再去执行的

   ```js
   // watcher queue 本次需要更新的视图队列
   let queue = []
   // watcher 去重  {0:true,1:true}
   let has  = {}
   // 批处理 也可以说是防抖
   let pending = false
   /**
    * 不管执行多少次update操作，但是我们最终只执行一轮刷新操作
    */
   function queueWatcher(watcher) {
       const id = watcher.id
       if(!has[id]) {
           queue.push(watcher)
           has[id] = true
           if(!pending) {
                // 刷新队列 多个属性刷新 其实执行的只是第一次 合并刷新了
               setTimeout(flushSchedulerQueue, 0)
               pending = true
           }
       }
   }
   /**
    * 刷新调度队列 且清理当前的标识 has pending 等都重置
    * 先执行第一批的watcher，如果刷新过程中有新的watcher产生，再次加入队列即可
    */
   function flushSchedulerQueue() {
       const flushQueue = [...queue]
       queue = []
       has = {}
       pending = false
       flushQueue.forEach(watcher => watcher.run()) //run就是render
   }
   ```

   





