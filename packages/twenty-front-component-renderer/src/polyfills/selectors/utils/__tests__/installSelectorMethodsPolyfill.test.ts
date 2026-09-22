import { Window } from '@remote-dom/polyfill';

import { installSelectorMethodsPolyfill } from '../installSelectorMethodsPolyfill';

type SelectorFixture = {
  document: Document;
  setActiveElement: (element: object | null) => void;
};

const createSelectorFixture = (): SelectorFixture => {
  const polyfillWindow = new Window();
  let activeElement: object | null = null;

  installSelectorMethodsPolyfill({
    elementPrototype: polyfillWindow.Element.prototype,
    querySelectorTargets: [
      polyfillWindow.Element.prototype,
      polyfillWindow.document,
    ],
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

describe('installSelectorMethodsPolyfill', () => {
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
      expect(button.matches('html-button')).toBe(true);
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
      const uncheckedWithDefault = document.createElement(
        'input',
      ) as HTMLInputElement;
      uncheckedWithDefault.setAttribute('checked', '');
      uncheckedWithDefault.checked = false;
      const defaultChecked = document.createElement('input');
      defaultChecked.setAttribute('checked', '');

      expect(secondTab.matches(':disabled')).toBe(true);
      expect(firstTab.matches(':disabled')).toBe(false);
      expect(firstTab.matches(':enabled')).toBe(true);
      expect(checkbox.matches(':checked')).toBe(true);
      expect(uncheckedWithDefault.matches(':checked')).toBe(false);
      expect(defaultChecked.matches(':checked')).toBe(true);
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
      setActiveElement(secondTab);
      expect(firstTab.matches(':focus')).toBe(false);
      expect(secondTab.matches(':focus')).toBe(true);
    });

    it('should inherit fieldset disability except inside the first legend', () => {
      const { document } = createSelectorFixture();
      const outerFieldset = document.createElement('html-fieldset') as Element;
      const firstLegend = document.createElement('html-legend') as Element;
      const firstLegendInput = document.createElement('html-input') as Element;
      const secondLegend = document.createElement('html-legend') as Element;
      const secondLegendInput = document.createElement('html-input') as Element;
      const nestedFieldset = document.createElement('html-fieldset') as Element;
      const nestedLegend = document.createElement('html-legend') as Element;
      const nestedInput = document.createElement('html-input') as Element;

      outerFieldset.setAttribute('disabled', '');
      nestedFieldset.setAttribute('disabled', '');
      firstLegend.append(firstLegendInput);
      secondLegend.append(secondLegendInput);
      nestedLegend.append(nestedInput);
      nestedFieldset.append(nestedLegend);
      outerFieldset.append(firstLegend, secondLegend, nestedFieldset);

      expect(firstLegendInput.matches(':disabled')).toBe(false);
      expect(firstLegendInput.matches(':enabled')).toBe(true);
      expect(secondLegendInput.matches(':disabled')).toBe(true);
      expect(nestedInput.matches(':disabled')).toBe(true);
      expect(firstLegend.matches(':enabled')).toBe(false);

      outerFieldset.removeAttribute('disabled');
      expect(secondLegendInput.matches(':disabled')).toBe(false);
      expect(nestedInput.matches(':disabled')).toBe(false);
    });

    it('should respect disabled optgroups and selected option properties', () => {
      const { document } = createSelectorFixture();
      const group = document.createElement('html-optgroup') as Element;
      const option = document.createElement('html-option') as HTMLOptionElement;
      group.setAttribute('disabled', '');
      group.append(option);
      option.selected = true;

      expect(option.matches(':disabled')).toBe(true);
      expect(option.matches(':checked')).toBe(true);
      option.selected = false;
      expect(option.matches(':checked')).toBe(false);
    });

    it('should inherit disability for nested fieldsets but not options or optgroups', () => {
      const { document } = createSelectorFixture();
      const fieldset = document.createElement('html-fieldset') as Element;
      const nestedFieldset = document.createElement('html-fieldset') as Element;
      const select = document.createElement('html-select') as Element;
      const group = document.createElement('html-optgroup') as Element;
      const option = document.createElement('html-option') as Element;

      fieldset.setAttribute('disabled', '');
      group.append(option);
      select.append(group);
      fieldset.append(nestedFieldset, select);

      expect(nestedFieldset.matches(':disabled')).toBe(true);
      expect(select.matches(':disabled')).toBe(true);
      expect(group.matches(':enabled')).toBe(true);
      expect(option.matches(':enabled')).toBe(true);

      select.setAttribute('disabled', '');
      expect(group.matches(':disabled')).toBe(false);
      expect(option.matches(':disabled')).toBe(false);
    });

    it('should anchor relative has selectors to the candidate', () => {
      const { document } = createSelectorFixture();
      const outer = document.createElement('div');
      const candidate = document.createElement('section');
      const sibling = document.createElement('p');
      const descendant = document.createElement('span');
      outer.setAttribute('class', 'outer');
      candidate.append(descendant);
      outer.append(candidate, sibling);

      expect(candidate.matches(':has(> span)')).toBe(true);
      expect(candidate.matches(':has(+ p)')).toBe(true);
      expect(candidate.matches(':has(~ p)')).toBe(true);
      expect(candidate.matches(':has(.outer span)')).toBe(false);
      expect(candidate.matches(':has(section span)')).toBe(false);
      descendant.remove();
      expect(candidate.matches(':has(> span)')).toBe(false);
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

      expect(() => firstTab.matches(':unknown-pseudo')).toThrow(
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
    it('should decode CSS escapes in identifiers and attribute strings', () => {
      const { document } = createSelectorFixture();
      const target = document.createElement('html-button') as Element;
      target.setAttribute('id', '123');
      target.setAttribute('class', 'sm:flex');
      target.setAttribute('data-label', 'ABC');
      document.body.append(target);

      expect(document.querySelector(String.raw`#\31 23`)).toBe(target);
      expect(document.querySelector(String.raw`.sm\:flex`)).toBe(target);
      expect(document.querySelector(String.raw`[data-label="\41 BC"]`)).toBe(
        target,
      );
    });

    it.each([
      '',
      ' ',
      'div,',
      '> div',
      'div >',
      '[',
      ':unknown-pseudo',
      ':not(',
      ':disabled(x)',
    ])(
      'should reject invalid selector %p through the DOM interface',
      (selector) => {
        const { document } = createSelectorFixture();

        expect(() => document.querySelector(selector)).toThrow(
          expect.objectContaining({ name: 'SyntaxError' }),
        );
      },
    );

    it('should resolve document scope and support structural selector arguments', () => {
      const { document } = createSelectorFixture();
      const { list, secondTab } = createTree(document);

      expect(document.querySelector(':scope')).toBe(document.documentElement);
      expect(list.querySelector('button:nth-child(2)')).toBe(secondTab);
      expect(list.querySelector('body button:nth-child(2)')).toBe(secondTab);
    });

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
      const input = document.createElement('html-input') as Element;
      details.append(summary);
      document.body.append(details, input);

      const candidates = document.querySelectorAll(
        'input,select,textarea,a[href],button,[tabindex],audio[controls],video[controls],[contenteditable]:not([contenteditable="false"]),details>summary:first-of-type,details',
      );

      expect(Array.from(candidates)).toEqual([details, summary, input]);
    });
  });
});
