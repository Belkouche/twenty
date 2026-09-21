import { ARIA_BOOLEAN_ATTRIBUTE_NAMES } from '@/remote/elements/constants/AriaBooleanAttributeNames';

export const normalizeAriaAttributeValue = (
  attributeName: string,
  attributeValue: string,
): string =>
  attributeValue === '' &&
  ARIA_BOOLEAN_ATTRIBUTE_NAMES.has(attributeName.toLowerCase())
    ? 'true'
    : attributeValue;
