/// <reference types="vite/client" />

declare module '*.vue' {
  import { DefineComponent } from 'vue'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>
  export default component
}


interface MicroEvt {
  on: (type: string, callback?: () => void) => void;
  dispatch: (type: string, data?: any) => void;
  off: (type?: string, callback?: () => any) => void;
  clear: () => void;
}

interface MicroSideEffect {
  evt: MicroEvt
}

declare interface Window {
  '_zxj_is_micro'?: boolean;
  '_zxj_micro_vite'?: MicroSideEffect;
}