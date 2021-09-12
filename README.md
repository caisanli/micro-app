# 众信佳微前端方案
> 基于Vue组件方案，不支持其他框架

### 1、什么是微前端
----

### 2、为什么使用
----
一句话：`交互性好及更新公共模块方便`
由于一开始采用的方案是`MPA`，主系统切换到子系统、子系统切换主系统会造成浏览器重刷，用户体验会存在断点。
还有就是目前用户中心2.0（主系统），会整合所有子系统的头部导航和消息通知。意思是，子系统的头部导航和消息通知都在主系统里，方便后续更新导航、消息通知模块的时候，只需要在主系统更新就行。
### 3、如何实现
----
实现逻辑是参考：[Micro App](https://zeroing.jd.com/micro-app/docs.html#/)
##### 3.1、前提
* 兼容IE10
* 沙箱隔离，各个系统的JS代码不冲突
* 样式隔离，各个系统的样式不冲突
* 消息通信，主系统和子系统相互通信
##### 3.2、兼容IE10
>为什么还有人要用IE？？？？

由于要兼容IE10以上，所以会抛弃目前一些常用的微前端方案：基于`Proxy`API的沙箱环境、`Web Components`自定义组件。

##### 3.3、沙箱隔离
> 沙箱隔离是保证各个系统之间的JS代码不冲突。

目前采用的沙箱隔离方式是`Diff`沙箱，大概原理就是：在进入子系统的时候，将`window`上的属性拷贝一份，生成一份`快照`，在离开子系统的时候，对比`快照`和目前的`window`上的属性，并还原`window`。
但是采用`Diff`沙箱，只能支持单个子系统存在，不然子系统之间可能会代码冲突。不过，目前`用户中心2.0`同时只会存在一个子系统，可适用该方案。
```javascript
/**
 * 基于Diff沙箱
 */
class DiffSandbox {
  constructor() {
    this.active = false; // 沙箱状态
    this.modifyMap = {} // 存放修改的属性
    this.windowSnapshot = {} // windows的快照
    // this.proxyWindow = window;
  }
  start() {
    if(this.active) {
        return ;
    }
    this.active = true;
    // 缓存window对象上的属性
    this.windowSnapshot = {}
    for (const item in window) {
      this.windowSnapshot[item] = window[item]
    }
    // Object.keys(this.modifyMap).forEach((p) => {
    //   window[p] = this.modifyMap[p]
    // })
  }
  stop() {
    if(!this.active) {
        return ;
    }
    this.active = false;
    // 还原window的属性
    for (const item in window) {
      if (this.windowSnapshot[item] !== window[item]) {
        // 记录变更
        // this.modifyMap[item] = window[item]
        // 还原window
        if(item === '0') continue;
        window[item] = this.windowSnapshot[item]
      }
    }
  }
}
```
由于目前我们的项目都是采用`vueCli`打包，每个系统默认打包的包名都为`jsonpFunction`，在加载系统的时候会导致加载资源出错，如组件无法找到...。目前的方案就是，更改`vue.config.js`中的`webpack`配置，给每个子应用设置一个单独的名称。
```javascript
module.exports = {
  //其它代码
  configureWebpack: {
      //其它代码
      output: {
        jsonpFunction: `${子系统前缀}JsonpFunction`,
    }
  }
  
}
```
### 4、需要注意
----

