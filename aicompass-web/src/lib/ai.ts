const TIMEOUT = 30000;

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

async function callAnthropic(systemPrompt: string, userMessage: string): Promise<string> {
  console.log('Calling Anthropic (Haiku)...');
 
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4096,
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }]
    })
  });

  const data = await response.json();
 
  if (data.error) {
    console.log('Anthropic error:', response.status, JSON.stringify(data));
    throw new Error(`Anthropic: ${response.status}`);
  }

  console.log('Anthropic success');

  // Take the LAST text block — web_search produces multiple content blocks
  const textBlocks = (data.content || []).filter((c: any) => c.type === 'text');
  const raw = textBlocks[textBlocks.length - 1]?.text || '';

  // Strip markdown fences and extract JSON object
  const clean = raw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
  const start = clean.indexOf('{');
  const end = clean.lastIndexOf('}');
 
  if (start === -1 || end === -1) {
    console.error('No JSON found in response. Raw text:', raw.substring(0, 500));
    throw new Error('No JSON object in Anthropic response');
  }

  return clean.substring(start, end + 1);
}

export async function generateWithFallback(prompt: string): Promise<string> {
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const deepseekKey = process.env.DEEPSEEK_API_KEY;
  
  console.log('Anthropic key:', !!anthropicKey);
  console.log('DeepSeek key:', !!deepseekKey);

  // System prompt to enforce JSON output
  const systemPrompt = `You are an AI analyst. Return ONLY valid JSON. No explanations, no markdown.`;

  // Try Anthropic first
  if (anthropicKey) {
    try {
      return await callAnthropic(systemPrompt, prompt);
    } catch (error: any) {
      console.log('Anthropic failed:', error.message);
    }
  }

  // Fallback to DeepSeek
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
          max_tokens: 2000,
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

  throw new Error('No AI API keys configured');
}
