import { isDefined } from 'twenty-shared/utils';

import { type WorkerActiveElementStore } from '@/polyfills/dom/types/WorkerActiveElementStore';

type ConnectableNode = {
  isConnected?: boolean;
};

const isDetached = (element: object): boolean =>
  (element as ConnectableNode).isConnected === false;

export const createWorkerActiveElementStore = (): WorkerActiveElementStore => {
  let activeElement: object | null = null;

  return {
    getActiveElement: () =>
      isDefined(activeElement) && !isDetached(activeElement)
        ? activeElement
        : null,
    setActiveElement: (element) => {
      activeElement = element;
    },
  };
};
