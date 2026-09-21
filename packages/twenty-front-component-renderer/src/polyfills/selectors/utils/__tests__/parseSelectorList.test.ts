import { parseSelectorList } from '../parseSelectorList';

describe('parseSelectorList', () => {
  it('should parse a compound selector with type, id, class and attribute parts', () => {
    expect(parseSelectorList('button#save.primary[type="submit"]')).toEqual([
      {
        compounds: [
          [
            { kind: 'type', name: 'button' },
            { kind: 'id', name: 'save' },
            { kind: 'class', name: 'primary' },
            {
              kind: 'attribute',
              name: 'type',
              operator: '=',
              value: 'submit',
              caseInsensitive: false,
            },
          ],
        ],
        combinators: [],
      },
    ]);
  });

  it('should parse a selector list with every combinator', () => {
    expect(parseSelectorList('ul > li + li ~ li a, *')).toEqual([
      {
        compounds: [
          [{ kind: 'type', name: 'ul' }],
          [{ kind: 'type', name: 'li' }],
          [{ kind: 'type', name: 'li' }],
          [{ kind: 'type', name: 'li' }],
          [{ kind: 'type', name: 'a' }],
        ],
        combinators: [
          'child',
          'next-sibling',
          'subsequent-sibling',
          'descendant',
        ],
      },
      { compounds: [[{ kind: 'universal' }]], combinators: [] },
    ]);
  });

  it('should lowercase type and attribute names but keep values and identifiers', () => {
    expect(parseSelectorList('DIV#MyId.MyClass[Data-Role=Tab]')).toEqual([
      {
        compounds: [
          [
            { kind: 'type', name: 'div' },
            { kind: 'id', name: 'MyId' },
            { kind: 'class', name: 'MyClass' },
            {
              kind: 'attribute',
              name: 'data-role',
              operator: '=',
              value: 'Tab',
              caseInsensitive: false,
            },
          ],
        ],
        combinators: [],
      },
    ]);
  });

  it('should parse every attribute operator, quoting style and the case flag', () => {
    expect(
      parseSelectorList(
        '[a][b~=x][c|=\'y\'][d^="z"][e$=w][f*=v][g="quoted value" i]',
      ),
    ).toEqual([
      {
        compounds: [
          [
            {
              kind: 'attribute',
              name: 'a',
              operator: null,
              value: '',
              caseInsensitive: false,
            },
            {
              kind: 'attribute',
              name: 'b',
              operator: '~=',
              value: 'x',
              caseInsensitive: false,
            },
            {
              kind: 'attribute',
              name: 'c',
              operator: '|=',
              value: 'y',
              caseInsensitive: false,
            },
            {
              kind: 'attribute',
              name: 'd',
              operator: '^=',
              value: 'z',
              caseInsensitive: false,
            },
            {
              kind: 'attribute',
              name: 'e',
              operator: '$=',
              value: 'w',
              caseInsensitive: false,
            },
            {
              kind: 'attribute',
              name: 'f',
              operator: '*=',
              value: 'v',
              caseInsensitive: false,
            },
            {
              kind: 'attribute',
              name: 'g',
              operator: '=',
              value: 'quoted value',
              caseInsensitive: true,
            },
          ],
        ],
        combinators: [],
      },
    ]);
  });

  it('should parse nested functional pseudo-classes', () => {
    expect(
      parseSelectorList('input:not([type="button"]):not(:disabled)'),
    ).toEqual([
      {
        compounds: [
          [
            { kind: 'type', name: 'input' },
            {
              kind: 'pseudo-class',
              name: 'not',
              selectorListArgument: [
                {
                  compounds: [
                    [
                      {
                        kind: 'attribute',
                        name: 'type',
                        operator: '=',
                        value: 'button',
                        caseInsensitive: false,
                      },
                    ],
                  ],
                  combinators: [],
                },
              ],
            },
            {
              kind: 'pseudo-class',
              name: 'not',
              selectorListArgument: [
                {
                  compounds: [
                    [
                      {
                        kind: 'pseudo-class',
                        name: 'disabled',
                        selectorListArgument: null,
                      },
                    ],
                  ],
                  combinators: [],
                },
              ],
            },
          ],
        ],
        combinators: [],
      },
    ]);
  });

  it('should keep parentheses balanced inside quoted arguments', () => {
    expect(parseSelectorList(':not([title=")"])')).toEqual([
      {
        compounds: [
          [
            {
              kind: 'pseudo-class',
              name: 'not',
              selectorListArgument: [
                {
                  compounds: [
                    [
                      {
                        kind: 'attribute',
                        name: 'title',
                        operator: '=',
                        value: ')',
                        caseInsensitive: false,
                      },
                    ],
                  ],
                  combinators: [],
                },
              ],
            },
          ],
        ],
        combinators: [],
      },
    ]);
  });

  it('should unescape backslash escapes in identifiers', () => {
    expect(parseSelectorList('.sm\\:flex')).toEqual([
      {
        compounds: [[{ kind: 'class', name: 'sm:flex' }]],
        combinators: [],
      },
    ]);
  });

  it.each([
    '',
    '   ',
    'div,',
    '> div',
    'div >',
    '[',
    '[data-role=]',
    'div::before',
    ':nth-child(2)',
    ':unknown-pseudo',
    ':not(',
    ':disabled(x)',
    'div$',
  ])('should throw a SyntaxError DOMException for %p', (selectorsText) => {
    expect(() => parseSelectorList(selectorsText)).toThrow(
      expect.objectContaining({ name: 'SyntaxError' }),
    );
  });
});
