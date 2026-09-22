import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { readElementAttributeOrReflectedProperty } from '@/polyfills/selectors/utils/readElementAttributeOrReflectedProperty';
import { resolveParentElement } from '@/polyfills/selectors/utils/resolveParentElement';

const parseLanguageRanges = (languageRanges: string): string[] =>
  languageRanges
    .split(',')
    .map((languageRange) =>
      languageRange
        .trim()
        .replace(/^["']|["']$/g, '')
        .toLowerCase(),
    )
    .filter(isNonEmptyString);

const resolveElementLanguage = (
  element: SelectorElementLike,
): string | null => {
  let currentElement: SelectorElementLike | null = element;

  while (isDefined(currentElement)) {
    const language = readElementAttributeOrReflectedProperty(
      currentElement,
      'lang',
    );

    if (isDefined(language)) {
      return language.toLowerCase();
    }

    currentElement = resolveParentElement(currentElement);
  }

  return null;
};

const doesLanguageMatchRange = ({
  language,
  languageRange,
}: {
  language: string;
  languageRange: string;
}): boolean =>
  languageRange === '*'
    ? isNonEmptyString(language)
    : language === languageRange || language.startsWith(`${languageRange}-`);

export const doesElementMatchLanguageRanges = ({
  element,
  languageRanges,
}: {
  element: SelectorElementLike;
  languageRanges: string | null;
}): boolean => {
  const language = resolveElementLanguage(element);

  if (!isDefined(language) || !isDefined(languageRanges)) {
    return false;
  }

  return parseLanguageRanges(languageRanges).some((languageRange) =>
    doesLanguageMatchRange({ language, languageRange }),
  );
};
