
class DiffSandbox {
  constructor() {
    this.modifyMap = {} // 存放修改的属性
    this.windowSnapshot = {} // windows的快照
    this.proxyWindow = window;
  }
  start() {
    // 缓存active状态的沙箱
    this.windowSnapshot = {}
    for (const item in window) {
      this.windowSnapshot[item] = window[item]
    }
    Object.keys(this.modifyMap).forEach((p) => {
      window[p] = this.modifyMap[p]
    })
  }
  stop() {
    // 还原window的属性
    for (const item in window) {
      if (this.windowSnapshot[item] !== window[item]) {
        // 记录变更
        this.modifyMap[item] = window[item]
        // 还原window
        window[item] = this.windowSnapshot[item]
      }
    }
  }
}

export default DiffSandbox;