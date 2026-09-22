import { createWorkerActiveElementStore } from '@/polyfills/dom/utils/createWorkerActiveElementStore';
import { resolvePolyfillHooks } from '@/polyfills/dom/utils/resolvePolyfillHooks';
import { resolveGlobalScopeInstallTargets } from '@/polyfills/utils/resolveGlobalScopeInstallTargets';
import { toGlobalScopeRecord } from '@/polyfills/utils/toGlobalScopeRecord';

export const workerActiveElementStore = createWorkerActiveElementStore({
  hooks: resolvePolyfillHooks(
    resolveGlobalScopeInstallTargets(toGlobalScopeRecord(globalThis)),
  ),
});
