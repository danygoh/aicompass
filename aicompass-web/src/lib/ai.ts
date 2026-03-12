// Direct API calls without SDK

const TIMEOUT = 15000; // 15 second timeout

async function fetchWithTimeout(url: string, options: any, timeout = TIMEOUT) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error: any) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
}

export async function generateWithFallback(prompt: string): Promise<string> {
  const deepseekKey = process.env.DEEPSEEK_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  
  console.log('DeepSeek key:', !!deepseekKey);
  console.log('Anthropic key:', !!anthropicKey);

  // Try DeepSeek
  if (deepseekKey) {
    try {
      console.log('Calling DeepSeek...');
      const response = await fetchWithTimeout('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${deepseekKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 1500,
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        console.log('DeepSeek error:', response.status, err);
        throw new Error(`DeepSeek: ${response.status}`);
      }

      const data = await response.json();
      console.log('DeepSeek success');
      return data.choices[0].message.content;
    } catch (error: any) {
      console.log('DeepSeek failed:', error.message);
    }
  }

  // Try Anthropic
  if (anthropicKey) {
    try {
      console.log('Calling Anthropic...');
      const response = await fetchWithTimeout('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1500,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        console.log('Anthropic error:', response.status, err);
        throw new Error(`Anthropic: ${response.status}`);
      }

      const data = await response.json();
      console.log('Anthropic success');
      return data.content[0].text;
    } catch (error: any) {
      console.log('Anthropic failed:', error.message);
    }
  }

  throw new Error('No AI API keys configured');
}
