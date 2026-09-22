import { type WorkerActiveElementStore } from '@/polyfills/dom/types/WorkerActiveElementStore';
import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { isElementFocusable } from '@/polyfills/selectors/utils/isElementFocusable';

type InstallFocusAndBlurMethodsPolyfillInput = {
  elementPrototype: object;
  activeElementStore: WorkerActiveElementStore;
};

export const installFocusAndBlurMethodsPolyfill = ({
  elementPrototype,
  activeElementStore,
}: InstallFocusAndBlurMethodsPolyfillInput): void => {
  Object.defineProperty(elementPrototype, 'focus', {
    value: function (this: SelectorElementLike): void {
      if (!isElementFocusable(this)) {
        return;
      }

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
