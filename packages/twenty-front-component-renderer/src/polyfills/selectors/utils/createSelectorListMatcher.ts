import { isBoolean } from '@sniptt/guards';
import { compile } from 'css-select';
import { parse } from 'css-what';
import { isNonEmptyArray } from 'twenty-shared/utils';

import { isAncestorOrSelfOfNode } from '@/polyfills/dom/utils/isAncestorOrSelfOfNode';
import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { createSelectorSyntaxError } from '@/polyfills/selectors/utils/createSelectorSyntaxError';
import { canElementBeDisabled } from '@/polyfills/selectors/utils/canElementBeDisabled';
import { isSelectorElementNode } from '@/polyfills/selectors/utils/isSelectorElementNode';
import { isElementDisabled } from '@/polyfills/selectors/utils/isElementDisabled';
import { normalizeRemoteTagNameToHtmlTagName } from '@/polyfills/selectors/utils/normalizeRemoteTagNameToHtmlTagName';
import { normalizeParsedSelectorListForWorker } from '@/polyfills/selectors/utils/normalizeParsedSelectorListForWorker';
import { readElementAttributeOrReflectedProperty } from '@/polyfills/selectors/utils/readElementAttributeOrReflectedProperty';
import { workerDomCssSelectAdapter } from '@/polyfills/selectors/utils/workerDomCssSelectAdapter';

const DOCUMENT_NODE_TYPE = 9;

const isElementCheckedOrSelected = (element: SelectorElementLike): boolean => {
  const isOptionElement =
    normalizeRemoteTagNameToHtmlTagName(element.localName ?? '') === 'option';
  const checkednessPropertyName = isOptionElement ? 'selected' : 'checked';
  const property = element[checkednessPropertyName];

  return isBoolean(property)
    ? property
    : readElementAttributeOrReflectedProperty(
        element,
        checkednessPropertyName,
      ) !== null;
};

export const createSelectorListMatcher = ({
  selectorsText,
  scopeElement,
  resolveActiveElement,
}: {
  selectorsText: string;
  scopeElement: SelectorElementLike;
  resolveActiveElement: () => object | null;
}): ((element: SelectorElementLike) => boolean) => {
  try {
    const selectorList = parse(selectorsText);

    if (!isNonEmptyArray(selectorList)) {
      throw createSelectorSyntaxError(selectorsText);
    }

    return compile(normalizeParsedSelectorListForWorker(selectorList), {
      adapter: workerDomCssSelectAdapter,
      context:
        scopeElement.nodeType === DOCUMENT_NODE_TYPE
          ? workerDomCssSelectAdapter
              .getChildren(scopeElement)
              .filter(isSelectorElementNode)
          : scopeElement,
      relativeSelector: false,
      cacheResults: false,
      pseudos: {
        'twenty-disabled': isElementDisabled,
        'twenty-enabled': (element) =>
          canElementBeDisabled(element) && !isElementDisabled(element),
        'twenty-checked': isElementCheckedOrSelected,
        focus: (element) => resolveActiveElement() === element,
        'focus-visible': (element) => resolveActiveElement() === element,
        'focus-within': (element) =>
          isAncestorOrSelfOfNode(element, resolveActiveElement()),
        target: () => false,
      },
    });
  } catch {
    throw createSelectorSyntaxError(selectorsText);
  }
};
