import { isAncestorOrSelf } from '../isAncestorOrSelf';

type FakeNode = {
  parentNode: FakeNode | null;
};

const createNode = (parentNode: FakeNode | null = null): FakeNode => ({
  parentNode,
});

describe('isAncestorOrSelf', () => {
  it('should return true for the node itself', () => {
    const node = createNode();

    expect(isAncestorOrSelf(node, node)).toBe(true);
  });

  it('should return true for an indirect ancestor', () => {
    const ancestor = createNode();
    const descendant = createNode(createNode(ancestor));

    expect(isAncestorOrSelf(ancestor, descendant)).toBe(true);
  });

  it('should return false for a descendant, a sibling subtree and non-nodes', () => {
    const root = createNode();
    const child = createNode(root);
    const sibling = createNode(root);

    expect(isAncestorOrSelf(child, root)).toBe(false);
    expect(isAncestorOrSelf(child, createNode(sibling))).toBe(false);
    expect(isAncestorOrSelf(root, null)).toBe(false);
    expect(isAncestorOrSelf(root, 'text')).toBe(false);
  });
});
