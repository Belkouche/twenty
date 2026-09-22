import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';

export type CompiledSelectorMatcher = (element: SelectorElementLike) => boolean;
