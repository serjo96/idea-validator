import type { ReactNode } from 'react';

export type AiProviderId = 'chatgpt' | 'claude' | 'gemini';

export type AiProvider = {
  id: AiProviderId;
  name: string;
  iconMark: string;
  buildUrl: (prompt: string) => string;
};

export function buildChatGptUrl(prompt: string): string {
  return `https://chatgpt.com/#?q=${encodeURIComponent(prompt)}`;
}

export function buildClaudeUrl(prompt: string): string {
  return `https://claude.ai/new?q=${encodeURIComponent(prompt)}`;
}

export function buildGeminiUrl(prompt: string): string {
  return `https://gemini.google.com/app?q=${encodeURIComponent(prompt)}`;
}

export function buildAiProviderUrl(id: AiProviderId, prompt: string): string {
  switch (id) {
    case 'chatgpt':
      return buildChatGptUrl(prompt);
    case 'claude':
      return buildClaudeUrl(prompt);
    case 'gemini':
      return buildGeminiUrl(prompt);
  }
}

export const aiProviders: AiProvider[] = [
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    iconMark: '◎',
    buildUrl: buildChatGptUrl,
  },
  {
    id: 'claude',
    name: 'Claude by Anthropic',
    iconMark: 'A',
    buildUrl: buildClaudeUrl,
  },
  {
    id: 'gemini',
    name: 'Gemini by Google',
    iconMark: '✦',
    buildUrl: buildGeminiUrl,
  },
];

export type AiProviderView = AiProvider & { icon: ReactNode };
