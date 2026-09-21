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

const findDivergenceIndex = (
  firstChain: object[],
  secondChain: object[],
): number => {
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

const resolveChildIndex = (parent: object, child: object): number => {
  const childNodes = (parent as NodeWithChildNodes).childNodes;

  return isDefined(childNodes)
    ? Array.prototype.indexOf.call(childNodes, child)
    : -1;
};

function compareDocumentPosition(this: object, otherNode: unknown): number {
  if (otherNode === this) {
    return 0;
  }

  const thisChain = collectAncestorChain(this);
  const otherChain = collectAncestorChain(otherNode);

  if (thisChain[0] !== otherChain[0]) {
    return (
      DOCUMENT_POSITION_FLAGS.DISCONNECTED |
      DOCUMENT_POSITION_FLAGS.IMPLEMENTATION_SPECIFIC |
      DOCUMENT_POSITION_FLAGS.PRECEDING
    );
  }

  const divergenceIndex = findDivergenceIndex(thisChain, otherChain);

  if (divergenceIndex === otherChain.length) {
    return DOCUMENT_POSITION_FLAGS.CONTAINS | DOCUMENT_POSITION_FLAGS.PRECEDING;
  }

  if (divergenceIndex === thisChain.length) {
    return (
      DOCUMENT_POSITION_FLAGS.CONTAINED_BY | DOCUMENT_POSITION_FLAGS.FOLLOWING
    );
  }

  const commonParent = thisChain[divergenceIndex - 1];
  const thisBranchIndex = resolveChildIndex(
    commonParent,
    thisChain[divergenceIndex],
  );
  const otherBranchIndex = resolveChildIndex(
    commonParent,
    otherChain[divergenceIndex],
  );

  return otherBranchIndex < thisBranchIndex
    ? DOCUMENT_POSITION_FLAGS.PRECEDING
    : DOCUMENT_POSITION_FLAGS.FOLLOWING;
}

export const installCompareDocumentPosition = ({
  nodeConstructor,
  nodePrototype,
}: InstallCompareDocumentPositionInput): void => {
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
