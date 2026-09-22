import { isAncestorOrSelfOfNode } from '@/polyfills/dom/utils/isAncestorOrSelfOfNode';
import { UNOBSERVABLE_PSEUDO_CLASS_NAMES } from '@/polyfills/selectors/constants/UnobservablePseudoClassNames';
import { WORKER_SCOPE_PSEUDO_CLASS_NAME } from '@/polyfills/selectors/constants/WorkerScopePseudoClassName';
import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { type WorkerSelectorPseudoClassMatchers } from '@/polyfills/selectors/types/WorkerSelectorPseudoClassMatchers';
import { canElementBeDisabled } from '@/polyfills/selectors/utils/canElementBeDisabled';
import { doesElementMatchLanguageRanges } from '@/polyfills/selectors/utils/doesElementMatchLanguageRanges';
import { isDocumentNode } from '@/polyfills/selectors/utils/isDocumentNode';
import { isElementCandidateForConstraintValidation } from '@/polyfills/selectors/utils/isElementCandidateForConstraintValidation';
import { isElementChecked } from '@/polyfills/selectors/utils/isElementChecked';
import { isElementDisabled } from '@/polyfills/selectors/utils/isElementDisabled';
import { isElementIndeterminate } from '@/polyfills/selectors/utils/isElementIndeterminate';
import { isElementPlaceholderShown } from '@/polyfills/selectors/utils/isElementPlaceholderShown';
import { isElementReadWrite } from '@/polyfills/selectors/utils/isElementReadWrite';
import { readElementAttributeOrReflectedProperty } from '@/polyfills/selectors/utils/readElementAttributeOrReflectedProperty';
import { resolveElementDirectionality } from '@/polyfills/selectors/utils/resolveElementDirectionality';

const isUnmatched = (): boolean => false;

const isUnmatchedWithArgument = (
  _element: SelectorElementLike,
  _argument?: string | null,
): boolean => false;

export const buildWorkerSelectorPseudoClassMatchers = ({
  resolveActiveElement,
  resolveScopeTarget,
}: {
  resolveActiveElement: () => object | null;
  resolveScopeTarget: () => object | null;
}): WorkerSelectorPseudoClassMatchers => {
  const isActiveElement = (element: SelectorElementLike): boolean =>
    resolveActiveElement() === element;

  return {
    ...Object.fromEntries(
      UNOBSERVABLE_PSEUDO_CLASS_NAMES.map((pseudoClassName) => [
        pseudoClassName,
        isUnmatched,
      ]),
    ),
    'twenty-disabled': isElementDisabled,
    'twenty-enabled': (element) =>
      canElementBeDisabled(element) && !isElementDisabled(element),
    'twenty-checked': isElementChecked,
    [WORKER_SCOPE_PSEUDO_CLASS_NAME]: (element) =>
      element === resolveScopeTarget(),
    root: (element) => isDocumentNode(element.parentNode),
    focus: isActiveElement,
    'focus-visible': isActiveElement,
    'focus-within': (element) =>
      isAncestorOrSelfOfNode(element, resolveActiveElement()),
    target: isUnmatched,
    defined: () => true,
    open: (element) =>
      readElementAttributeOrReflectedProperty(element, 'open') !== null,
    valid: isElementCandidateForConstraintValidation,
    'read-write': isElementReadWrite,
    'read-only': (element) => !isElementReadWrite(element),
    'placeholder-shown': isElementPlaceholderShown,
    indeterminate: isElementIndeterminate,
    lang: (element, languageRanges) =>
      doesElementMatchLanguageRanges({
        element,
        languageRanges: languageRanges ?? null,
      }),
    dir: (element, directionality) =>
      resolveElementDirectionality(element) ===
      directionality?.trim().toLowerCase(),
    state: isUnmatchedWithArgument,
  };
};
