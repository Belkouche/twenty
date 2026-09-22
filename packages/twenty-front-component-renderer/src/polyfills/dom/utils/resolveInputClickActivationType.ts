import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { isElementDisabled } from '@/polyfills/selectors/utils/isElementDisabled';
import { readElementAttributeOrReflectedProperty } from '@/polyfills/selectors/utils/readElementAttributeOrReflectedProperty';

export const resolveInputClickActivationType = (
  inputElement: SelectorElementLike,
): 'checkbox' | 'radio' | null => {
  if (isElementDisabled(inputElement)) {
    return null;
  }

  const inputType = readElementAttributeOrReflectedProperty(
    inputElement,
    'type',
  );

  return inputType === 'checkbox' || inputType === 'radio' ? inputType : null;
};
