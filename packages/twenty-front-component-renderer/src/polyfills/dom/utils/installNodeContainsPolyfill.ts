import { isAncestorOrSelfOfNode } from '@/polyfills/dom/utils/isAncestorOrSelfOfNode';

export const installNodeContainsPolyfill = (nodePrototype: object): void => {
  Object.defineProperty(nodePrototype, 'contains', {
    value: function (this: object, otherNode: unknown): boolean {
      return isAncestorOrSelfOfNode(this, otherNode);
    },
    configurable: true,
    writable: true,
  });
};
