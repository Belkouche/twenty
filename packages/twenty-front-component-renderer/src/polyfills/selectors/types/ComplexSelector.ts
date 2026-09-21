import { type CompoundSelector } from '@/polyfills/selectors/types/CompoundSelector';
import { type SelectorCombinator } from '@/polyfills/selectors/types/SelectorCombinator';

export type ComplexSelector = {
  compounds: CompoundSelector[];
  combinators: SelectorCombinator[];
};
