import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { readBooleanControlState } from '@/polyfills/selectors/utils/readBooleanControlState';
import { readElementAttributeOrReflectedProperty } from '@/polyfills/selectors/utils/readElementAttributeOrReflectedProperty';
import { resolveHtmlTagNameOfElement } from '@/polyfills/selectors/utils/resolveHtmlTagNameOfElement';

const CHECKABLE_INPUT_TYPES = new Set(['checkbox', 'radio']);

export const isElementChecked = (element: SelectorElementLike): boolean => {
  const tagName = resolveHtmlTagNameOfElement(element);

  if (tagName === 'option') {
    return readBooleanControlState({ element, propertyName: 'selected' });
  }

  if (tagName !== 'input') {
    return false;
  }

  const inputType =
    readElementAttributeOrReflectedProperty(element, 'type')?.toLowerCase() ??
    'text';

  return (
    CHECKABLE_INPUT_TYPES.has(inputType) &&
    readBooleanControlState({ element, propertyName: 'checked' })
  );
};
