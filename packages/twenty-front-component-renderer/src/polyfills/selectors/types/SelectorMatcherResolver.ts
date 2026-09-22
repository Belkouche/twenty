import { type CompiledSelectorMatcher } from '@/polyfills/selectors/types/CompiledSelectorMatcher';
import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';

export type SelectorMatcherResolver = {
  resolveSelectorMatcher: (input: {
    selectorsText: string;
    scopeElement: SelectorElementLike;
  }) => CompiledSelectorMatcher;
};
