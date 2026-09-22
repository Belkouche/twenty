import { HTML_TAG_BY_REMOTE_TAG } from '@/polyfills/selectors/constants/HtmlTagByRemoteTag';

export const normalizeSelectorTagName = (tagName: string): string =>
  HTML_TAG_BY_REMOTE_TAG.get(tagName.toLowerCase()) ?? tagName.toLowerCase();
