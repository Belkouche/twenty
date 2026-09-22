import { isObject, isString } from '@sniptt/guards';
import { type Options } from 'css-select';
import { isDefined } from 'twenty-shared/utils';

import { isAncestorOrSelf } from '@/polyfills/dom/utils/isAncestorOrSelf';
import { iterateElementSubtree } from '@/polyfills/dom/utils/iterateElementSubtree';
import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { isSelectorElementNode } from '@/polyfills/selectors/utils/isSelectorElementNode';
import { normalizeSelectorTagName } from '@/polyfills/selectors/utils/normalizeSelectorTagName';
import { readElementAttribute } from '@/polyfills/selectors/utils/readElementAttribute';

type SelectorPredicate = (element: SelectorElementLike) => boolean;

const COMMENT_NODE_TYPE = 8;

const getChildren = (node: SelectorElementLike): SelectorElementLike[] => {
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

const getParent = (node: SelectorElementLike): SelectorElementLike | null =>
  isObject(node.parentNode) ? (node.parentNode as SelectorElementLike) : null;

function* findMatches({
  nodes,
  matches,
}: {
  nodes: SelectorElementLike[];
  matches: SelectorPredicate;
}): Generator<SelectorElementLike> {
  for (const node of nodes) {
    for (const descendant of iterateElementSubtree(node)) {
      if (isSelectorElementNode(descendant) && matches(descendant)) {
        yield descendant;
      }
    }
  }
}

export const workerSelectorAdapter: NonNullable<
  Options<SelectorElementLike, SelectorElementLike>['adapter']
> = {
  isTag: isSelectorElementNode,
  getChildren,
  getParent,
  getSiblings: (node) => {
    const parent = getParent(node);

    return isDefined(parent) ? getChildren(parent) : [node];
  },
  getName: (element) => normalizeSelectorTagName(element.localName ?? ''),
  getAttributeValue: (element, name) =>
    readElementAttribute(element, name) ?? undefined,
  hasAttrib: (element, name) => readElementAttribute(element, name) !== null,
  getText: (node) =>
    node.nodeType !== COMMENT_NODE_TYPE && isString(node.textContent)
      ? node.textContent
      : '',
  existsOne: (matches, nodes) => !findMatches({ nodes, matches }).next().done,
  findOne: (matches, nodes) =>
    findMatches({ nodes, matches }).next().value ?? null,
  findAll: (matches, nodes) => [...findMatches({ nodes, matches })],
  removeSubsets: (nodes) =>
    [...new Set(nodes)].filter(
      (node) =>
        !nodes.some(
          (ancestor) => ancestor !== node && isAncestorOrSelf(ancestor, node),
        ),
    ),
};
