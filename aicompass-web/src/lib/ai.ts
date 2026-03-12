import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

// Initialize clients
const deepseek = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY || '',
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export async function generateWithFallback(prompt: string, system?: string): Promise<string> {
  // Try DeepSeek first
  if (process.env.DEEPSEEK_API_KEY) {
    try {
      const response = await deepseek.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
          ...(system ? [{ role: 'system' as const, content: system }] : []),
          { role: 'user' as const, content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      });
      
      const text = response.choices[0]?.message?.content;
      if (text) return text;
    } catch (error: any) {
      console.log('DeepSeek failed, trying Anthropic:', error.message);
    }
  }
  
  // Fallback to Anthropic
  if (process.env.ANTHROPIC_API_KEY) {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      temperature: 0.7,
      messages: [
        ...(system ? [{ role: 'user' as const, content: `${system}\n\n${prompt}` }] : [{ role: 'user' as const, content: prompt }])
      ]
    });
    
    return response.content[0].type === 'text' ? response.content[0].text : '';
  }
  
  throw new Error('No AI API keys configured');
}

export { deepseek, anthropic };
