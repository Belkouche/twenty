import { type WorkerActiveElementStore } from '@/polyfills/dom/types/WorkerActiveElementStore';

type InstallFocusAndBlurMethodsPolyfillInput = {
  elementPrototype: object;
  activeElementStore: WorkerActiveElementStore;
};

export const installFocusAndBlurMethodsPolyfill = ({
  elementPrototype,
  activeElementStore,
}: InstallFocusAndBlurMethodsPolyfillInput): void => {
  Object.defineProperty(elementPrototype, 'focus', {
    value: function (this: object): void {
      activeElementStore.setActiveElement(this);
    },
    configurable: true,
    writable: true,
  });

  Object.defineProperty(elementPrototype, 'blur', {
    value: function (this: object): void {
      if (activeElementStore.getActiveElement() === this) {
        activeElementStore.setActiveElement(null);
      }
    },
    configurable: true,
    writable: true,
  });
};
