import { SELECTOR_WHITESPACE_REGEX } from '@/polyfills/selectors/constants/SelectorWhitespaceRegex';
import { type SelectorAttributeOperator } from '@/polyfills/selectors/types/SelectorAttributeOperator';
import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { readElementAttribute } from '@/polyfills/selectors/utils/readElementAttribute';

type AttributeSelectorOptions = {
  name: string;
  operator: SelectorAttributeOperator | null;
  value: string;
  caseInsensitive: boolean;
};

const ATTRIBUTE_VALUE_SPLIT_REGEX = new RegExp(
  `${SELECTOR_WHITESPACE_REGEX.source}+`,
);

const compareAttributeValue = (
  operator: SelectorAttributeOperator,
  actualValue: string,
  expectedValue: string,
): boolean => {
  switch (operator) {
    case '=':
      return actualValue === expectedValue;
    case '~=':
      return (
        expectedValue !== '' &&
        actualValue.split(ATTRIBUTE_VALUE_SPLIT_REGEX).includes(expectedValue)
      );
    case '|=':
      return (
        actualValue === expectedValue ||
        actualValue.startsWith(`${expectedValue}-`)
      );
    case '^=':
      return expectedValue !== '' && actualValue.startsWith(expectedValue);
    case '$=':
      return expectedValue !== '' && actualValue.endsWith(expectedValue);
    case '*=':
      return expectedValue !== '' && actualValue.includes(expectedValue);
  }
};

export const matchesAttributeSelector = (
  element: SelectorElementLike,
  { name, operator, value, caseInsensitive }: AttributeSelectorOptions,
): boolean => {
  const attributeValue = readElementAttribute(element, name);

  if (attributeValue === null) {
    return false;
  }

  if (operator === null) {
    return true;
  }

  return caseInsensitive
    ? compareAttributeValue(
        operator,
        attributeValue.toLowerCase(),
        value.toLowerCase(),
      )
    : compareAttributeValue(operator, attributeValue, value);
};
