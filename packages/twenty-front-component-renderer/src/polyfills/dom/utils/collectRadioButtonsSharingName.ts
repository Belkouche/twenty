import { isNonEmptyString } from '@sniptt/guards';

import { iterateElementSubtree } from '@/polyfills/dom/utils/iterateElementSubtree';
import { resolveRadioButtonGroupScopeRoot } from '@/polyfills/dom/utils/resolveRadioButtonGroupScopeRoot';
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

export const collectRadioButtonsSharingName = (
  radioButton: SelectorElementLike,
): SelectorElementLike[] => {
  const name = readElementAttributeOrReflectedProperty(radioButton, 'name');

  if (!isNonEmptyString(name)) {
    return [];
  }

  const radioButtonsSharingName: SelectorElementLike[] = [];

  for (const node of iterateElementSubtree(
    resolveRadioButtonGroupScopeRoot(radioButton),
  )) {
    if (
      isSelectorElementNode(node) &&
      node !== radioButton &&
      isRadioButtonNamed(node, name)
    ) {
      radioButtonsSharingName.push(node);
    }
  }

  return radioButtonsSharingName;
};
