import { env } from '../../utils/env.js';
import { LocalStorageAdapter } from './localStorageAdapter.js';

let adapter;

export function getStorage() {
  if (adapter) return adapter;
  if (env.STORAGE_PROVIDER === 'local') {
    adapter = new LocalStorageAdapter();
    return adapter;
  }

  const err = new Error(`Storage provider ${env.STORAGE_PROVIDER} is not implemented yet`);
  err.status = 500;
  throw err;
}

