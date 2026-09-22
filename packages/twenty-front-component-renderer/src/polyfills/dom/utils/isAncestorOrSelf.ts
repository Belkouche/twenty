import { isObject } from '@sniptt/guards';

type NodeLike = {
  parentNode?: unknown;
};

export const isAncestorOrSelf = (
  candidateAncestor: object,
  node: unknown,
): boolean => {
  let currentNode: unknown = node;

  while (isObject(currentNode)) {
    if (currentNode === candidateAncestor) {
      return true;
    }

    currentNode = (currentNode as NodeLike).parentNode;
  }

  return false;
};
