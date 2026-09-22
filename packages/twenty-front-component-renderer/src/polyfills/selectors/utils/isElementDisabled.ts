import { isBoolean } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { isAncestorOrSelfOfNode } from '@/polyfills/dom/utils/isAncestorOrSelfOfNode';
import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { canElementBeDisabled } from '@/polyfills/selectors/utils/canElementBeDisabled';
import { isSelectorElementNode } from '@/polyfills/selectors/utils/isSelectorElementNode';
import { normalizeRemoteTagNameToHtmlTagName } from '@/polyfills/selectors/utils/normalizeRemoteTagNameToHtmlTagName';
import { readElementAttributeOrReflectedProperty } from '@/polyfills/selectors/utils/readElementAttributeOrReflectedProperty';
import { resolveParentElement } from '@/polyfills/selectors/utils/resolveParentElement';

const TAG_NAMES_DISABLED_BY_ANCESTOR_FIELDSET = new Set([
  'button',
  'fieldset',
  'input',
  'select',
  'textarea',
]);

const hasOwnDisabledState = (element: SelectorElementLike): boolean =>
  isBoolean(element.disabled)
    ? element.disabled
    : readElementAttributeOrReflectedProperty(element, 'disabled') !== null;

const isInsideFirstLegendOfFieldset = ({
  element,
  fieldset,
}: {
  element: SelectorElementLike;
  fieldset: SelectorElementLike;
}): boolean => {
  const children = fieldset.childNodes ?? [];

  for (let index = 0; index < children.length; index += 1) {
    const child = children[index];

    if (
      isSelectorElementNode(child) &&
      normalizeRemoteTagNameToHtmlTagName(child.localName ?? '') === 'legend'
    ) {
      return isAncestorOrSelfOfNode(child, element);
    }
  }

  return false;
};

export const isElementDisabled = (element: SelectorElementLike): boolean => {
  if (!canElementBeDisabled(element)) {
    return false;
  }

  if (hasOwnDisabledState(element)) {
    return true;
  }

  const tagName = normalizeRemoteTagNameToHtmlTagName(element.localName ?? '');
  let ancestor = resolveParentElement(element);

  if (tagName === 'option') {
    return (
      isDefined(ancestor) &&
      normalizeRemoteTagNameToHtmlTagName(ancestor.localName ?? '') ===
        'optgroup' &&
      hasOwnDisabledState(ancestor)
    );
  }

  if (!TAG_NAMES_DISABLED_BY_ANCESTOR_FIELDSET.has(tagName)) {
    return false;
  }

  while (isDefined(ancestor)) {
    if (
      normalizeRemoteTagNameToHtmlTagName(ancestor.localName ?? '') ===
        'fieldset' &&
      hasOwnDisabledState(ancestor) &&
      !isInsideFirstLegendOfFieldset({ element, fieldset: ancestor })
    ) {
      return true;
    }

    ancestor = resolveParentElement(ancestor);
  }

  return false;
};
