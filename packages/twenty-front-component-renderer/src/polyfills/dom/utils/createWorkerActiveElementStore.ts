import { type Hooks } from '@remote-dom/polyfill';
import { isDefined } from 'twenty-shared/utils';

import { type WorkerActiveElementStore } from '@/polyfills/dom/types/WorkerActiveElementStore';
import { isAncestorOrSelfOfNode } from '@/polyfills/dom/utils/isAncestorOrSelfOfNode';

type NodeWithIsConnected = {
  isConnected?: boolean;
};

const isElementDetachedFromDocument = (element: object): boolean =>
  (element as NodeWithIsConnected).isConnected === false;

export const createWorkerActiveElementStore = ({
  hooks,
}: {
  hooks: Partial<Hooks> | null;
}): WorkerActiveElementStore => {
  if (!isDefined(hooks)) {
    throw new Error('Worker focus tracking requires DOM mutation hooks');
  }

  let activeElement: object | null = null;
  const previousRemoveChildHook = hooks.removeChild;

  hooks.removeChild = (...args) => {
    const [, removedNode] = args;

    if (
      isDefined(activeElement) &&
      isAncestorOrSelfOfNode(removedNode, activeElement)
    ) {
      activeElement = null;
    }

    previousRemoveChildHook?.(...args);
  };

  return {
    getActiveElement: () => {
      if (
        isDefined(activeElement) &&
        isElementDetachedFromDocument(activeElement)
      ) {
        activeElement = null;
      }

      return activeElement;
    },
    setActiveElement: (element) => {
      if (isDefined(element) && isElementDetachedFromDocument(element)) {
        return;
      }

      activeElement = element;
    },
  };
};
