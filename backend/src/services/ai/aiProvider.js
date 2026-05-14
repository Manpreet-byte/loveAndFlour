import { env } from '../../utils/env.js';
import * as mock from './providers/mockProvider.js';

// Provider abstraction. We intentionally keep OpenAI unimplemented here because
// network access / keys vary by deployment. The API contracts stay stable.

export function getAiProvider() {
  if (env.AI_PROVIDER === 'openai' && env.OPENAI_API_KEY) {
    // Placeholder: return mock until real provider is enabled in this repo.
    return mock;
  }
  return mock;
}

