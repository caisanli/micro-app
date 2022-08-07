declare module '@zxj/micro' {
   import type { PluginOption } from 'vite';

   export interface MicroAppEvent {
      on: (type: string, callback?: () => void) => void;
      dispatch: (type: string, data?: any) => void;
      off: (type?: string, callback?: () => any) => void;
      clear: () => void;
   }

   export interface MicroAppSideEffect {
      evt: MicroAppEvent
   }

   export function MicroAppVitePlugin (): PluginOption;
}
