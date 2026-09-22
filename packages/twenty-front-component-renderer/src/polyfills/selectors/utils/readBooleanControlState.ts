import { isBoolean } from '@sniptt/guards';

import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { readElementAttributeOrReflectedProperty } from '@/polyfills/selectors/utils/readElementAttributeOrReflectedProperty';

export const readBooleanControlState = ({
  element,
  propertyName,
}: {
  element: SelectorElementLike;
  propertyName: 'checked' | 'disabled' | 'selected';
}): boolean => {
  const propertyValue = element[propertyName];

  return isBoolean(propertyValue)
    ? propertyValue
    : readElementAttributeOrReflectedProperty(element, propertyName) !== null;
};
