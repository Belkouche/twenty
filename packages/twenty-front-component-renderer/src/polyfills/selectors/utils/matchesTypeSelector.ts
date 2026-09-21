import { isString } from '@sniptt/guards';

import { HTML_TAG_TO_CUSTOM_ELEMENT_TAG } from '@/constants/HtmlTagToCustomElementTag';
import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';

export const matchesTypeSelector = (
  element: SelectorElementLike,
  typeName: string,
): boolean => {
  const localName = isString(element.localName)
    ? element.localName.toLowerCase()
    : '';

  return (
    localName === typeName ||
    localName === HTML_TAG_TO_CUSTOM_ELEMENT_TAG[typeName]
  );
};
