import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { isElementContentEditable } from '@/polyfills/selectors/utils/isElementContentEditable';
import { isElementDisabled } from '@/polyfills/selectors/utils/isElementDisabled';
import { readElementAttributeOrReflectedProperty } from '@/polyfills/selectors/utils/readElementAttributeOrReflectedProperty';
import { resolveHtmlTagNameOfElement } from '@/polyfills/selectors/utils/resolveHtmlTagNameOfElement';

const NON_EDITABLE_INPUT_TYPES = new Set([
  'button',
  'checkbox',
  'color',
  'file',
  'hidden',
  'image',
  'radio',
  'range',
  'reset',
  'submit',
]);

const hasReadOnlyState = (element: SelectorElementLike): boolean =>
  element.readOnly === true ||
  readElementAttributeOrReflectedProperty(element, 'readonly') !== null;

const isEditableFormControl = (element: SelectorElementLike): boolean =>
  !hasReadOnlyState(element) && !isElementDisabled(element);

export const isElementReadWrite = (element: SelectorElementLike): boolean => {
  const tagName = resolveHtmlTagNameOfElement(element);

  if (tagName === 'textarea') {
    return isEditableFormControl(element);
  }

  if (tagName === 'input') {
    const inputType =
      readElementAttributeOrReflectedProperty(element, 'type')?.toLowerCase() ??
      'text';

    return (
      !NON_EDITABLE_INPUT_TYPES.has(inputType) && isEditableFormControl(element)
    );
  }

  return isElementContentEditable(element);
};
