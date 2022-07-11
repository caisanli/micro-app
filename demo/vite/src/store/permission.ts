import { defineStore } from 'pinia';

export default defineStore('permission', {
  state: () => ({
    isRequest: false
  }),
  getters: {
    // isRequest: (state) => {
    //   return state.isRequest;
    // },
  },
  actions: {
    setRequest(isRequest: boolean) { 
      this.isRequest = isRequest;
    }
  }
});