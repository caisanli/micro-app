/**
 * 创建shadow dom
 */

/**
 * 检测是否支持shadow dom
 */
export function isSupportShadowDom() {
  return document.createElement('div').shadowRoot !== undefined;
}
