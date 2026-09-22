import { isBoolean } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { isAncestorOrSelf } from '@/polyfills/dom/utils/isAncestorOrSelf';
import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { isDisableableElement } from '@/polyfills/selectors/utils/isDisableableElement';
import { isSelectorElementNode } from '@/polyfills/selectors/utils/isSelectorElementNode';
import { normalizeSelectorTagName } from '@/polyfills/selectors/utils/normalizeSelectorTagName';
import { readElementAttribute } from '@/polyfills/selectors/utils/readElementAttribute';
import { resolveParentElement } from '@/polyfills/selectors/utils/resolveParentElement';

const FIELDSET_AFFECTED_TAG_NAMES = new Set([
  'button',
  'fieldset',
  'input',
  'select',
  'textarea',
]);

const hasDisabledState = (element: SelectorElementLike): boolean =>
  isBoolean(element.disabled)
    ? element.disabled
    : readElementAttribute(element, 'disabled') !== null;

const isInsideFirstLegend = ({
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
      normalizeSelectorTagName(child.localName ?? '') === 'legend'
    ) {
      return isAncestorOrSelf(child, element);
    }
  }

  return false;
};

export const isElementDisabled = (element: SelectorElementLike): boolean => {
  if (!isDisableableElement(element)) {
    return false;
  }

  if (hasDisabledState(element)) {
    return true;
  }

  const tagName = normalizeSelectorTagName(element.localName ?? '');
  let ancestor = resolveParentElement(element);

  if (tagName === 'option') {
    return (
      isDefined(ancestor) &&
      normalizeSelectorTagName(ancestor.localName ?? '') === 'optgroup' &&
      hasDisabledState(ancestor)
    );
  }

  if (!FIELDSET_AFFECTED_TAG_NAMES.has(tagName)) {
    return false;
  }

  while (isDefined(ancestor)) {
    if (
      normalizeSelectorTagName(ancestor.localName ?? '') === 'fieldset' &&
      hasDisabledState(ancestor) &&
      !isInsideFirstLegend({ element, fieldset: ancestor })
    ) {
      return true;
    }

    ancestor = resolveParentElement(ancestor);
  }

  return false;
};
