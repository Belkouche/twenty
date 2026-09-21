import { Window } from '@remote-dom/polyfill';

import { installSelectorMethods } from '../installSelectorMethods';

type SelectorFixture = {
  document: Document;
  setActiveElement: (element: object | null) => void;
};

const createSelectorFixture = (): SelectorFixture => {
  const polyfillWindow = new Window();
  let activeElement: object | null = null;

  installSelectorMethods({
    elementPrototype: polyfillWindow.Element.prototype,
    queryTargets: [polyfillWindow.Element.prototype, polyfillWindow.document],
    resolveActiveElement: () => activeElement,
  });

  return {
    document: polyfillWindow.document as unknown as Document,
    setActiveElement: (element) => {
      activeElement = element;
    },
  };
};

const createTree = (document: Document) => {
  const list = document.createElement('div');
  list.setAttribute('role', 'tablist');
  const firstTab = document.createElement('button');
  firstTab.setAttribute('role', 'tab');
  firstTab.setAttribute('class', 'tab active');
  firstTab.setAttribute('id', 'overview');
  const secondTab = document.createElement('button');
  secondTab.setAttribute('role', 'tab');
  secondTab.setAttribute('class', 'tab');
  secondTab.setAttribute('disabled', '');
  const label = document.createElement('span');
  label.setAttribute('data-tooltip-trigger', 'true');
  secondTab.append(label);
  list.append(firstTab, secondTab);
  document.body.append(list);

  return { list, firstTab, secondTab, label };
};

