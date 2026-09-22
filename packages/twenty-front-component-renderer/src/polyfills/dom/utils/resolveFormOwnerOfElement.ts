import { isDefined } from 'twenty-shared/utils';

import { type ElementLike } from '@/polyfills/dom/types/ElementLike';
import { iterateElementSubtree } from '@/polyfills/dom/utils/iterateElementSubtree';
import { resolveTreeRootOfNode } from '@/polyfills/dom/utils/resolveTreeRootOfNode';
import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { isSelectorElementNode } from '@/polyfills/selectors/utils/isSelectorElementNode';
import { normalizeRemoteTagNameToHtmlTagName } from '@/polyfills/selectors/utils/normalizeRemoteTagNameToHtmlTagName';
import { readElementAttributeOrReflectedProperty } from '@/polyfills/selectors/utils/readElementAttributeOrReflectedProperty';
import { resolveParentElement } from '@/polyfills/selectors/utils/resolveParentElement';

const isFormElement = (element: SelectorElementLike): boolean =>
  normalizeRemoteTagNameToHtmlTagName(element.localName ?? '') === 'form';

const findFirstElementWithId = (
  treeRoot: ElementLike,
  id: string,
): SelectorElementLike | null => {
  for (const node of iterateElementSubtree(treeRoot)) {
    if (
      isSelectorElementNode(node) &&
      readElementAttributeOrReflectedProperty(node, 'id') === id
    ) {
      return node;
    }
  }

  return null;
};

const resolveNearestFormAncestor = (
  element: SelectorElementLike,
): SelectorElementLike | null => {
  let ancestor = resolveParentElement(element);

  while (isDefined(ancestor)) {
    if (isFormElement(ancestor)) {
      return ancestor;
    }

    ancestor = resolveParentElement(ancestor);
  }

  return null;
};

export const resolveFormOwnerOfElement = (
  element: SelectorElementLike,
): SelectorElementLike | null => {
  const formId = readElementAttributeOrReflectedProperty(element, 'form');

  if (!isDefined(formId)) {
    return resolveNearestFormAncestor(element);
  }

  const referencedElement = findFirstElementWithId(
    resolveTreeRootOfNode(element),
    formId,
  );

  return isDefined(referencedElement) && isFormElement(referencedElement)
    ? referencedElement
    : null;
};
