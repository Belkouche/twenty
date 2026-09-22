import { isDefined } from 'twenty-shared/utils';

import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { readElementAttributeOrReflectedProperty } from '@/polyfills/selectors/utils/readElementAttributeOrReflectedProperty';
import { resolveParentElement } from '@/polyfills/selectors/utils/resolveParentElement';

type Directionality = 'ltr' | 'rtl';

const isDirectionality = (value: string): value is Directionality =>
  value === 'ltr' || value === 'rtl';

export const resolveElementDirectionality = (
  element: SelectorElementLike,
): Directionality => {
  let currentElement: SelectorElementLike | null = element;

  while (isDefined(currentElement)) {
    const directionality = readElementAttributeOrReflectedProperty(
      currentElement,
      'dir',
    )?.toLowerCase();

    if (isDefined(directionality) && isDirectionality(directionality)) {
      return directionality;
    }

    currentElement = resolveParentElement(currentElement);
  }

  return 'ltr';
};
