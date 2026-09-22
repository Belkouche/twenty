import { isDefined } from 'twenty-shared/utils';

import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { readElementAttributeOrReflectedProperty } from '@/polyfills/selectors/utils/readElementAttributeOrReflectedProperty';
import { resolveParentElement } from '@/polyfills/selectors/utils/resolveParentElement';

export const isElementContentEditable = (
  element: SelectorElementLike,
): boolean => {
  let currentElement: SelectorElementLike | null = element;

  while (isDefined(currentElement)) {
    const contentEditableValue = readElementAttributeOrReflectedProperty(
      currentElement,
      'contenteditable',
    )?.toLowerCase();

    if (isDefined(contentEditableValue) && contentEditableValue !== 'inherit') {
      return contentEditableValue !== 'false';
    }

    currentElement = resolveParentElement(currentElement);
  }

  return false;
};
