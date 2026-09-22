import { isString } from '@sniptt/guards';
import { isTraversal, type Selector, SelectorType } from 'css-what';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { CONTROL_STATE_PSEUDO_CLASS_NAMES } from '@/polyfills/selectors/constants/ControlStatePseudoClassNames';
import { normalizeSelectorTagName } from '@/polyfills/selectors/utils/normalizeSelectorTagName';

const anchorRelativeSelector = (selectors: Selector[]): Selector[] => {
  const scopeSelector: Selector = {
    type: SelectorType.Pseudo,
    name: 'scope',
    data: null,
  };

  if (isTraversal(selectors[0])) {
    return [scopeSelector, ...selectors];
  }

  return [
    { type: SelectorType.Pseudo, name: 'is', data: [[scopeSelector]] },
    { type: SelectorType.Descendant },
    ...selectors,
  ];
};

const normalizeSelector = (selector: Selector): Selector => {
  if (selector.type === SelectorType.Tag) {
    return { ...selector, name: normalizeSelectorTagName(selector.name) };
  }

  if (selector.type !== SelectorType.Pseudo) {
    return selector;
  }

  const data =
    isDefined(selector.data) && !isString(selector.data)
      ? normalizeWorkerSelectorList(selector.data)
      : selector.data;

  return {
    ...selector,
    name: CONTROL_STATE_PSEUDO_CLASS_NAMES.get(selector.name) ?? selector.name,
    data:
      selector.name === 'has' && isDefined(data) && !isString(data)
        ? data.map(anchorRelativeSelector)
        : data,
  };
};

export const normalizeWorkerSelectorList = (
  selectorList: Selector[][],
): Selector[][] =>
  selectorList.map((selectors) => {
    if (
      !isNonEmptyArray(selectors) ||
      isTraversal(selectors[selectors.length - 1])
    ) {
      throw new Error('Incomplete selector');
    }

    return selectors.map(normalizeSelector);
  });
