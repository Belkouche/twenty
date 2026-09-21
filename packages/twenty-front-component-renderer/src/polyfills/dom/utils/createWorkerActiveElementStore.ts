import { type WorkerActiveElementStore } from '@/polyfills/dom/types/WorkerActiveElementStore';

export const createWorkerActiveElementStore = (): WorkerActiveElementStore => {
  let activeElement: object | null = null;

  return {
    getActiveElement: () => activeElement,
    setActiveElement: (element) => {
      activeElement = element;
    },
  };
};
