import { Window } from '@remote-dom/polyfill';

import { createWorkerActiveElementStore } from '../createWorkerActiveElementStore';
import { installDocumentActiveElement } from '../installDocumentActiveElement';
import { installFocusMethods } from '../installFocusMethods';

const createPolyfillDocument = (): Document => {
  const polyfillWindow = new Window();
  const activeElementStore = createWorkerActiveElementStore();

  installFocusMethods({
    elementPrototype: polyfillWindow.Element.prototype,
    activeElementStore,
  });
  installDocumentActiveElement({
    documentTarget: polyfillWindow.document,
    activeElementStore,
  });

  return polyfillWindow.document as unknown as Document;
};

describe('installFocusMethods', () => {
  it('should report the body as active before any focus call', () => {
    const document = createPolyfillDocument();

    expect(document.activeElement).toBe(document.body);
  });

  it('should make a focused element the active element', () => {
    const document = createPolyfillDocument();
    const button = document.createElement('button');

    document.body.append(button);
    button.focus();

    expect(document.activeElement).toBe(button);
  });

  it('should accept focus options', () => {
    const document = createPolyfillDocument();
    const button = document.createElement('button');

    expect(() => button.focus({ preventScroll: true })).not.toThrow();
    expect(document.activeElement).toBe(button);
  });

  it('should move the active element to the most recently focused element', () => {
    const document = createPolyfillDocument();
    const first = document.createElement('button');
    const second = document.createElement('button');

    first.focus();
    second.focus();

    expect(document.activeElement).toBe(second);
  });

  it('should fall back to the body after blurring the active element', () => {
    const document = createPolyfillDocument();
    const button = document.createElement('button');

    button.focus();
    button.blur();

    expect(document.activeElement).toBe(document.body);
  });

  it('should ignore blur on an element that is not active', () => {
    const document = createPolyfillDocument();
    const active = document.createElement('button');
    const other = document.createElement('button');

    active.focus();
    other.blur();

    expect(document.activeElement).toBe(active);
  });
});
