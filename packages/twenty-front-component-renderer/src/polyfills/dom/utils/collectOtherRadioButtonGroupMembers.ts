import { isNonEmptyString } from '@sniptt/guards';

import { iterateElementSubtree } from '@/polyfills/dom/utils/iterateElementSubtree';
import { resolveFormOwnerOfElement } from '@/polyfills/dom/utils/resolveFormOwnerOfElement';
import { resolveTreeRootOfNode } from '@/polyfills/dom/utils/resolveTreeRootOfNode';
import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { isSelectorElementNode } from '@/polyfills/selectors/utils/isSelectorElementNode';
import { normalizeRemoteTagNameToHtmlTagName } from '@/polyfills/selectors/utils/normalizeRemoteTagNameToHtmlTagName';
import { readElementAttributeOrReflectedProperty } from '@/polyfills/selectors/utils/readElementAttributeOrReflectedProperty';

const isRadioButtonNamed = (
  element: SelectorElementLike,
  name: string,
): boolean =>
  normalizeRemoteTagNameToHtmlTagName(element.localName ?? '') === 'input' &&
  readElementAttributeOrReflectedProperty(element, 'type') === 'radio' &&
  readElementAttributeOrReflectedProperty(element, 'name') === name;

export const collectOtherRadioButtonGroupMembers = (
  radioButton: SelectorElementLike,
): SelectorElementLike[] => {
  const name = readElementAttributeOrReflectedProperty(radioButton, 'name');

  if (!isNonEmptyString(name)) {
    return [];
  }

  const formOwner = resolveFormOwnerOfElement(radioButton);
  const groupMembers: SelectorElementLike[] = [];

  for (const node of iterateElementSubtree(
    resolveTreeRootOfNode(radioButton),
  )) {
    if (
      isSelectorElementNode(node) &&
      node !== radioButton &&
      isRadioButtonNamed(node, name) &&
      resolveFormOwnerOfElement(node) === formOwner
    ) {
      groupMembers.push(node);
    }
  }

  return groupMembers;
};
