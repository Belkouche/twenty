import { isString } from '@sniptt/guards';
import { isTraversal, type Selector, SelectorType } from 'css-what';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { CUSTOM_PSEUDO_CLASS_NAME_BY_CONTROL_STATE_PSEUDO_CLASS_NAME } from '@/polyfills/selectors/constants/CustomPseudoClassNameByControlStatePseudoClassName';
import { WORKER_SCOPE_PSEUDO_CLASS_NAME } from '@/polyfills/selectors/constants/WorkerScopePseudoClassName';
import { normalizeRemoteTagNameToHtmlTagName } from '@/polyfills/selectors/utils/normalizeRemoteTagNameToHtmlTagName';

type NormalizeParsedSelectorListForWorkerOptions = {
  isInsideHasArgument: boolean;
};

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

const resolveWorkerPseudoClassName = ({
  pseudoClassName,
  isInsideHasArgument,
}: {
  pseudoClassName: string;
  isInsideHasArgument: boolean;
}): string => {
  if (pseudoClassName === 'scope' && !isInsideHasArgument) {
    return WORKER_SCOPE_PSEUDO_CLASS_NAME;
  }

  return (
    CUSTOM_PSEUDO_CLASS_NAME_BY_CONTROL_STATE_PSEUDO_CLASS_NAME.get(
      pseudoClassName,
    ) ?? pseudoClassName
  );
};

const normalizeParsedSelector = ({
  selector,
  isInsideHasArgument,
}: {
  selector: Selector;
  isInsideHasArgument: boolean;
}): Selector => {
  if (selector.type === SelectorType.Tag) {
    return {
      ...selector,
      name: normalizeRemoteTagNameToHtmlTagName(selector.name),
    };
  }

  if (selector.type !== SelectorType.Pseudo) {
    return selector;
  }

  const isHasPseudoClass = selector.name === 'has';
  const data =
    isDefined(selector.data) && !isString(selector.data)
      ? normalizeParsedSelectorListForWorker(selector.data, {
          isInsideHasArgument: isInsideHasArgument || isHasPseudoClass,
        })
      : selector.data;

  return {
    ...selector,
    name: resolveWorkerPseudoClassName({
      pseudoClassName: selector.name,
      isInsideHasArgument,
    }),
    data:
      isHasPseudoClass && isDefined(data) && !isString(data)
        ? data.map(anchorRelativeSelectorToScope)
        : data,
  };
};

export const normalizeParsedSelectorListForWorker = (
  selectorList: Selector[][],
  { isInsideHasArgument }: NormalizeParsedSelectorListForWorkerOptions,
): Selector[][] =>
  selectorList.map((selectors) => {
    if (
      !isNonEmptyArray(selectors) ||
      isTraversal(selectors[selectors.length - 1])
    ) {
      throw new Error('Incomplete selector');
    }

    return selectors.map((selector) =>
      normalizeParsedSelector({ selector, isInsideHasArgument }),
    );
  });
