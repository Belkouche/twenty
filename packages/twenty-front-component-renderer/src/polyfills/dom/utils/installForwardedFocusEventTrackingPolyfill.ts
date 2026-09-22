import { isObject } from '@sniptt/guards';

import { type WorkerActiveElementStore } from '@/polyfills/dom/types/WorkerActiveElementStore';

type FocusEventLike = {
  target?: unknown;
};

type EventTargetLike = {
  addEventListener: (
    type: string,
    listener: (event: FocusEventLike) => void,
    options?: boolean,
  ) => void;
};

type InstallForwardedFocusEventTrackingPolyfillInput = {
  documentTarget: EventTargetLike;
  activeElementStore: WorkerActiveElementStore;
};

const FOCUS_GAINED_EVENT_TYPES = ['focus', 'focusin'];

const FOCUS_LOST_EVENT_TYPES = ['blur', 'focusout'];

export const installForwardedFocusEventTrackingPolyfill = ({
  documentTarget,
  activeElementStore,
}: InstallForwardedFocusEventTrackingPolyfillInput): void => {
  for (const eventType of FOCUS_GAINED_EVENT_TYPES) {
    documentTarget.addEventListener(
      eventType,
      (event) => {
        if (isObject(event.target)) {
          activeElementStore.setActiveElement(event.target);
        }
      },
      true,
    );
  }

  for (const eventType of FOCUS_LOST_EVENT_TYPES) {
    documentTarget.addEventListener(
      eventType,
      (event) => {
        if (activeElementStore.getActiveElement() === event.target) {
          activeElementStore.setActiveElement(null);
        }
      },
      true,
    );
  }
};
