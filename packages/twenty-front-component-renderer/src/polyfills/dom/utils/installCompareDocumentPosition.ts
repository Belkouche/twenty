import { isDefined } from 'twenty-shared/utils';

import { DOCUMENT_POSITION_FLAGS } from '@/polyfills/dom/constants/DocumentPositionFlags';
import { collectAncestorChain } from '@/polyfills/dom/utils/collectAncestorChain';

type NodeWithChildNodes = {
  childNodes?: ArrayLike<unknown>;
};

type InstallCompareDocumentPositionInput = {
  nodeConstructor: object;
  nodePrototype: object;
};

const findDivergenceIndex = ({
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

const resolveChildIndex = ({
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

export const installCompareDocumentPosition = ({
  nodeConstructor,
  nodePrototype,
}: InstallCompareDocumentPositionInput): void => {
  const disconnectedRootOrder = new WeakMap<object, number>();
  let nextRootOrder = 0;

  const getRootOrder = (root: object): number => {
    const existingOrder = disconnectedRootOrder.get(root);

    if (isDefined(existingOrder)) {
      return existingOrder;
    }

    const order = nextRootOrder++;
    disconnectedRootOrder.set(root, order);

    return order;
  };

  function compareDocumentPosition(this: object, otherNode: unknown): number {
    if (otherNode === this) {
      return 0;
    }

    const thisChain = collectAncestorChain(this);
    const otherChain = collectAncestorChain(otherNode);

    if (thisChain[0] !== otherChain[0]) {
      const otherRootPrecedes =
        getRootOrder(otherChain[0]) < getRootOrder(thisChain[0]);

      return (
        DOCUMENT_POSITION_FLAGS.DISCONNECTED |
        DOCUMENT_POSITION_FLAGS.IMPLEMENTATION_SPECIFIC |
        (otherRootPrecedes
          ? DOCUMENT_POSITION_FLAGS.PRECEDING
          : DOCUMENT_POSITION_FLAGS.FOLLOWING)
      );
    }

    const divergenceIndex = findDivergenceIndex({
      firstChain: thisChain,
      secondChain: otherChain,
    });

    if (divergenceIndex === otherChain.length) {
      return (
        DOCUMENT_POSITION_FLAGS.CONTAINS | DOCUMENT_POSITION_FLAGS.PRECEDING
      );
    }

    if (divergenceIndex === thisChain.length) {
      return (
        DOCUMENT_POSITION_FLAGS.CONTAINED_BY | DOCUMENT_POSITION_FLAGS.FOLLOWING
      );
    }

    const commonParent = thisChain[divergenceIndex - 1];
    const thisBranchIndex = resolveChildIndex({
      parent: commonParent,
      child: thisChain[divergenceIndex],
    });
    const otherBranchIndex = resolveChildIndex({
      parent: commonParent,
      child: otherChain[divergenceIndex],
    });

    return otherBranchIndex < thisBranchIndex
      ? DOCUMENT_POSITION_FLAGS.PRECEDING
      : DOCUMENT_POSITION_FLAGS.FOLLOWING;
  }

  for (const [flagName, flagValue] of Object.entries(DOCUMENT_POSITION_FLAGS)) {
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
