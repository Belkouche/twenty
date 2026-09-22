import { isDefined } from 'twenty-shared/utils';

import { SELECTOR_MATCHER_CACHE_SIZE } from '@/polyfills/selectors/constants/SelectorMatcherCacheSize';
import { type CompiledSelectorMatcher } from '@/polyfills/selectors/types/CompiledSelectorMatcher';
import { type SelectorMatcherResolver } from '@/polyfills/selectors/types/SelectorMatcherResolver';
import { buildWorkerSelectorPseudoClassMatchers } from '@/polyfills/selectors/utils/buildWorkerSelectorPseudoClassMatchers';
import { compileSelectorsTextForWorker } from '@/polyfills/selectors/utils/compileSelectorsTextForWorker';
import { resolveSelectorScopeTarget } from '@/polyfills/selectors/utils/resolveSelectorScopeTarget';

export const createSelectorMatcherResolver = ({
  resolveActiveElement,
}: {
  resolveActiveElement: () => object | null;
}): SelectorMatcherResolver => {
  const scopeSlot: { target: object | null } = { target: null };
  const pseudoClassMatchers = buildWorkerSelectorPseudoClassMatchers({
    resolveActiveElement,
    resolveScopeTarget: () => scopeSlot.target,
  });
  const compiledMatcherBySelectorsText = new Map<
    string,
    CompiledSelectorMatcher
  >();

  const resolveCompiledMatcher = (
    selectorsText: string,
  ): CompiledSelectorMatcher => {
    const cachedMatcher = compiledMatcherBySelectorsText.get(selectorsText);

    if (isDefined(cachedMatcher)) {
      return cachedMatcher;
    }

    const compiledMatcher = compileSelectorsTextForWorker({
      selectorsText,
      pseudoClassMatchers,
    });

    if (compiledMatcherBySelectorsText.size >= SELECTOR_MATCHER_CACHE_SIZE) {
      const oldestSelectorsText = compiledMatcherBySelectorsText
        .keys()
        .next().value;

      if (isDefined(oldestSelectorsText)) {
        compiledMatcherBySelectorsText.delete(oldestSelectorsText);
      }
    }

    compiledMatcherBySelectorsText.set(selectorsText, compiledMatcher);

    return compiledMatcher;
  };

  return {
    resolveSelectorMatcher: ({ selectorsText, scopeElement }) => {
      const compiledMatcher = resolveCompiledMatcher(selectorsText);
      const scopeTarget = resolveSelectorScopeTarget(scopeElement);

      return (element) => {
        scopeSlot.target = scopeTarget;

        return compiledMatcher(element);
      };
    },
  };
};
