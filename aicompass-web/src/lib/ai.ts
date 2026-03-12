import { generateText } from 'ai';

// Verify we have API keys
const hasDeepSeek = !!process.env.DEEPSEEK_API_KEY;
const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;

console.log('AI Config - DeepSeek:', hasDeepSeek ? 'available' : 'missing');
console.log('AI Config - Anthropic:', hasAnthropic ? 'available' : 'missing');

export async function generateWithFallback(prompt: string): Promise<string> {
  // Try DeepSeek first
  if (hasDeepSeek) {
    try {
      const { OpenAI } = await import('@ai-sdk/openai');
      const deepseek = new OpenAI({
        baseURL: 'https://api.deepseek.com',
        apiKey: process.env.DEEPSEEK_API_KEY!,
      });
      
      const result = await generateText({
        model: deepseek('deepseek-chat'),
        prompt: prompt,
      });
      
      if (result.text) {
        console.log('DeepSeek success');
        return result.text;
      }
    } catch (error: any) {
      console.log('DeepSeek error:', error.message);
    }
  }
  
  // Fallback to Anthropic
  if (hasAnthropic) {
    try {
      const { Anthropic } = await import('@ai-sdk/anthropic');
      const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY!,
      });
      
      const result = await generateText({
        model: anthropic('claude-sonnet-4-20250514'),
        prompt: prompt,
      });
      
      console.log('Anthropic success');
      return result.text;
    } catch (error: any) {
      console.log('Anthropic error:', error.message);
    }
  }
  
  throw new Error('No AI API keys configured');
}
