import { isBoolean, isObject } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { iterateElementSubtree } from '@/polyfills/dom/utils/iterateElementSubtree';
import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { type SelectorList } from '@/polyfills/selectors/types/SelectorList';
import { type SelectorMatchContext } from '@/polyfills/selectors/types/SelectorMatchContext';
import { isSelectorElementNode } from '@/polyfills/selectors/utils/isSelectorElementNode';
import { matchesSelectorList } from '@/polyfills/selectors/utils/matchesSelectorList';
import { readElementAttribute } from '@/polyfills/selectors/utils/readElementAttribute';
import { resolveElementSiblings } from '@/polyfills/selectors/utils/resolveElementSiblings';

const DOCUMENT_NODE_TYPE = 9;

type PseudoClassSelectorOptions = {
  name: string;
  selectorListArgument: SelectorList | null;
};

const isDisabled = (element: SelectorElementLike): boolean =>
  element.disabled === true ||
  readElementAttribute(element, 'disabled') !== null;

const isChecked = (element: SelectorElementLike): boolean =>
  isBoolean(element.checked)
    ? element.checked
    : readElementAttribute(element, 'checked') !== null;

const isFocused = (
  element: SelectorElementLike,
  context: SelectorMatchContext,
): boolean => context.resolveActiveElement() === element;

const containsFocus = (
  element: SelectorElementLike,
  context: SelectorMatchContext,
): boolean => {
  let currentNode: unknown = context.resolveActiveElement();

  while (isObject(currentNode)) {
    if (currentNode === element) {
      return true;
    }

    currentNode = (currentNode as SelectorElementLike).parentNode;
  }

  return false;
};

const hasMatchingDescendant = (
  element: SelectorElementLike,
  selectorList: SelectorList,
  context: SelectorMatchContext,
): boolean => {
  for (const descendant of iterateElementSubtree(element)) {
    if (
      descendant !== element &&
      isSelectorElementNode(descendant) &&
      matchesSelectorList(descendant, selectorList, {
        ...context,
        scopeElement: element,
      })
    ) {
      return true;
    }
  }

  return false;
};

const hasSameType = (
  element: SelectorElementLike,
  sibling: SelectorElementLike,
): boolean => sibling.localName === element.localName;

export const matchesPseudoClassSelector = (
  element: SelectorElementLike,
  { name, selectorListArgument }: PseudoClassSelectorOptions,
  context: SelectorMatchContext,
): boolean => {
  switch (name) {
    case 'not':
      return (
        isDefined(selectorListArgument) &&
        !matchesSelectorList(element, selectorListArgument, context)
      );
    case 'is':
    case 'where':
      return (
        isDefined(selectorListArgument) &&
        matchesSelectorList(element, selectorListArgument, context)
      );
    case 'has':
      return (
        isDefined(selectorListArgument) &&
        hasMatchingDescendant(element, selectorListArgument, context)
      );
    case 'disabled':
      return isDisabled(element);
    case 'enabled':
      return !isDisabled(element);
    case 'checked':
      return isChecked(element);
    case 'focus':
    case 'focus-visible':
      return isFocused(element, context);
    case 'focus-within':
      return containsFocus(element, context);
    case 'empty':
      return (element.childNodes?.length ?? 0) === 0;
    case 'root':
      return (
        isObject(element.parentNode) &&
        (element.parentNode as SelectorElementLike).nodeType ===
          DOCUMENT_NODE_TYPE
      );
    case 'scope':
      return element === context.scopeElement;
    case 'first-child':
      return resolveElementSiblings(element).previousSiblings.length === 0;
    case 'last-child':
      return resolveElementSiblings(element).nextSiblings.length === 0;
    case 'only-child': {
      const { previousSiblings, nextSiblings } =
        resolveElementSiblings(element);

      return previousSiblings.length === 0 && nextSiblings.length === 0;
    }
    case 'first-of-type':
      return !resolveElementSiblings(element).previousSiblings.some((sibling) =>
        hasSameType(element, sibling),
      );
    case 'last-of-type':
      return !resolveElementSiblings(element).nextSiblings.some((sibling) =>
        hasSameType(element, sibling),
      );
    case 'only-of-type': {
      const { previousSiblings, nextSiblings } =
        resolveElementSiblings(element);

      return ![...previousSiblings, ...nextSiblings].some((sibling) =>
        hasSameType(element, sibling),
      );
    }
    default:
      return false;
  }
};
