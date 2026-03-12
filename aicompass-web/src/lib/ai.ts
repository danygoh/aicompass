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
      console.log('Trying DeepSeek...');
      const response = await deepseek.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
          ...(system ? [{ role: 'system' as const, content: system }] : []),
          { role: 'user' as const, content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }, { timeout: 30000 });
      
      const text = response.choices[0]?.message?.content;
      if (text) {
        console.log('DeepSeek success');
        return text;
      }
    } catch (error: any) {
      console.log('DeepSeek error:', error.message);
    }
  }
  
  // Fallback to Anthropic
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      console.log('Trying Anthropic...');
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        temperature: 0.7,
        messages: [
          ...(system ? [{ role: 'user' as const, content: `${system}\n\n${prompt}` }] : [{ role: 'user' as const, content: prompt }])
        ]
      }, { timeout: 30000 });
      
      console.log('Anthropic success');
      return response.content[0].type === 'text' ? response.content[0].text : '';
    } catch (error: any) {
      console.log('Anthropic error:', error.message);
    }
  }
  
  throw new Error('No AI API keys configured');
}

export { deepseek, anthropic };
