import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { isElementContentEditable } from '@/polyfills/selectors/utils/isElementContentEditable';
import { isElementDisabled } from '@/polyfills/selectors/utils/isElementDisabled';
import { readElementAttributeOrReflectedProperty } from '@/polyfills/selectors/utils/readElementAttributeOrReflectedProperty';
import { resolveHtmlTagNameOfElement } from '@/polyfills/selectors/utils/resolveHtmlTagNameOfElement';

const ALWAYS_FOCUSABLE_TAG_NAMES = new Set([
  'button',
  'iframe',
  'select',
  'summary',
  'textarea',
]);

const TAG_NAMES_FOCUSABLE_WITH_HREF = new Set(['a', 'area']);

const TAG_NAMES_FOCUSABLE_WITH_CONTROLS = new Set(['audio', 'video']);

const hasAttributeOrReflectedProperty = (
  element: SelectorElementLike,
  attributeName: string,
): boolean =>
  readElementAttributeOrReflectedProperty(element, attributeName) !== null;

export const isElementFocusable = (element: SelectorElementLike): boolean => {
  if (isElementDisabled(element)) {
    return false;
  }

  const tagName = resolveHtmlTagNameOfElement(element);

  if (tagName === 'input') {
    return (
      readElementAttributeOrReflectedProperty(
        element,
        'type',
      )?.toLowerCase() !== 'hidden'
    );
  }

  if (ALWAYS_FOCUSABLE_TAG_NAMES.has(tagName)) {
    return true;
  }

  if (TAG_NAMES_FOCUSABLE_WITH_HREF.has(tagName)) {
    return hasAttributeOrReflectedProperty(element, 'href');
  }

  if (TAG_NAMES_FOCUSABLE_WITH_CONTROLS.has(tagName)) {
    return hasAttributeOrReflectedProperty(element, 'controls');
  }

  return (
    hasAttributeOrReflectedProperty(element, 'tabindex') ||
    isElementContentEditable(element)
  );
};
