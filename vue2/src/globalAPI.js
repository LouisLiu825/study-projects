import { mergeOptions } from "./utils"


export function initGlobalAPI(Vue) {
  Vue.options = {}
  
  Vue.mixin = function (mixin) {
    // 将用户选项和全局options进行合并
    this.options = mergeOptions(this.options, mixin);
    return this
  }
}
