import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { resolveHtmlTagNameOfElement } from '@/polyfills/selectors/utils/resolveHtmlTagNameOfElement';

const TAG_NAMES_WITH_CONSTRAINT_VALIDATION = new Set([
  'button',
  'fieldset',
  'form',
  'input',
  'output',
  'select',
  'textarea',
]);

export const isElementCandidateForConstraintValidation = (
  element: SelectorElementLike,
): boolean =>
  TAG_NAMES_WITH_CONSTRAINT_VALIDATION.has(
    resolveHtmlTagNameOfElement(element),
  );
