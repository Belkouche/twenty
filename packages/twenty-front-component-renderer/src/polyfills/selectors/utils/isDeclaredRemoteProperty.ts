import { isFunction } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';

type ConstructorWithRemotePropertyDefinitions = {
  remotePropertyDefinitions?: { has: (propertyName: string) => boolean };
};

export const isDeclaredRemoteProperty = ({
  element,
  propertyName,
}: {
  element: SelectorElementLike;
  propertyName: string;
}): boolean => {
  const elementConstructor = element.constructor;

  if (!isFunction(elementConstructor)) {
    return false;
  }

  const remotePropertyDefinitions = (
    elementConstructor as ConstructorWithRemotePropertyDefinitions
  ).remotePropertyDefinitions;

  return (
    isDefined(remotePropertyDefinitions) &&
    remotePropertyDefinitions.has(propertyName)
  );
};
