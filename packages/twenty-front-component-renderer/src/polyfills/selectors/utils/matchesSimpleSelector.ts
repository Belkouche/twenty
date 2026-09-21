import { parseClassTokenList } from '@/polyfills/dom/utils/parseClassTokenList';
import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { type SelectorMatchContext } from '@/polyfills/selectors/types/SelectorMatchContext';
import { type SimpleSelector } from '@/polyfills/selectors/types/SimpleSelector';
import { matchesAttributeSelector } from '@/polyfills/selectors/utils/matchesAttributeSelector';
import { matchesPseudoClassSelector } from '@/polyfills/selectors/utils/matchesPseudoClassSelector';
import { matchesTypeSelector } from '@/polyfills/selectors/utils/matchesTypeSelector';
import { readElementAttribute } from '@/polyfills/selectors/utils/readElementAttribute';

export const matchesSimpleSelector = (
  element: SelectorElementLike,
  simpleSelector: SimpleSelector,
  context: SelectorMatchContext,
): boolean => {
  switch (simpleSelector.kind) {
    case 'universal':
      return true;
    case 'type':
      return matchesTypeSelector(element, simpleSelector.name);
    case 'id':
      return readElementAttribute(element, 'id') === simpleSelector.name;
    case 'class':
      return parseClassTokenList(
        readElementAttribute(element, 'class') ?? '',
      ).includes(simpleSelector.name);
    case 'attribute':
      return matchesAttributeSelector(element, simpleSelector);
    case 'pseudo-class':
      return matchesPseudoClassSelector(element, simpleSelector, context);
  }
};
