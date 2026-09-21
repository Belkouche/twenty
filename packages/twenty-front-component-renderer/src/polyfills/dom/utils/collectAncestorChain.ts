import { isObject } from '@sniptt/guards';

type NodeLike = {
  parentNode?: unknown;
};

export const collectAncestorChain = (node: unknown): object[] => {
  const ancestorChain: object[] = [];
  let currentNode: unknown = node;

  while (isObject(currentNode)) {
    ancestorChain.unshift(currentNode);
    currentNode = (currentNode as NodeLike).parentNode;
  }

  return ancestorChain;
};
