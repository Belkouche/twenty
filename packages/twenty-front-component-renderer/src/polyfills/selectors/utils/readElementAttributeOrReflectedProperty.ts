import { isFunction, isNumber, isString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';

export const readElementAttributeOrReflectedProperty = (
  element: SelectorElementLike,
  attributeName: string,
): string | null => {
  const attributeValue = isFunction(element.getAttribute)
    ? element.getAttribute(attributeName)
    : null;

  if (isDefined(attributeValue)) {
    return attributeValue;
  }

  const propertyValue = element[attributeName];

  if (isString(propertyValue)) {
    return propertyValue;
  }

  if (isNumber(propertyValue)) {
    return String(propertyValue);
  }

  return propertyValue === true ? '' : null;
};
