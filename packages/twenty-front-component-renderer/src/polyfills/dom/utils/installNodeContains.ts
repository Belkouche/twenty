import { isObject } from '@sniptt/guards';

type NodeLike = {
  parentNode?: unknown;
};

export const installNodeContains = (nodePrototype: object): void => {
  Object.defineProperty(nodePrototype, 'contains', {
    value: function (this: object, otherNode: unknown): boolean {
      let currentNode: unknown = otherNode;

      while (isObject(currentNode)) {
        if (currentNode === this) {
          return true;
        }

        currentNode = (currentNode as NodeLike).parentNode;
      }

      return false;
    },
    configurable: true,
    writable: true,
  });
};
