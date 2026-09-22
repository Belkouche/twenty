import { isBoolean } from '@sniptt/guards';
import { compile } from 'css-select';
import { parse } from 'css-what';
import { isNonEmptyArray } from 'twenty-shared/utils';

import { isAncestorOrSelf } from '@/polyfills/dom/utils/isAncestorOrSelf';
import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { createSelectorSyntaxError } from '@/polyfills/selectors/utils/createSelectorSyntaxError';
import { isDisableableElement } from '@/polyfills/selectors/utils/isDisableableElement';
import { isSelectorElementNode } from '@/polyfills/selectors/utils/isSelectorElementNode';
import { isElementDisabled } from '@/polyfills/selectors/utils/isElementDisabled';
import { normalizeSelectorTagName } from '@/polyfills/selectors/utils/normalizeSelectorTagName';
import { normalizeWorkerSelectorList } from '@/polyfills/selectors/utils/normalizeWorkerSelectorList';
import { readElementAttribute } from '@/polyfills/selectors/utils/readElementAttribute';
import { workerSelectorAdapter } from '@/polyfills/selectors/utils/workerSelectorAdapter';

const DOCUMENT_NODE_TYPE = 9;

const isChecked = (element: SelectorElementLike): boolean => {
  const isOption =
    normalizeSelectorTagName(element.localName ?? '') === 'option';
  const propertyName = isOption ? 'selected' : 'checked';
  const property = element[propertyName];

  return isBoolean(property)
    ? property
    : readElementAttribute(element, propertyName) !== null;
};

export const createSelectorMatcher = ({
  selectors,
  scopeElement,
  resolveActiveElement,
}: {
  selectors: string;
  scopeElement: SelectorElementLike;
  resolveActiveElement: () => object | null;
}): ((element: SelectorElementLike) => boolean) => {
  try {
    const selectorList = parse(selectors);

    if (!isNonEmptyArray(selectorList)) {
      throw createSelectorSyntaxError(selectors);
    }

    return compile(normalizeWorkerSelectorList(selectorList), {
      adapter: workerSelectorAdapter,
      context:
        scopeElement.nodeType === DOCUMENT_NODE_TYPE
          ? workerSelectorAdapter
              .getChildren(scopeElement)
              .filter(isSelectorElementNode)
          : scopeElement,
      relativeSelector: false,
      cacheResults: false,
      pseudos: {
        'twenty-disabled': isElementDisabled,
        'twenty-enabled': (element) =>
          isDisableableElement(element) && !isElementDisabled(element),
        'twenty-checked': isChecked,
        focus: (element) => resolveActiveElement() === element,
        'focus-visible': (element) => resolveActiveElement() === element,
        'focus-within': (element) =>
          isAncestorOrSelf(element, resolveActiveElement()),
        target: () => false,
      },
    });
  } catch {
    throw createSelectorSyntaxError(selectors);
  }
};
