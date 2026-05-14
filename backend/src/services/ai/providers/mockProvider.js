export function getProviderInfo() {
  return { provider: 'mock', model: 'mock' };
}

function safeTrim(text, max = 8000) {
  const str = String(text ?? '');
  if (str.length <= max) return str;
  return `${str.slice(0, max)}…`;
}

export async function chat({ systemPrompt, messages }) {
  const lastUser = [...(messages ?? [])].reverse().find((m) => m.role === 'user');
  const userText = safeTrim(lastUser?.content ?? '', 500);
  const base =
    "I’m your study assistant. AI is running in mock mode right now.\n\n" +
    (systemPrompt ? `Context note: ${safeTrim(systemPrompt, 240)}\n\n` : '') +
    (userText ? `You asked: “${userText}”\n\n` : '') +
    'Tip: To enable real AI responses, configure `AI_PROVIDER=openai` and `OPENAI_API_KEY` on the backend.';
  return { content: base, confidence: 0.25 };
}

export async function summarize({ inputText }) {
  const text = safeTrim(inputText, 1200);
  return { content: `Summary (mock): ${text}`, confidence: 0.25 };
}

export async function notes({ inputText }) {
  const text = safeTrim(inputText, 1200);
  return { content: `Notes (mock):\n- ${text}`, confidence: 0.25 };
}

export async function quiz({ inputText }) {
  const text = safeTrim(inputText, 240);
  return {
    content: `Quiz (mock):\n1) What is the main idea of: ${text}?\n2) List 2 key points.\n3) What would you try next time?`,
    confidence: 0.25,
  };
}

