import { type Hooks } from '@remote-dom/polyfill';
import { isDefined } from 'twenty-shared/utils';

import { type WorkerActiveElementStore } from '@/polyfills/dom/types/WorkerActiveElementStore';
import { isAncestorOrSelfOfNode } from '@/polyfills/dom/utils/isAncestorOrSelfOfNode';

type NodeWithIsConnected = {
  isConnected?: boolean;
};

const isElementConnectedToDocument = (element: object): boolean =>
  (element as NodeWithIsConnected).isConnected === true;

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

  hooks.removeChild = (parent, node, index) => {
    if (
      isDefined(activeElement) &&
      isAncestorOrSelfOfNode(node, activeElement)
    ) {
      activeElement = null;
    }

    previousRemoveChildHook?.(parent, node, index);
  };

  return {
    getActiveElement: () => {
      if (
        isDefined(activeElement) &&
        !isElementConnectedToDocument(activeElement)
      ) {
        activeElement = null;
      }

      return activeElement;
    },
    setActiveElement: (element) => {
      if (isDefined(element) && !isElementConnectedToDocument(element)) {
        return;
      }

      activeElement = element;
    },
  };
};
