import { isAncestorOrSelf } from '@/polyfills/dom/utils/isAncestorOrSelf';

export const installNodeContains = (nodePrototype: object): void => {
  Object.defineProperty(nodePrototype, 'contains', {
    value: function (this: object, otherNode: unknown): boolean {
      return isAncestorOrSelf(this, otherNode);
    },
    configurable: true,
    writable: true,
  });
};
