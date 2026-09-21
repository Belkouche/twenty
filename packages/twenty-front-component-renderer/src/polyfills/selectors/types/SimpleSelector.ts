import { type SelectorAttributeOperator } from '@/polyfills/selectors/types/SelectorAttributeOperator';
import { type SelectorList } from '@/polyfills/selectors/types/SelectorList';

export type SimpleSelector =
  | { kind: 'universal' }
  | { kind: 'type'; name: string }
  | { kind: 'id'; name: string }
  | { kind: 'class'; name: string }
  | {
      kind: 'attribute';
      name: string;
      operator: SelectorAttributeOperator | null;
      value: string;
      caseInsensitive: boolean;
    }
  | {
      kind: 'pseudo-class';
      name: string;
      selectorListArgument: SelectorList | null;
    };
