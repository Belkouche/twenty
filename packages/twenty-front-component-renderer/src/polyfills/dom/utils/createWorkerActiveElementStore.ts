import { type Hooks } from '@remote-dom/polyfill';
import { isDefined } from 'twenty-shared/utils';

import { type WorkerActiveElementStore } from '@/polyfills/dom/types/WorkerActiveElementStore';
import { isAncestorOrSelf } from '@/polyfills/dom/utils/isAncestorOrSelf';

type ConnectableNode = {
  isConnected?: boolean;
};

const isDetached = (element: object): boolean =>
  (element as ConnectableNode).isConnected === false;

export const createWorkerActiveElementStore = ({
  hooks,
}: {
  hooks: Partial<Hooks> | null;
}): WorkerActiveElementStore => {
  if (!isDefined(hooks)) {
    throw new Error('Worker focus tracking requires DOM mutation hooks');
  }

  let activeElement: object | null = null;
  const removeChild = hooks.removeChild;

  hooks.removeChild = (...args) => {
    const [, removedNode] = args;

    if (
      isDefined(activeElement) &&
      isAncestorOrSelf(removedNode, activeElement)
    ) {
      activeElement = null;
    }

    removeChild?.(...args);
  };

  return {
    getActiveElement: () => {
      if (isDefined(activeElement) && isDetached(activeElement)) {
        activeElement = null;
      }

      return activeElement;
    },
    setActiveElement: (element) => {
      if (isDefined(element) && isDetached(element)) {
        return;
      }

      activeElement = element;
    },
  };
};
