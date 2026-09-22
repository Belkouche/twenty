import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { normalizeSelectorTagName } from '@/polyfills/selectors/utils/normalizeSelectorTagName';

const DISABLEABLE_TAG_NAMES = new Set([
  'button',
  'input',
  'select',
  'textarea',
  'fieldset',
  'optgroup',
  'option',
]);

export const isDisableableElement = (element: SelectorElementLike): boolean =>
  DISABLEABLE_TAG_NAMES.has(normalizeSelectorTagName(element.localName ?? ''));
