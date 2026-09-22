import { isString } from '@sniptt/guards';
import { isTraversal, type Selector, SelectorType } from 'css-what';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { CUSTOM_PSEUDO_CLASS_NAME_BY_CONTROL_STATE_PSEUDO_CLASS_NAME } from '@/polyfills/selectors/constants/CustomPseudoClassNameByControlStatePseudoClassName';
import { normalizeRemoteTagNameToHtmlTagName } from '@/polyfills/selectors/utils/normalizeRemoteTagNameToHtmlTagName';

const anchorRelativeSelectorToScope = (selectors: Selector[]): Selector[] => {
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

const normalizeParsedSelector = (selector: Selector): Selector => {
  if (selector.type === SelectorType.Tag) {
    return {
      ...selector,
      name: normalizeRemoteTagNameToHtmlTagName(selector.name),
    };
  }

  if (selector.type !== SelectorType.Pseudo) {
    return selector;
  }

  const data =
    isDefined(selector.data) && !isString(selector.data)
      ? normalizeParsedSelectorListForWorker(selector.data)
      : selector.data;

  return {
    ...selector,
    name:
      CUSTOM_PSEUDO_CLASS_NAME_BY_CONTROL_STATE_PSEUDO_CLASS_NAME.get(
        selector.name,
      ) ?? selector.name,
    data:
      selector.name === 'has' && isDefined(data) && !isString(data)
        ? data.map(anchorRelativeSelectorToScope)
        : data,
  };
};

export const normalizeParsedSelectorListForWorker = (
  selectorList: Selector[][],
): Selector[][] =>
  selectorList.map((selectors) => {
    if (
      !isNonEmptyArray(selectors) ||
      isTraversal(selectors[selectors.length - 1])
    ) {
      throw new Error('Incomplete selector');
    }

    return selectors.map(normalizeParsedSelector);
  });
