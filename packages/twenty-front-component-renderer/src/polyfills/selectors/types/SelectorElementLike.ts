export type SelectorElementLike = {
  nodeType?: number;
  localName?: string;
  parentNode?: unknown;
  childNodes?: ArrayLike<unknown>;
  attributes?: Iterable<unknown>;
  getAttribute?: (attributeName: string) => string | null;
  [propertyName: string]: unknown;
};
