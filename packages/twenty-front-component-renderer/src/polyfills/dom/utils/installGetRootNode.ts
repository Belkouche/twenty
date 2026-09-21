import { collectAncestorChain } from '@/polyfills/dom/utils/collectAncestorChain';

export const installGetRootNode = (nodePrototype: object): void => {
  Object.defineProperty(nodePrototype, 'getRootNode', {
    value: function (this: object): object {
      return collectAncestorChain(this)[0] ?? this;
    },
    configurable: true,
    writable: true,
  });
};
