import { compile } from 'css-select';
import { parse } from 'css-what';
import { isNonEmptyArray } from 'twenty-shared/utils';

import { type CompiledSelectorMatcher } from '@/polyfills/selectors/types/CompiledSelectorMatcher';
import { type WorkerSelectorPseudoClassMatchers } from '@/polyfills/selectors/types/WorkerSelectorPseudoClassMatchers';
import { createSelectorSyntaxError } from '@/polyfills/selectors/utils/createSelectorSyntaxError';
import { normalizeParsedSelectorListForWorker } from '@/polyfills/selectors/utils/normalizeParsedSelectorListForWorker';
import { workerDomCssSelectAdapter } from '@/polyfills/selectors/utils/workerDomCssSelectAdapter';

export const compileSelectorsTextForWorker = ({
  selectorsText,
  pseudoClassMatchers,
}: {
  selectorsText: string;
  pseudoClassMatchers: WorkerSelectorPseudoClassMatchers;
}): CompiledSelectorMatcher => {
  try {
    const selectorList = parse(selectorsText);

    if (!isNonEmptyArray(selectorList)) {
      throw createSelectorSyntaxError(selectorsText);
    }

    return compile(
      normalizeParsedSelectorListForWorker(selectorList, {
        isInsideHasArgument: false,
      }),
      {
        adapter: workerDomCssSelectAdapter,
        relativeSelector: false,
        cacheResults: false,
        pseudos: pseudoClassMatchers,
      },
    );
  } catch {
    throw createSelectorSyntaxError(selectorsText);
  }
};
