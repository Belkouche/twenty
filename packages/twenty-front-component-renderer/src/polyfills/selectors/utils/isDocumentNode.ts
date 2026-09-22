import { isObject } from '@sniptt/guards';

import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';

const DOCUMENT_NODE_TYPE = 9;

export const isDocumentNode = (node: unknown): node is SelectorElementLike =>
  isObject(node) &&
  (node as SelectorElementLike).nodeType === DOCUMENT_NODE_TYPE;
