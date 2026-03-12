// Anthropic structured outputs - guaranteed valid JSON

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

export async function generateWithFallback(prompt: string): Promise<string> {
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const deepseekKey = process.env.DEEPSEEK_API_KEY;
  
  console.log('Anthropic key:', !!anthropicKey);
  console.log('DeepSeek key:', !!deepseekKey);

  // Define the JSON schema for 12-category intelligence
  const schema = {
    type: "object",
    properties: {
      professionalProfile: { type: "object", properties: { name: { type: "string" }, fields: { type: "array" }, sources: { type: "array" } }, required: ["name", "fields", "sources"] },
      companyOverview: { type: "object", properties: { name: { type: "string" }, fields: { type: "array" }, sources: { type: "array" } }, required: ["name", "fields", "sources"] },
      companyAIPosture: { type: "object", properties: { name: { type: "string" }, fields: { type: "array" }, sources: { type: "array" } }, required: ["name", "fields", "sources"] },
      industryAILandscape: { type: "object", properties: { name: { type: "string" }, fields: { type: "array" }, sources: { type: "array" } }, required: ["name", "fields", "sources"] },
      regulatoryEnvironment: { type: "object", properties: { name: { type: "string" }, fields: { type: "array" }, sources: { type: "array" } }, required: ["name", "fields", "sources"] },
      countryAIPolicy: { type: "object", properties: { name: { type: "string" }, fields: { type: "array" }, sources: { type: "array" } }, required: ["name", "fields", "sources"] },
      competitiveIntelligence: { type: "object", properties: { name: { type: "string" }, fields: { type: "array" }, sources: { type: "array" } }, required: ["name", "fields", "sources"] },
      aiSkillsMarket: { type: "object", properties: { name: { type: "string" }, fields: { type: "array" }, sources: { type: "array" } }, required: ["name", "fields", "sources"] },
      technologyStack: { type: "object", properties: { name: { type: "string" }, fields: { type: "array" }, sources: { type: "array" } }, required: ["name", "fields", "sources"] },
      peerBenchmarks: { type: "object", properties: { name: { type: "string" }, fields: { type: "array" }, sources: { type: "array" } }, required: ["name", "fields", "sources"] },
      recentAIEvents: { type: "object", properties: { name: { type: "string" }, fields: { type: "array" }, sources: { type: "array" } }, required: ["name", "fields", "sources"] },
      skillsCredentials: { type: "object", properties: { name: { type: "string" }, fields: { type: "array" }, sources: { type: "array" } }, required: ["name", "fields", "sources"] },
    },
    required: ["professionalProfile", "companyOverview", "companyAIPosture", "industryAILandscape", "regulatoryEnvironment", "countryAIPolicy", "competitiveIntelligence", "aiSkillsMarket", "technologyStack", "peerBenchmarks", "recentAIEvents", "skillsCredentials"]
  };

  // Try Anthropic with structured outputs
  if (anthropicKey) {
    try {
      console.log('Calling Anthropic (structured outputs)...');
      const response = await fetchWithTimeout('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 4096,
          messages: [{ role: 'user', content: prompt }],
          output_config: {
            format: {
              type: 'json_schema',
              schema: schema
            }
          }
        }),
      }, 25000);

      if (!response.ok) {
        const err = await response.text();
        console.log('Anthropic error:', response.status, err);
        throw new Error(`Anthropic: ${response.status}`);
      }

      const data = await response.json();
      console.log('Anthropic success (structured)');
      
      // Find the text block (not at index 0 if web_search used)
      const textBlock = data.content.find((c: any) => c.type === 'text');
      if (!textBlock) throw new Error('No text block in API response');
      
      // Return the JSON string as-is (not stringified)
      return textBlock.text;
    } catch (error: any) {
      console.log('Anthropic failed:', error.message);
    }
  }

  // Fallback to DeepSeek (no structured output)
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
