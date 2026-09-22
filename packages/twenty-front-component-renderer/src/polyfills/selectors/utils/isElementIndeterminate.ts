import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { readElementAttributeOrReflectedProperty } from '@/polyfills/selectors/utils/readElementAttributeOrReflectedProperty';
import { resolveHtmlTagNameOfElement } from '@/polyfills/selectors/utils/resolveHtmlTagNameOfElement';

export const isElementIndeterminate = (
  element: SelectorElementLike,
): boolean => {
  if (element.indeterminate === true) {
    return true;
  }

  return (
    resolveHtmlTagNameOfElement(element) === 'progress' &&
    readElementAttributeOrReflectedProperty(element, 'value') === null
  );
};
