import { type WorkerNodeList } from '@/polyfills/dom/types/WorkerNodeList';
import { createWorkerNodeList } from '@/polyfills/dom/utils/createWorkerNodeList';
import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { createSelectorListMatcher } from '@/polyfills/selectors/utils/createSelectorListMatcher';
import { isSelectorElementNode } from '@/polyfills/selectors/utils/isSelectorElementNode';
import { workerDomCssSelectAdapter } from '@/polyfills/selectors/utils/workerDomCssSelectAdapter';

type InstallSelectorMethodsPolyfillInput = {
  elementPrototype: object;
  querySelectorTargets: object[];
  resolveActiveElement: () => object | null;
};

type SelectorMethodImplementation = (
  this: SelectorElementLike,
  selectorsText: unknown,
) => unknown;

const defineSelectorMethod = ({
  target,
  methodName,
  method,
}: {
  target: object;
  methodName: string;
  method: SelectorMethodImplementation;
}): void => {
  Object.defineProperty(target, methodName, {
    value: method,
    configurable: true,
    writable: true,
  });
};

export const installSelectorMethodsPolyfill = ({
  elementPrototype,
  querySelectorTargets,
  resolveActiveElement,
}: InstallSelectorMethodsPolyfillInput): void => {
  const createMatcherForScope = ({
    selectorsText,
    scopeElement,
  }: {
    selectorsText: unknown;
    scopeElement: SelectorElementLike;
  }) =>
    createSelectorListMatcher({
      selectorsText: String(selectorsText),
      scopeElement,
      resolveActiveElement,
    });

  function matches(this: SelectorElementLike, selectorsText: unknown): boolean {
    return createMatcherForScope({ selectorsText, scopeElement: this })(this);
  }

  function closest(
    this: SelectorElementLike,
    selectorsText: unknown,
  ): SelectorElementLike | null {
    const isElementMatchingSelectors = createMatcherForScope({
      selectorsText,
      scopeElement: this,
    });
    let currentNode: unknown = this;

    while (isSelectorElementNode(currentNode)) {
      if (isElementMatchingSelectors(currentNode)) {
        return currentNode;
      }

      currentNode = currentNode.parentNode;
    }

    return null;
  }

  function querySelectorAll(
    this: SelectorElementLike,
    selectorsText: unknown,
  ): WorkerNodeList<SelectorElementLike> {
    const isElementMatchingSelectors = createMatcherForScope({
      selectorsText,
      scopeElement: this,
    });

    return createWorkerNodeList(
      workerDomCssSelectAdapter.findAll(
        isElementMatchingSelectors,
        workerDomCssSelectAdapter.getChildren(this),
      ),
    );
  }

  function querySelector(
    this: SelectorElementLike,
    selectorsText: unknown,
  ): SelectorElementLike | null {
    const isElementMatchingSelectors = createMatcherForScope({
      selectorsText,
      scopeElement: this,
    });

    return workerDomCssSelectAdapter.findOne(
      isElementMatchingSelectors,
      workerDomCssSelectAdapter.getChildren(this),
    );
  }

  defineSelectorMethod({
    target: elementPrototype,
    methodName: 'matches',
    method: matches,
  });
  defineSelectorMethod({
    target: elementPrototype,
    methodName: 'webkitMatchesSelector',
    method: matches,
  });
  defineSelectorMethod({
    target: elementPrototype,
    methodName: 'closest',
    method: closest,
  });

  for (const target of querySelectorTargets) {
    defineSelectorMethod({
      target,
      methodName: 'querySelectorAll',
      method: querySelectorAll,
    });
    defineSelectorMethod({
      target,
      methodName: 'querySelector',
      method: querySelector,
    });
  }
};
