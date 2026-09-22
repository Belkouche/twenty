import { type WorkerNodeList } from '@/polyfills/dom/types/WorkerNodeList';
import { createWorkerNodeList } from '@/polyfills/dom/utils/createWorkerNodeList';
import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { createSelectorMatcher } from '@/polyfills/selectors/utils/createSelectorMatcher';
import { isSelectorElementNode } from '@/polyfills/selectors/utils/isSelectorElementNode';
import { workerSelectorAdapter } from '@/polyfills/selectors/utils/workerSelectorAdapter';

type InstallSelectorMethodsInput = {
  elementPrototype: object;
  queryTargets: object[];
  resolveActiveElement: () => object | null;
};

type SelectorMethod = (
  this: SelectorElementLike,
  selectors: unknown,
) => unknown;

const defineSelectorMethod = ({
  target,
  methodName,
  method,
}: {
  target: object;
  methodName: string;
  method: SelectorMethod;
}): void => {
  Object.defineProperty(target, methodName, {
    value: method,
    configurable: true,
    writable: true,
  });
};

export const installSelectorMethods = ({
  elementPrototype,
  queryTargets,
  resolveActiveElement,
}: InstallSelectorMethodsInput): void => {
  const createMatcher = ({
    selectors,
    scopeElement,
  }: {
    selectors: unknown;
    scopeElement: SelectorElementLike;
  }) =>
    createSelectorMatcher({
      selectors: String(selectors),
      scopeElement,
      resolveActiveElement,
    });

  function matches(this: SelectorElementLike, selectors: unknown): boolean {
    return createMatcher({ selectors, scopeElement: this })(this);
  }

  function closest(
    this: SelectorElementLike,
    selectors: unknown,
  ): SelectorElementLike | null {
    const matchesElement = createMatcher({ selectors, scopeElement: this });
    let currentNode: unknown = this;

    while (isSelectorElementNode(currentNode)) {
      if (matchesElement(currentNode)) {
        return currentNode;
      }

      currentNode = currentNode.parentNode;
    }

    return null;
  }

  function querySelectorAll(
    this: SelectorElementLike,
    selectors: unknown,
  ): WorkerNodeList<SelectorElementLike> {
    const matchesElement = createMatcher({ selectors, scopeElement: this });

    return createWorkerNodeList(
      workerSelectorAdapter.findAll(
        matchesElement,
        workerSelectorAdapter.getChildren(this),
      ),
    );
  }

  function querySelector(
    this: SelectorElementLike,
    selectors: unknown,
  ): SelectorElementLike | null {
    const matchesElement = createMatcher({ selectors, scopeElement: this });

    return workerSelectorAdapter.findOne(
      matchesElement,
      workerSelectorAdapter.getChildren(this),
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

  for (const target of queryTargets) {
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
