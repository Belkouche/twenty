import { collectAncestorChainFromRootToNode } from '@/polyfills/dom/utils/collectAncestorChainFromRootToNode';

export const installGetRootNodePolyfill = (nodePrototype: object): void => {
  Object.defineProperty(nodePrototype, 'getRootNode', {
    value: function (this: object): object {
      return collectAncestorChainFromRootToNode(this)[0] ?? this;
    },
    configurable: true,
    writable: true,
  });
};
