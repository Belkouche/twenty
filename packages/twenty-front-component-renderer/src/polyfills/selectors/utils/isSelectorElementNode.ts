import { isObject } from '@sniptt/guards';

import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';

const ELEMENT_NODE_TYPE = 1;

export const isSelectorElementNode = (
  node: unknown,
): node is SelectorElementLike =>
  isObject(node) &&
  (node as SelectorElementLike).nodeType === ELEMENT_NODE_TYPE;
