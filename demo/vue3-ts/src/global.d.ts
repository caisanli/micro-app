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
  '_zxj_micro_vue3-ts'?: MicroSideEffect;
}
