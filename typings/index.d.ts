declare module '@zxj/micro' {
   import type { PluginOption } from 'vite';
   import type { Component } from 'vue';

   export type ProxyWindow = Window;

   type EventDataType = unknown;

   type EventCallback = (data?: EventDataType) => void;

   export interface MicroAppEvent {
      on: (type: string, callback?: EventCallback) => void;
      dispatch: (type: string, data?: DataType) => void;
      off: (type?: string, callback?: EventCallback) => void;
      clear: () => void;
   }

   export type MicroAppStatus = 'init' | 'mount' | 'unmount';

   export type ScriptItem = {
      type: string;
      isModule: boolean;
      isNoModule: boolean;
      isExternal: boolean;
      code: string;
      href: string;
      id: string;
      dataSrc: string;
   }

   export type LinkItem = {
      code: string;
      href: string;
   }

   export type MircoAppOptions = {
      name: string;
      url: string;
      disableStyleSandbox?: boolean;
      externalLinks?: string[];
      module?: boolean;
   }

   /**
    * 以下是导出给项目中使用的
    */
   export type appEvent = MicroAppEvent;

   export type baseAppEvent = MicroAppEvent;

   export interface MicroAppSideEffect {
      evt: MicroAppEvent
   }

   export type MicroApp = Component

   export function microAppVitePlugin (): PluginOption;
}
