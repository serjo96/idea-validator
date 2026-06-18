import { describe, expect, it } from 'vitest';
import { buildAiProviderUrl, buildChatGptUrl, buildClaudeUrl, buildGeminiUrl } from '../aiProviders';

describe('AI provider URLs', () => {
  it('builds ChatGPT link with encoded prompt', () => {
    const url = buildChatGptUrl('Тестовая идея');
    expect(url).toBe('https://chatgpt.com/#?q=%D0%A2%D0%B5%D1%81%D1%82%D0%BE%D0%B2%D0%B0%D1%8F%20%D0%B8%D0%B4%D0%B5%D1%8F');
  });

  it('uses hash query for long ChatGPT prompts', () => {
    const url = buildChatGptUrl('x'.repeat(5000));
    expect(url.startsWith('https://chatgpt.com/#?q=')).toBe(true);
  });

  it('builds Claude new-chat link with prompt', () => {
    const url = buildClaudeUrl('Analyze this idea');
    expect(url).toBe('https://claude.ai/new?q=Analyze%20this%20idea');
  });

  it('builds Gemini app link with prompt', () => {
    const url = buildGeminiUrl('Analyze this idea');
    expect(url).toBe('https://gemini.google.com/app?q=Analyze%20this%20idea');
  });

  it('routes provider ids to the correct builder', () => {
    expect(buildAiProviderUrl('chatgpt', 'hi')).toBe('https://chatgpt.com/#?q=hi');
    expect(buildAiProviderUrl('claude', 'hi')).toBe('https://claude.ai/new?q=hi');
    expect(buildAiProviderUrl('gemini', 'hi')).toBe('https://gemini.google.com/app?q=hi');
  });
});
