import { isObject, isString } from '@sniptt/guards';
import { type Options } from 'css-select';
import { isDefined } from 'twenty-shared/utils';

import { isAncestorOrSelfOfNode } from '@/polyfills/dom/utils/isAncestorOrSelfOfNode';
import { iterateElementSubtree } from '@/polyfills/dom/utils/iterateElementSubtree';
import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { isSelectorElementNode } from '@/polyfills/selectors/utils/isSelectorElementNode';
import { normalizeRemoteTagNameToHtmlTagName } from '@/polyfills/selectors/utils/normalizeRemoteTagNameToHtmlTagName';
import { readElementAttributeOrReflectedProperty } from '@/polyfills/selectors/utils/readElementAttributeOrReflectedProperty';

type ElementPredicate = (element: SelectorElementLike) => boolean;

const COMMENT_NODE_TYPE = 8;

const collectChildNodes = (
  node: SelectorElementLike,
): SelectorElementLike[] => {
  const childNodes = node.childNodes ?? [];
  const children: SelectorElementLike[] = [];

  for (let index = 0; index < childNodes.length; index += 1) {
    const child = childNodes[index];

    if (isObject(child)) {
      children.push(child as SelectorElementLike);
    }
  }

  return children;
};

const resolveParentNode = (
  node: SelectorElementLike,
): SelectorElementLike | null =>
  isObject(node.parentNode) ? (node.parentNode as SelectorElementLike) : null;

function* iterateMatchingDescendants({
  nodes,
  isElementMatching,
}: {
  nodes: SelectorElementLike[];
  isElementMatching: ElementPredicate;
}): Generator<SelectorElementLike> {
  for (const node of nodes) {
    for (const descendant of iterateElementSubtree(node)) {
      if (isSelectorElementNode(descendant) && isElementMatching(descendant)) {
        yield descendant;
      }
    }
  }
}

export const workerDomCssSelectAdapter: NonNullable<
  Options<SelectorElementLike, SelectorElementLike>['adapter']
> = {
  isTag: isSelectorElementNode,
  getChildren: collectChildNodes,
  getParent: resolveParentNode,
  getSiblings: (node) => {
    const parent = resolveParentNode(node);

    return isDefined(parent) ? collectChildNodes(parent) : [node];
  },
  getName: (element) =>
    normalizeRemoteTagNameToHtmlTagName(element.localName ?? ''),
  getAttributeValue: (element, name) =>
    readElementAttributeOrReflectedProperty(element, name) ?? undefined,
  hasAttrib: (element, name) =>
    readElementAttributeOrReflectedProperty(element, name) !== null,
  getText: (node) =>
    node.nodeType !== COMMENT_NODE_TYPE && isString(node.textContent)
      ? node.textContent
      : '',
  existsOne: (isElementMatching, nodes) =>
    !iterateMatchingDescendants({ nodes, isElementMatching }).next().done,
  findOne: (isElementMatching, nodes) =>
    iterateMatchingDescendants({ nodes, isElementMatching }).next().value ??
    null,
  findAll: (isElementMatching, nodes) => [
    ...iterateMatchingDescendants({ nodes, isElementMatching }),
  ],
  removeSubsets: (nodes) =>
    [...new Set(nodes)].filter(
      (node) =>
        !nodes.some(
          (ancestor) =>
            ancestor !== node && isAncestorOrSelfOfNode(ancestor, node),
        ),
    ),
};
