// Direct API calls without SDK

export async function generateWithFallback(prompt: string): Promise<string> {
  const deepseekKey = process.env.DEEPSEEK_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  
  console.log('DeepSeek key available:', !!deepseekKey);
  console.log('Anthropic key available:', !!anthropicKey);

  // Try DeepSeek
  if (deepseekKey) {
    try {
      console.log('Calling DeepSeek...');
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${deepseekKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        console.log('DeepSeek response error:', err);
        throw new Error(err);
      }

      const data = await response.json();
      console.log('DeepSeek success');
      return data.choices[0].message.content;
    } catch (error: any) {
      console.log('DeepSeek error:', error.message);
    }
  }

  // Try Anthropic
  if (anthropicKey) {
    try {
      console.log('Calling Anthropic...');
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2000,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        console.log('Anthropic response error:', err);
        throw new Error(err);
      }

      const data = await response.json();
      console.log('Anthropic success');
      return data.content[0].text;
    } catch (error: any) {
      console.log('Anthropic error:', error.message);
    }
  }

  throw new Error('No AI API keys configured');
}
