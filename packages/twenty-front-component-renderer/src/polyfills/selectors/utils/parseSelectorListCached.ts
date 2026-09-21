import { isDefined } from 'twenty-shared/utils';

import { MAX_CACHED_SELECTOR_LISTS } from '@/polyfills/selectors/constants/MaxCachedSelectorLists';
import { parsedSelectorListCache } from '@/polyfills/selectors/states/parsedSelectorListCache';
import { type SelectorList } from '@/polyfills/selectors/types/SelectorList';
import { parseSelectorList } from '@/polyfills/selectors/utils/parseSelectorList';

export const parseSelectorListCached = (
  selectorsText: string,
): SelectorList => {
  const cachedSelectorList = parsedSelectorListCache.get(selectorsText);

  if (isDefined(cachedSelectorList)) {
    return cachedSelectorList;
  }

  const selectorList = parseSelectorList(selectorsText);

  if (parsedSelectorListCache.size >= MAX_CACHED_SELECTOR_LISTS) {
    parsedSelectorListCache.clear();
  }

  parsedSelectorListCache.set(selectorsText, selectorList);

  return selectorList;
};
