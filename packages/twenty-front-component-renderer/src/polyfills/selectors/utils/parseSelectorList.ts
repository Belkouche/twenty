import { SELECTOR_LIST_PSEUDO_CLASS_NAMES } from '@/polyfills/selectors/constants/SelectorListPseudoClassNames';
import { SELECTOR_WHITESPACE_REGEX } from '@/polyfills/selectors/constants/SelectorWhitespaceRegex';
import { SUPPORTED_PSEUDO_CLASS_NAMES } from '@/polyfills/selectors/constants/SupportedPseudoClassNames';
import { type ComplexSelector } from '@/polyfills/selectors/types/ComplexSelector';
import { type CompoundSelector } from '@/polyfills/selectors/types/CompoundSelector';
import { type SelectorAttributeOperator } from '@/polyfills/selectors/types/SelectorAttributeOperator';
import { type SelectorCombinator } from '@/polyfills/selectors/types/SelectorCombinator';
import { type SelectorList } from '@/polyfills/selectors/types/SelectorList';
import { type SimpleSelector } from '@/polyfills/selectors/types/SimpleSelector';
import { createSelectorSyntaxError } from '@/polyfills/selectors/utils/createSelectorSyntaxError';

const ASCII_IDENTIFIER_START_REGEX = /[A-Za-z_]/;
const ASCII_IDENTIFIER_CHARACTER_REGEX = /[A-Za-z0-9_-]/;
const FIRST_NON_ASCII_CHARACTER_CODE = 0x80;
const ATTRIBUTE_OPERATOR_PREFIXES = new Set(['~', '|', '^', '$', '*']);
const COMBINATOR_BY_CHARACTER: Record<string, SelectorCombinator> = {
  '>': 'child',
  '+': 'next-sibling',
  '~': 'subsequent-sibling',
};

const isNonAsciiCharacter = (character: string): boolean =>
  character.charCodeAt(0) >= FIRST_NON_ASCII_CHARACTER_CODE;

const isIdentifierStartCharacter = (character: string): boolean =>
  ASCII_IDENTIFIER_START_REGEX.test(character) ||
  isNonAsciiCharacter(character);

const isIdentifierCharacter = (character: string): boolean =>
  ASCII_IDENTIFIER_CHARACTER_REGEX.test(character) ||
  isNonAsciiCharacter(character);

