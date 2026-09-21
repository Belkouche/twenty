import { iterateElementSubtree } from '@/polyfills/dom/utils/iterateElementSubtree';
import { createWorkerNodeList } from '@/polyfills/dom/utils/createWorkerNodeList';
import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { type SelectorList } from '@/polyfills/selectors/types/SelectorList';
import { type SelectorMatchContext } from '@/polyfills/selectors/types/SelectorMatchContext';
import { isSelectorElementNode } from '@/polyfills/selectors/utils/isSelectorElementNode';
import { matchesSelectorList } from '@/polyfills/selectors/utils/matchesSelectorList';
import { parseSelectorListCached } from '@/polyfills/selectors/utils/parseSelectorListCached';

type InstallSelectorMethodsInput = {
  elementPrototype: object;
  queryTargets: object[];
  resolveActiveElement: () => object | null;
};

type SelectorMethod = (
  this: SelectorElementLike,
  selectors: unknown,
) => unknown;

const defineSelectorMethod = (
  target: object,
  methodName: string,
  method: SelectorMethod,
): void => {
  Object.defineProperty(target, methodName, {
    value: method,
    configurable: true,
    writable: true,
  });
};

const collectMatchingDescendants = (
  scope: SelectorElementLike,
  selectorList: SelectorList,
  context: SelectorMatchContext,
): SelectorElementLike[] => {
  const matchingDescendants: SelectorElementLike[] = [];

  for (const descendant of iterateElementSubtree(scope)) {
    if (
      descendant !== scope &&
      isSelectorElementNode(descendant) &&
      matchesSelectorList(descendant, selectorList, context)
    ) {
      matchingDescendants.push(descendant);
    }
  }

  return matchingDescendants;
};

export const installSelectorMethods = ({
  elementPrototype,
  queryTargets,
  resolveActiveElement,
}: InstallSelectorMethodsInput): void => {
  const createMatchContext = (scopeElement: object): SelectorMatchContext => ({
    scopeElement,
    resolveActiveElement,
  });

  function matches(this: SelectorElementLike, selectors: unknown): boolean {
    return matchesSelectorList(
      this,
      parseSelectorListCached(String(selectors)),
      createMatchContext(this),
    );
  }

  function closest(
    this: SelectorElementLike,
    selectors: unknown,
  ): SelectorElementLike | null {
    const selectorList = parseSelectorListCached(String(selectors));
    const context = createMatchContext(this);
    let currentNode: unknown = this;

    while (isSelectorElementNode(currentNode)) {
      if (matchesSelectorList(currentNode, selectorList, context)) {
        return currentNode;
      }

      currentNode = currentNode.parentNode;
    }

    return null;
  }

  function querySelectorAll(this: SelectorElementLike, selectors: unknown) {
    return createWorkerNodeList(
      collectMatchingDescendants(
        this,
        parseSelectorListCached(String(selectors)),
        createMatchContext(this),
      ) as unknown as Node[],
    );
  }

  function querySelector(
    this: SelectorElementLike,
    selectors: unknown,
  ): SelectorElementLike | null {
    return (
      collectMatchingDescendants(
        this,
        parseSelectorListCached(String(selectors)),
        createMatchContext(this),
      )[0] ?? null
    );
  }

  defineSelectorMethod(elementPrototype, 'matches', matches);
  defineSelectorMethod(elementPrototype, 'webkitMatchesSelector', matches);
  defineSelectorMethod(elementPrototype, 'closest', closest);

  for (const queryTarget of queryTargets) {
    defineSelectorMethod(queryTarget, 'querySelectorAll', querySelectorAll);
    defineSelectorMethod(queryTarget, 'querySelector', querySelector);
  }
};
