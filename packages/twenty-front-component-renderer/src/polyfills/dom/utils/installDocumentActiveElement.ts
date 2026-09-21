import { type WorkerActiveElementStore } from '@/polyfills/dom/types/WorkerActiveElementStore';

type DocumentWithBody = {
  body?: object | null;
};

type InstallDocumentActiveElementInput = {
  documentTarget: DocumentWithBody;
  activeElementStore: WorkerActiveElementStore;
};

export const installDocumentActiveElement = ({
  documentTarget,
  activeElementStore,
}: InstallDocumentActiveElementInput): void => {
  Object.defineProperty(documentTarget, 'activeElement', {
    get: () =>
      activeElementStore.getActiveElement() ?? documentTarget.body ?? null,
    configurable: true,
  });
};