describe('installSelectorMethods', () => {
  describe('matches', () => {
    it('should match type, id, class and attribute selectors', () => {
      const { document } = createSelectorFixture();
      const { firstTab } = createTree(document);

      expect(firstTab.matches('button')).toBe(true);
      expect(firstTab.matches('#overview')).toBe(true);
      expect(firstTab.matches('.active')).toBe(true);
      expect(firstTab.matches('.tab.active')).toBe(true);
      expect(firstTab.matches('[role="tab"]')).toBe(true);
      expect(firstTab.matches('[class~=active]')).toBe(true);
      expect(firstTab.matches('[id^=over][id$=view][id*=erv]')).toBe(true);
      expect(firstTab.matches('[role="TAB" i]')).toBe(true);
      expect(firstTab.matches('[role="TAB"]')).toBe(false);
      expect(firstTab.matches('span')).toBe(false);
      expect(firstTab.matches('.inactive')).toBe(false);
    });

    it('should match a type selector against the sandbox custom element tag', () => {
      const { document } = createSelectorFixture();
      const button = document.createElement('html-button') as Element;
      const textarea = document.createElement('html-textarea') as Element;

      expect(button.matches('button')).toBe(true);
      expect(button.matches('button,a[href],[role="button"]')).toBe(true);
      expect(textarea.matches('input,textarea,[contenteditable]')).toBe(true);
      expect(button.matches('textarea')).toBe(false);
    });

    it('should match combinators against ancestors and siblings', () => {
      const { document } = createSelectorFixture();
      const { firstTab, secondTab, label } = createTree(document);

      expect(secondTab.matches('[role="tablist"] > [role="tab"]')).toBe(true);
      expect(label.matches('[role="tablist"] span')).toBe(true);
      expect(label.matches('[role="tablist"] > span')).toBe(false);
      expect(secondTab.matches('#overview + button')).toBe(true);
      expect(secondTab.matches('#overview ~ button')).toBe(true);
      expect(firstTab.matches('button + button')).toBe(false);
    });

    it('should evaluate the disabled, enabled and checked pseudo-classes from attributes and properties', () => {
      const { document } = createSelectorFixture();
      const { firstTab, secondTab } = createTree(document);
      const checkbox = document.createElement('input') as HTMLInputElement;
      checkbox.checked = true;

      expect(secondTab.matches(':disabled')).toBe(true);
      expect(firstTab.matches(':disabled')).toBe(false);
      expect(firstTab.matches(':enabled')).toBe(true);
      expect(checkbox.matches(':checked')).toBe(true);
      expect(firstTab.matches(':checked')).toBe(false);
    });

    it('should evaluate the focus pseudo-classes from the active element', () => {
      const { document, setActiveElement } = createSelectorFixture();
      const { list, firstTab, secondTab } = createTree(document);

      setActiveElement(firstTab);

      expect(firstTab.matches(':focus')).toBe(true);
      expect(firstTab.matches(':focus-visible')).toBe(true);
      expect(list.matches(':focus-within')).toBe(true);
      expect(secondTab.matches(':focus')).toBe(false);
      expect(secondTab.matches(':focus-within')).toBe(false);
    });

    it('should evaluate structural pseudo-classes', () => {
      const { document } = createSelectorFixture();
      const { list, firstTab, secondTab, label } = createTree(document);

      expect(firstTab.matches(':first-child')).toBe(true);
      expect(secondTab.matches(':last-child')).toBe(true);
      expect(label.matches(':only-child')).toBe(true);
      expect(firstTab.matches(':first-of-type')).toBe(true);
      expect(secondTab.matches(':first-of-type')).toBe(false);
      expect(secondTab.matches(':last-of-type')).toBe(true);
      expect(label.matches(':only-of-type')).toBe(true);
      expect(label.matches(':empty')).toBe(true);
      expect(list.matches(':empty')).toBe(false);
      expect(document.documentElement.matches(':root')).toBe(true);
      expect(list.matches(':root')).toBe(false);
    });

    it('should evaluate not, is, where and has', () => {
      const { document } = createSelectorFixture();
      const { list, firstTab, secondTab } = createTree(document);

      expect(firstTab.matches(':not(:disabled)')).toBe(true);
      expect(secondTab.matches(':not(:disabled)')).toBe(false);
      expect(firstTab.matches(':is(span, button)')).toBe(true);
      expect(firstTab.matches(':where(span, .tab)')).toBe(true);
      expect(list.matches(':has(span)')).toBe(true);
      expect(list.matches(':has(input)')).toBe(false);
    });

    it('should treat interaction pseudo-classes that the sandbox cannot observe as unmatched', () => {
      const { document } = createSelectorFixture();
      const { firstTab } = createTree(document);

      expect(firstTab.matches(':hover')).toBe(false);
      expect(firstTab.matches(':active')).toBe(false);
    });

    it('should throw a SyntaxError DOMException for an invalid selector', () => {
      const { document } = createSelectorFixture();
      const { firstTab } = createTree(document);

      expect(() => firstTab.matches(':nth-child(2)')).toThrow(
        expect.objectContaining({ name: 'SyntaxError' }),
      );
    });
  });

  describe('closest', () => {
    it('should return the element itself when it matches', () => {
      const { document } = createSelectorFixture();
      const { firstTab } = createTree(document);

      expect(firstTab.closest('[role="tab"]')).toBe(firstTab);
    });

    it('should walk up to the nearest matching ancestor', () => {
      const { document } = createSelectorFixture();
      const { list, label } = createTree(document);

      expect(label.closest('[role="tablist"]')).toBe(list);
    });

    it('should return null when no ancestor matches', () => {
      const { document } = createSelectorFixture();
      const { label } = createTree(document);

      expect(label.closest('[hidden], [inert]')).toBeNull();
    });
  });

  describe('querySelector and querySelectorAll', () => {
    it('should query descendants in document order from an element', () => {
      const { document } = createSelectorFixture();
      const { list, firstTab, secondTab } = createTree(document);

      const tabs = list.querySelectorAll('[role="tab"]');

      expect(Array.from(tabs)).toEqual([firstTab, secondTab]);
      expect(tabs.item(0)).toBe(firstTab);
      expect(list.querySelector(':disabled')).toBe(secondTab);
      expect(list.querySelector('input')).toBeNull();
    });

    it('should query from the document', () => {
      const { document } = createSelectorFixture();
      const { list, label } = createTree(document);

      expect(document.querySelector('[role="tablist"]')).toBe(list);
      expect(document.querySelectorAll('span')).toHaveLength(1);
      expect(document.querySelector('span')).toBe(label);
    });

    it('should not match the scope element itself', () => {
      const { document } = createSelectorFixture();
      const { list } = createTree(document);

      expect(list.querySelectorAll('[role="tablist"]')).toHaveLength(0);
    });

    it('should resolve :scope to the query root', () => {
      const { document } = createSelectorFixture();
      const { list, firstTab, secondTab } = createTree(document);

      expect(Array.from(list.querySelectorAll(':scope > button'))).toEqual([
        firstTab,
        secondTab,
      ]);
    });

    it('should support the tabbable candidate selector', () => {
      const { document } = createSelectorFixture();
      const details = document.createElement('details');
      const summary = document.createElement('summary');
      const input = document.createElement('html-input');
      details.append(summary);
      document.body.append(details, input);

      const candidates = document.querySelectorAll(
        'input,select,textarea,a[href],button,[tabindex],audio[controls],video[controls],[contenteditable]:not([contenteditable="false"]),details>summary:first-of-type,details',
      );

      expect(Array.from(candidates)).toEqual([details, summary, input]);
    });
  });
});
