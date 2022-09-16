// 分类document上需要处理的属性，不同类型会进入不同的处理逻辑
export const documentProxyProperties = {
  // 子应用需要手动修正的属性方法
  modifyProperties: [
    'createElement',
    'createTextNode',
    'documentURI',
    'URL',
    'getElementsByTagName',
    'getElementsByClassName',
    'getElementsByName',
    'getElementById',
    'querySelector',
    'querySelectorAll',
    'documentElement',
    'scrollingElement',
    'forms',
    'images',
    'links',
  ],

  // 需要从shadowRoot中获取的属性
  shadowProperties: [
    'activeElement',
    'childElementCount',
    'children',
    'firstElementChild',
    'firstChild',
    'fullscreenElement',
    'lastElementChild',
    'pictureInPictureElement',
    'pointerLockElement',
    'styleSheets',
  ],

  // 需要从shadowRoot中获取的方法
  shadowMethods: [
    'append',
    'contains',
    'getSelection',
    'elementFromPoint',
    'elementsFromPoint',
    'getAnimations',
    'replaceChildren',
  ],

  // 需要从主应用document中获取的属性
  documentProperties: [
    'characterSet',
    'compatMode',
    'contentType',
    'designMode',
    'dir',
    'doctype',
    'embeds',
    'fullscreenEnabled',
    'hidden',
    'implementation',
    'lastModified',
    'pictureInPictureEnabled',
    'plugins',
    'readyState',
    'referrer',
    'visibilityState',
    'fonts',
  ],

  // 需要从主应用document中获取的方法
  documentMethods: [
    // 自己定义的
    'createTextNode',
    'createElement',
    'createEvent',
    'createComment',
    // 别人定义的
    'execCommand',
    'createRange',
    'exitFullscreen',
    'exitPictureInPicture',
    'getElementsByTagNameNS',
    'hasFocus',
    'prepend',
  ],

  // 需要从主应用document中获取的事件
  documentEvents: [
    'onpointerlockchange',
    'onpointerlockerror',
    'onbeforecopy',
    'onbeforecut',
    'onbeforepaste',
    'onfreeze',
    'onresume',
    'onsearch',
    'onfullscreenchange',
    'onfullscreenerror',
    'onsecuritypolicyviolation',
    'onvisibilitychange',
  ],

  // 无需修改原型的属性
  ownerProperties: ['head', 'body'],
};

export const rawWindow = window;
export const rawDocument = rawWindow.document;
export const rawHistory = rawWindow.history;
export const rawLocation = rawWindow.location;

// Object prototype methods
export const rawDefineProperty = Object.defineProperty;
export const rawDefineProperties = Object.defineProperties;
export const rawHasOwnProperty = Object.prototype.hasOwnProperty;
