import { HOOKS, Window } from '@remote-dom/polyfill';

import { createWorkerActiveElementStore } from '../createWorkerActiveElementStore';
import { installDocumentActiveElementPolyfill } from '../installDocumentActiveElementPolyfill';
import { installFocusAndBlurMethodsPolyfill } from '../installFocusAndBlurMethodsPolyfill';

const createPolyfillDocument = (): Document => {
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

  return polyfillWindow.document as unknown as Document;
};

describe('installFocusAndBlurMethodsPolyfill', () => {
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

    document.body.append(button);

    expect(() => button.focus({ preventScroll: true })).not.toThrow();
    expect(document.activeElement).toBe(button);
  });

  it('should move the active element to the most recently focused element', () => {
    const document = createPolyfillDocument();
    const first = document.createElement('button');
    const second = document.createElement('button');

    document.body.append(first, second);
    first.focus();
    second.focus();

    expect(document.activeElement).toBe(second);
  });

  it('should fall back to the body after blurring the active element', () => {
    const document = createPolyfillDocument();
    const button = document.createElement('button');

    document.body.append(button);
    button.focus();
    button.blur();

    expect(document.activeElement).toBe(document.body);
  });

  it('should fall back to the body once the active element is removed from the document', () => {
    const document = createPolyfillDocument();
    const dialog = document.createElement('div');
    const closeButton = document.createElement('button');

    dialog.append(closeButton);
    document.body.append(dialog);
    closeButton.focus();
    dialog.remove();

    expect(document.activeElement).toBe(document.body);
  });

  it('should not report a detached element as active', () => {
    const document = createPolyfillDocument();
    const button = document.createElement('button');

    button.focus();

    expect(document.activeElement).toBe(document.body);
  });

  it('should clear focus synchronously when a subtree is removed and reinserted', () => {
    const document = createPolyfillDocument();
    const dialog = document.createElement('div');
    const button = document.createElement('button');
    dialog.append(button);
    document.body.append(dialog);
    button.focus();
    dialog.remove();
    document.body.append(dialog);

    expect(document.activeElement).toBe(document.body);
  });

  it('should keep a detached element blurred when it is reinserted', () => {
    const document = createPolyfillDocument();
    const button = document.createElement('button');
    document.body.append(button);
    button.focus();
    button.remove();
    expect(document.activeElement).toBe(document.body);
    button.blur();
    document.body.append(button);

    expect(document.activeElement).toBe(document.body);
  });

  it('should ignore a focus call on a detached element even if it is inserted later', () => {
    const document = createPolyfillDocument();
    const active = document.createElement('button');
    const detached = document.createElement('button');
    document.body.append(active);
    active.focus();
    detached.focus();
    document.body.append(detached);

    expect(document.activeElement).toBe(active);
  });

  it('should ignore focus on a disabled control', () => {
    const document = createPolyfillDocument();
    const button = document.createElement('button');

    button.setAttribute('disabled', '');
    document.body.append(button);
    button.focus();

    expect(document.activeElement).toBe(document.body);
  });

  it('should ignore focus on elements that are not focusable', () => {
    const document = createPolyfillDocument();
    const plainDiv = document.createElement('div');
    const anchorWithoutHref = document.createElement('a');
    const hiddenInput = document.createElement('input');

    hiddenInput.setAttribute('type', 'hidden');
    document.body.append(plainDiv, anchorWithoutHref, hiddenInput);
    plainDiv.focus();
    anchorWithoutHref.focus();
    hiddenInput.focus();

    expect(document.activeElement).toBe(document.body);
  });

  it('should focus elements made focusable by tabindex, href or contenteditable', () => {
    const document = createPolyfillDocument();
    const container = document.createElement('div');
    const link = document.createElement('a');
    const editor = document.createElement('div');

    container.setAttribute('tabindex', '-1');
    link.setAttribute('href', '/records');
    editor.setAttribute('contenteditable', '');
    document.body.append(container, link, editor);

    container.focus();
    expect(document.activeElement).toBe(container);
    link.focus();
    expect(document.activeElement).toBe(link);
    editor.focus();
    expect(document.activeElement).toBe(editor);
  });

  it('should ignore focus called on an object that is not a node', () => {
    const document = createPolyfillDocument();
    const focus = document.body.focus as (this: object) => void;

    focus.call({});

    expect(document.activeElement).toBe(document.body);
  });

  it('should ignore blur on an element that is not active', () => {
    const document = createPolyfillDocument();
    const active = document.createElement('button');
    const other = document.createElement('button');

    document.body.append(active, other);
    active.focus();
    other.blur();

    expect(document.activeElement).toBe(active);
  });
});
