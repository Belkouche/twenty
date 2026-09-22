import { HOOKS, Window } from '@remote-dom/polyfill';

import { createWorkerActiveElementStore } from '../createWorkerActiveElementStore';
import { installDocumentActiveElementPolyfill } from '../installDocumentActiveElementPolyfill';
import { installFocusAndBlurMethodsPolyfill } from '../installFocusAndBlurMethodsPolyfill';
import { installForwardedFocusEventTrackingPolyfill } from '../installForwardedFocusEventTrackingPolyfill';

type ForwardedFocusFixture = {
  document: Document;
  dispatchForwardedEvent: (target: Element, eventType: string) => void;
};

const createForwardedFocusFixture = (): ForwardedFocusFixture => {
  const polyfillWindow = new Window();
  const activeElementStore = createWorkerActiveElementStore({
    hooks: polyfillWindow[HOOKS],
  });

  installFocusAndBlurMethodsPolyfill({
    elementPrototype: polyfillWindow.Element.prototype,
    activeElementStore,
  });
  installDocumentActiveElementPolyfill({
    documentTarget: polyfillWindow.document,
    activeElementStore,
  });
  installForwardedFocusEventTrackingPolyfill({
    documentTarget: polyfillWindow.document,
    activeElementStore,
  });

  return {
    document: polyfillWindow.document as unknown as Document,
    dispatchForwardedEvent: (target, eventType) => {
      target.dispatchEvent(
        new polyfillWindow.CustomEvent(eventType) as unknown as Event,
      );
    },
  };
};

describe('installForwardedFocusEventTrackingPolyfill', () => {
  it('should make the target of a forwarded focus event the active element', () => {
    const { document, dispatchForwardedEvent } = createForwardedFocusFixture();
    const button = document.createElement('button');

    document.body.append(button);
    dispatchForwardedEvent(button, 'focus');

    expect(document.activeElement).toBe(button);
  });

  it('should follow focusin and focusout events', () => {
    const { document, dispatchForwardedEvent } = createForwardedFocusFixture();
    const first = document.createElement('button');
    const second = document.createElement('button');

    document.body.append(first, second);
    dispatchForwardedEvent(first, 'focusin');
    expect(document.activeElement).toBe(first);
    dispatchForwardedEvent(second, 'focusin');
    expect(document.activeElement).toBe(second);
    dispatchForwardedEvent(second, 'focusout');

    expect(document.activeElement).toBe(document.body);
  });

  it('should fall back to the body after a forwarded blur of the active element', () => {
    const { document, dispatchForwardedEvent } = createForwardedFocusFixture();
    const button = document.createElement('button');

    document.body.append(button);
    dispatchForwardedEvent(button, 'focus');
    dispatchForwardedEvent(button, 'blur');

    expect(document.activeElement).toBe(document.body);
  });

  it('should ignore blur events for elements that are not active', () => {
    const { document, dispatchForwardedEvent } = createForwardedFocusFixture();
    const active = document.createElement('button');
    const other = document.createElement('button');

    document.body.append(active, other);
    dispatchForwardedEvent(active, 'focus');
    dispatchForwardedEvent(other, 'blur');

    expect(document.activeElement).toBe(active);
  });

  it('should let a forwarded focus event replace a local focus call', () => {
    const { document, dispatchForwardedEvent } = createForwardedFocusFixture();
    const locallyFocused = document.createElement('button');
    const pageFocused = document.createElement('div');

    document.body.append(locallyFocused, pageFocused);
    locallyFocused.focus();
    dispatchForwardedEvent(pageFocused, 'focus');

    expect(document.activeElement).toBe(pageFocused);
  });

  it('should ignore focus events on detached elements', () => {
    const { document, dispatchForwardedEvent } = createForwardedFocusFixture();
    const detached = document.createElement('button');

    dispatchForwardedEvent(detached, 'focus');

    expect(document.activeElement).toBe(document.body);
  });
});
