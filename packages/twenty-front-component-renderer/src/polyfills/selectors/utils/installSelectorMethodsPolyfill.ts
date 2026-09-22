import { type WorkerNodeList } from '@/polyfills/dom/types/WorkerNodeList';
import { createWorkerNodeList } from '@/polyfills/dom/utils/createWorkerNodeList';
import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { createSelectorMatcherResolver } from '@/polyfills/selectors/utils/createSelectorMatcherResolver';
import { isSelectorElementNode } from '@/polyfills/selectors/utils/isSelectorElementNode';
import { workerDomCssSelectAdapter } from '@/polyfills/selectors/utils/workerDomCssSelectAdapter';
import { definePolyfillMethod } from '@/polyfills/utils/definePolyfillMethod';

type InstallSelectorMethodsPolyfillInput = {
  elementPrototype: object;
  querySelectorTargets: object[];
  resolveActiveElement: () => object | null;
};

export const installSelectorMethodsPolyfill = ({
  elementPrototype,
  querySelectorTargets,
  resolveActiveElement,
}: InstallSelectorMethodsPolyfillInput): void => {
  const { resolveSelectorMatcher } = createSelectorMatcherResolver({
    resolveActiveElement,
  });

  const createMatcherForScope = ({
    selectorsText,
    scopeElement,
  }: {
    selectorsText: unknown;
    scopeElement: SelectorElementLike;
  }) =>
    resolveSelectorMatcher({
      selectorsText: String(selectorsText),
      scopeElement,
    });

  const matches = (
    element: SelectorElementLike,
    selectorsText: unknown,
  ): boolean =>
    createMatcherForScope({ selectorsText, scopeElement: element })(element);

  const closest = (
    element: SelectorElementLike,
    selectorsText: unknown,
  ): SelectorElementLike | null => {
    const isElementMatchingSelectors = createMatcherForScope({
      selectorsText,
      scopeElement: element,
    });
    let currentNode: unknown = element;

    while (isSelectorElementNode(currentNode)) {
      if (isElementMatchingSelectors(currentNode)) {
        return currentNode;
      }

      currentNode = currentNode.parentNode;
    }

    return null;
  };

  const querySelectorAll = (
    scopeElement: SelectorElementLike,
    selectorsText: unknown,
  ): WorkerNodeList<SelectorElementLike> =>
    createWorkerNodeList(
      workerDomCssSelectAdapter.findAll(
        createMatcherForScope({ selectorsText, scopeElement }),
        workerDomCssSelectAdapter.getChildren(scopeElement),
      ),
    );

  const querySelector = (
    scopeElement: SelectorElementLike,
    selectorsText: unknown,
  ): SelectorElementLike | null =>
    workerDomCssSelectAdapter.findOne(
      createMatcherForScope({ selectorsText, scopeElement }),
      workerDomCssSelectAdapter.getChildren(scopeElement),
    );

  definePolyfillMethod({
    target: elementPrototype,
    methodName: 'matches',
    method: matches,
  });
  definePolyfillMethod({
    target: elementPrototype,
    methodName: 'webkitMatchesSelector',
    method: matches,
  });
  definePolyfillMethod({
    target: elementPrototype,
    methodName: 'closest',
    method: closest,
  });

  for (const target of querySelectorTargets) {
    definePolyfillMethod({
      target,
      methodName: 'querySelectorAll',
      method: querySelectorAll,
    });
    definePolyfillMethod({
      target,
      methodName: 'querySelector',
      method: querySelector,
    });
  }
};
