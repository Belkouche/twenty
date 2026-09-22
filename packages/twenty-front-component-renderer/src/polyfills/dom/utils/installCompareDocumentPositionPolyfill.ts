import { isDefined } from 'twenty-shared/utils';

import { DOCUMENT_POSITION_FLAG_BY_NAME } from '@/polyfills/dom/constants/DocumentPositionFlagByName';
import { collectAncestorChainFromRootToNode } from '@/polyfills/dom/utils/collectAncestorChainFromRootToNode';

type NodeWithChildNodes = {
  childNodes?: ArrayLike<unknown>;
};

type InstallCompareDocumentPositionPolyfillInput = {
  nodeConstructor: object;
  nodePrototype: object;
};

const findFirstDivergingAncestorIndex = ({
  firstChain,
  secondChain,
}: {
  firstChain: object[];
  secondChain: object[];
}): number => {
  let index = 0;

  while (
    index < firstChain.length &&
    index < secondChain.length &&
    firstChain[index] === secondChain[index]
  ) {
    index += 1;
  }

  return index;
};

const resolveChildNodeIndexInParent = ({
  parent,
  child,
}: {
  parent: object;
  child: object;
}): number => {
  const childNodes = (parent as NodeWithChildNodes).childNodes;

  return isDefined(childNodes)
    ? Array.prototype.indexOf.call(childNodes, child)
    : -1;
};

export const installCompareDocumentPositionPolyfill = ({
  nodeConstructor,
  nodePrototype,
}: InstallCompareDocumentPositionPolyfillInput): void => {
  const orderByDisconnectedRoot = new WeakMap<object, number>();
  let nextDisconnectedRootOrder = 0;

  const resolveDisconnectedRootOrder = (root: object): number => {
    const existingOrder = orderByDisconnectedRoot.get(root);

    if (isDefined(existingOrder)) {
      return existingOrder;
    }

    const order = nextDisconnectedRootOrder++;
    orderByDisconnectedRoot.set(root, order);

    return order;
  };

  function compareDocumentPosition(this: object, otherNode: unknown): number {
    if (otherNode === this) {
      return 0;
    }

    const thisChain = collectAncestorChainFromRootToNode(this);
    const otherChain = collectAncestorChainFromRootToNode(otherNode);

    if (thisChain[0] !== otherChain[0]) {
      const doesOtherRootPrecedeThisRoot =
        resolveDisconnectedRootOrder(otherChain[0]) <
        resolveDisconnectedRootOrder(thisChain[0]);

      return (
        DOCUMENT_POSITION_FLAG_BY_NAME.DISCONNECTED |
        DOCUMENT_POSITION_FLAG_BY_NAME.IMPLEMENTATION_SPECIFIC |
        (doesOtherRootPrecedeThisRoot
          ? DOCUMENT_POSITION_FLAG_BY_NAME.PRECEDING
          : DOCUMENT_POSITION_FLAG_BY_NAME.FOLLOWING)
      );
    }

    const divergenceIndex = findFirstDivergingAncestorIndex({
      firstChain: thisChain,
      secondChain: otherChain,
    });

    if (divergenceIndex === otherChain.length) {
      return (
        DOCUMENT_POSITION_FLAG_BY_NAME.CONTAINS |
        DOCUMENT_POSITION_FLAG_BY_NAME.PRECEDING
      );
    }

    if (divergenceIndex === thisChain.length) {
      return (
        DOCUMENT_POSITION_FLAG_BY_NAME.CONTAINED_BY |
        DOCUMENT_POSITION_FLAG_BY_NAME.FOLLOWING
      );
    }

    const commonParent = thisChain[divergenceIndex - 1];
    const thisBranchIndex = resolveChildNodeIndexInParent({
      parent: commonParent,
      child: thisChain[divergenceIndex],
    });
    const otherBranchIndex = resolveChildNodeIndexInParent({
      parent: commonParent,
      child: otherChain[divergenceIndex],
    });

    return otherBranchIndex < thisBranchIndex
      ? DOCUMENT_POSITION_FLAG_BY_NAME.PRECEDING
      : DOCUMENT_POSITION_FLAG_BY_NAME.FOLLOWING;
  }

  for (const [flagName, flagValue] of Object.entries(
    DOCUMENT_POSITION_FLAG_BY_NAME,
  )) {
    for (const target of [nodeConstructor, nodePrototype]) {
      Object.defineProperty(target, `DOCUMENT_POSITION_${flagName}`, {
        value: flagValue,
        configurable: true,
      });
    }
  }

  Object.defineProperty(nodePrototype, 'compareDocumentPosition', {
    value: compareDocumentPosition,
    configurable: true,
    writable: true,
  });
};
