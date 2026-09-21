import { isDefined } from 'twenty-shared/utils';

import { type ComplexSelector } from '@/polyfills/selectors/types/ComplexSelector';
import { type CompoundSelector } from '@/polyfills/selectors/types/CompoundSelector';
import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { type SelectorMatchContext } from '@/polyfills/selectors/types/SelectorMatchContext';
import { matchesSimpleSelector } from '@/polyfills/selectors/utils/matchesSimpleSelector';
import { resolveElementSiblings } from '@/polyfills/selectors/utils/resolveElementSiblings';
import { resolveParentElement } from '@/polyfills/selectors/utils/resolveParentElement';

const matchesCompoundSelector = (
  element: SelectorElementLike,
  compoundSelector: CompoundSelector,
  context: SelectorMatchContext,
): boolean =>
  compoundSelector.every((simpleSelector) =>
    matchesSimpleSelector(element, simpleSelector, context),
  );

const collectAncestorElements = (
  element: SelectorElementLike,
): SelectorElementLike[] => {
  const ancestors: SelectorElementLike[] = [];
  let ancestor = resolveParentElement(element);

  while (isDefined(ancestor)) {
    ancestors.push(ancestor);
    ancestor = resolveParentElement(ancestor);
  }

  return ancestors;
};

export const matchesComplexSelector = (
  element: SelectorElementLike,
  { compounds, combinators }: ComplexSelector,
  context: SelectorMatchContext,
): boolean => {
  const matchesFromCompoundIndex = (
    candidate: SelectorElementLike,
    compoundIndex: number,
  ): boolean => {
    if (
      !matchesCompoundSelector(candidate, compounds[compoundIndex], context)
    ) {
      return false;
    }

    if (compoundIndex === 0) {
      return true;
    }

    const matchesPrevious = (previousCandidate: SelectorElementLike) =>
      matchesFromCompoundIndex(previousCandidate, compoundIndex - 1);

    switch (combinators[compoundIndex - 1]) {
      case 'child': {
        const parentElement = resolveParentElement(candidate);

        return isDefined(parentElement) && matchesPrevious(parentElement);
      }
      case 'descendant':
        return collectAncestorElements(candidate).some(matchesPrevious);
      case 'next-sibling': {
        const [previousSibling] =
          resolveElementSiblings(candidate).previousSiblings;

        return isDefined(previousSibling) && matchesPrevious(previousSibling);
      }
      case 'subsequent-sibling':
        return resolveElementSiblings(candidate).previousSiblings.some(
          matchesPrevious,
        );
    }
  };

  return matchesFromCompoundIndex(element, compounds.length - 1);
};
