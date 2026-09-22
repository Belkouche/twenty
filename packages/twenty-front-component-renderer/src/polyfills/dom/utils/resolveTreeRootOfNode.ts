import { type ElementLike } from '@/polyfills/dom/types/ElementLike';
import { collectAncestorChainFromRootToNode } from '@/polyfills/dom/utils/collectAncestorChainFromRootToNode';

export const resolveTreeRootOfNode = (node: ElementLike): ElementLike =>
  collectAncestorChainFromRootToNode(node)[0] ?? node;
