import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { type SelectorList } from '@/polyfills/selectors/types/SelectorList';
import { type SelectorMatchContext } from '@/polyfills/selectors/types/SelectorMatchContext';
import { matchesComplexSelector } from '@/polyfills/selectors/utils/matchesComplexSelector';

export const matchesSelectorList = (
  element: SelectorElementLike,
  selectorList: SelectorList,
  context: SelectorMatchContext,
): boolean =>
  selectorList.some((complexSelector) =>
    matchesComplexSelector(element, complexSelector, context),
  );
