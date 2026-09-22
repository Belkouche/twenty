import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { isDocumentNode } from '@/polyfills/selectors/utils/isDocumentNode';
import { isSelectorElementNode } from '@/polyfills/selectors/utils/isSelectorElementNode';
import { workerDomCssSelectAdapter } from '@/polyfills/selectors/utils/workerDomCssSelectAdapter';

export const resolveSelectorScopeTarget = (
  scopeElement: SelectorElementLike,
): object | null =>
  isDocumentNode(scopeElement)
    ? (workerDomCssSelectAdapter
        .getChildren(scopeElement)
        .find(isSelectorElementNode) ?? null)
    : scopeElement;
