import { isObject } from '@sniptt/guards';

import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { isSelectorElementNode } from '@/polyfills/selectors/utils/isSelectorElementNode';

type ElementSiblings = {
  previousSiblings: SelectorElementLike[];
  nextSiblings: SelectorElementLike[];
};

export const resolveElementSiblings = (
  element: SelectorElementLike,
): ElementSiblings => {
  const parentNode = element.parentNode;
  const previousSiblings: SelectorElementLike[] = [];
  const nextSiblings: SelectorElementLike[] = [];

  if (!isObject(parentNode)) {
    return { previousSiblings, nextSiblings };
  }

  const childNodes = (parentNode as SelectorElementLike).childNodes ?? [];
  let hasPassedElement = false;

  for (let index = 0; index < childNodes.length; index += 1) {
    const childNode = childNodes[index];

    if (childNode === element) {
      hasPassedElement = true;
      continue;
    }

    if (!isSelectorElementNode(childNode)) {
      continue;
    }

    if (hasPassedElement) {
      nextSiblings.push(childNode);
    } else {
      previousSiblings.unshift(childNode);
    }
  }

  return { previousSiblings, nextSiblings };
};