export const parseSelectorList = (selectorsText: string): SelectorList => {
  let position = 0;

  const fail = (): never => {
    throw createSelectorSyntaxError(selectorsText);
  };

  const peek = (offset = 0): string => selectorsText[position + offset] ?? '';

  const isAtEnd = (): boolean => position >= selectorsText.length;

  const skipWhitespace = (): boolean => {
    const startPosition = position;

    while (!isAtEnd() && SELECTOR_WHITESPACE_REGEX.test(peek())) {
      position += 1;
    }

    return position > startPosition;
  };

  const expect = (character: string): void => {
    if (peek() !== character) {
      fail();
    }

    position += 1;
  };

  const isIdentifierStart = (): boolean => {
    const character = peek();

    if (character === '\\') {
      return true;
    }

    if (character === '-') {
      return isIdentifierStartCharacter(peek(1)) || peek(1) === '-';
    }

    return isIdentifierStartCharacter(character);
  };

  const parseIdentifier = (): string => {
    let identifier = '';

    while (!isAtEnd()) {
      const character = peek();

      if (character === '\\') {
        identifier += peek(1);
        position += 2;
        continue;
      }

      if (!isIdentifierCharacter(character)) {
        break;
      }

      identifier += character;
      position += 1;
    }

    if (identifier === '') {
      fail();
    }

    return identifier;
  };

  const parseQuotedString = (): string => {
    const quote = peek();
    position += 1;
    let value = '';

    while (!isAtEnd() && peek() !== quote) {
      if (peek() === '\\') {
        value += peek(1);
        position += 2;
        continue;
      }

      value += peek();
      position += 1;
    }

    expect(quote);

    return value;
  };

  const parseAttributeOperator = (): SelectorAttributeOperator => {
    const character = peek();

    if (ATTRIBUTE_OPERATOR_PREFIXES.has(character) && peek(1) === '=') {
      position += 2;

      return `${character}=` as SelectorAttributeOperator;
    }

    expect('=');

    return '=';
  };

  const parseAttributeFlag = (): boolean => {
    const flag = peek().toLowerCase();

    if (flag !== 'i' && flag !== 's') {
      return false;
    }

    position += 1;
    skipWhitespace();

    return flag === 'i';
  };

  const parseAttributeSelector = (): SimpleSelector => {
    expect('[');
    skipWhitespace();
    const name = parseIdentifier().toLowerCase();
    skipWhitespace();

    if (peek() === ']') {
      position += 1;

      return {
        kind: 'attribute',
        name,
        operator: null,
        value: '',
        caseInsensitive: false,
      };
    }

    const operator = parseAttributeOperator();
    skipWhitespace();
    const value =
      peek() === '"' || peek() === "'"
        ? parseQuotedString()
        : parseIdentifier();
    skipWhitespace();
    const caseInsensitive = parseAttributeFlag();
    expect(']');

    return { kind: 'attribute', name, operator, value, caseInsensitive };
  };

  const scanBalancedArgument = (): string => {
    let depth = 1;
    let argument = '';
    let activeQuote: string | null = null;

    while (!isAtEnd()) {
      const character = peek();

      if (activeQuote !== null) {
        argument += character;
        position += 1;

        if (character === '\\') {
          argument += peek();
          position += 1;
        } else if (character === activeQuote) {
          activeQuote = null;
        }

        continue;
      }

      if (character === '"' || character === "'") {
        activeQuote = character;
      } else if (character === '(') {
        depth += 1;
      } else if (character === ')') {
        depth -= 1;

        if (depth === 0) {
          position += 1;

          return argument;
        }
      }

      argument += character;
      position += 1;
    }

    return fail();
  };

  const parsePseudoClassSelector = (): SimpleSelector => {
    expect(':');

    if (peek() === ':') {
      fail();
    }

    const name = parseIdentifier().toLowerCase();

    if (!SUPPORTED_PSEUDO_CLASS_NAMES.has(name)) {
      fail();
    }

    if (peek() !== '(') {
      return { kind: 'pseudo-class', name, selectorListArgument: null };
    }

    position += 1;
    const argument = scanBalancedArgument();

    if (!SELECTOR_LIST_PSEUDO_CLASS_NAMES.has(name)) {
      fail();
    }

    return {
      kind: 'pseudo-class',
      name,
      selectorListArgument: parseSelectorList(argument),
    };
  };

  const parseSimpleSelector = (): SimpleSelector | null => {
    const character = peek();

    if (character === '*') {
      position += 1;

      return { kind: 'universal' };
    }

    if (character === '#') {
      position += 1;

      return { kind: 'id', name: parseIdentifier() };
    }

    if (character === '.') {
      position += 1;

      return { kind: 'class', name: parseIdentifier() };
    }

    if (character === '[') {
      return parseAttributeSelector();
    }

    if (character === ':') {
      return parsePseudoClassSelector();
    }

    if (isIdentifierStart()) {
      return { kind: 'type', name: parseIdentifier().toLowerCase() };
    }

    return null;
  };

  const parseCompoundSelector = (): CompoundSelector => {
    const compoundSelector: CompoundSelector = [];
    let simpleSelector = parseSimpleSelector();

    while (simpleSelector !== null) {
      compoundSelector.push(simpleSelector);
      simpleSelector = parseSimpleSelector();
    }

    if (compoundSelector.length === 0) {
      fail();
    }

    return compoundSelector;
  };

  const parseCombinator = (sawWhitespace: boolean): SelectorCombinator => {
    const explicitCombinator = COMBINATOR_BY_CHARACTER[peek()];

    if (explicitCombinator !== undefined) {
      position += 1;
      skipWhitespace();

      return explicitCombinator;
    }

    if (!sawWhitespace) {
      fail();
    }

    return 'descendant';
  };

  const parseComplexSelector = (): ComplexSelector => {
    const compounds = [parseCompoundSelector()];
    const combinators: SelectorCombinator[] = [];

    while (!isAtEnd()) {
      const sawWhitespace = skipWhitespace();

      if (isAtEnd() || peek() === ',') {
        break;
      }

      combinators.push(parseCombinator(sawWhitespace));
      compounds.push(parseCompoundSelector());
    }

    return { compounds, combinators };
  };

  const selectorList: SelectorList = [];

  skipWhitespace();

  while (!isAtEnd()) {
    selectorList.push(parseComplexSelector());
    skipWhitespace();

    if (isAtEnd()) {
      break;
    }

    expect(',');
    skipWhitespace();

    if (isAtEnd()) {
      fail();
    }
  }

  if (selectorList.length === 0) {
    fail();
  }

  return selectorList;
};
