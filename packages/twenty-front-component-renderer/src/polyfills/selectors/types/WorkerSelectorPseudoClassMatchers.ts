import { type Options } from 'css-select';

import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';

export type WorkerSelectorPseudoClassMatchers = NonNullable<
  Options<SelectorElementLike, SelectorElementLike>['pseudos']
>;
