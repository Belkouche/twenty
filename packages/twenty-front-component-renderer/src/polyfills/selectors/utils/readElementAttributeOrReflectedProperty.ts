import { isNonEmptyString, isNumber, isObject, isString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { isDeclaredRemoteProperty } from '@/polyfills/selectors/utils/isDeclaredRemoteProperty';
import { readElementAttributeIgnoringCase } from '@/polyfills/selectors/utils/readElementAttributeIgnoringCase';

type StyleDeclarationLike = {
  cssText?: unknown;
};

const readReflectedStyleAttribute = (propertyValue: unknown): string | null => {
  const cssText = isObject(propertyValue)
    ? (propertyValue as StyleDeclarationLike).cssText
    : null;

  return isNonEmptyString(cssText) ? cssText : null;
};

export const readElementAttributeOrReflectedProperty = (
  element: SelectorElementLike,
  attributeName: string,
): string | null => {
  const attributeValue = readElementAttributeIgnoringCase(
    element,
    attributeName,
  );

  if (isDefined(attributeValue)) {
    return attributeValue;
  }

  if (!isDeclaredRemoteProperty({ element, propertyName: attributeName })) {
    return null;
  }

  const propertyValue = element[attributeName];

  if (isString(propertyValue)) {
    return propertyValue;
  }

  if (isNumber(propertyValue)) {
    return String(propertyValue);
  }

  if (attributeName === 'style') {
    return readReflectedStyleAttribute(propertyValue);
  }

  return propertyValue === true ? '' : null;
};
