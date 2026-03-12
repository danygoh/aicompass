const TIMEOUT = 45000;

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

// Structured output schema for 12-category intelligence
const SCHEMA = {
  type: "object",
  properties: {
    professionalProfile: {
      type: "object",
      properties: {
        name: { type: "string" },
        fields: { type: "array" },
        sources: { type: "array" }
      },
      required: ["name", "fields", "sources"],
      additionalProperties: false
    },
    companyOverview: {
      type: "object",
      properties: {
        name: { type: "string" },
        fields: { type: "array" },
        sources: { type: "array" }
      },
      required: ["name", "fields", "sources"],
      additionalProperties: false
    },
    companyAIPosture: {
      type: "object",
      properties: {
        name: { type: "string" },
        fields: { type: "array" },
        sources: { type: "array" }
      },
      required: ["name", "fields", "sources"],
      additionalProperties: false
    },
    industryAILandscape: {
      type: "object",
      properties: {
        name: { type: "string" },
        fields: { type: "array" },
        sources: { type: "array" }
      },
      required: ["name", "fields", "sources"],
      additionalProperties: false
    },
    regulatoryEnvironment: {
      type: "object",
      properties: {
        name: { type: "string" },
        fields: { type: "array" },
        sources: { type: "array" }
      },
      required: ["name", "fields", "sources"],
      additionalProperties: false
    },
    countryAIPolicy: {
      type: "object",
      properties: {
        name: { type: "string" },
        fields: { type: "array" },
        sources: { type: "array" }
      },
      required: ["name", "fields", "sources"],
      additionalProperties: false
    },
    competitiveIntelligence: {
      type: "object",
      properties: {
        name: { type: "string" },
        fields: { type: "array" },
        sources: { type: "array" }
      },
      required: ["name", "fields", "sources"],
      additionalProperties: false
    },
    aiSkillsMarket: {
      type: "object",
      properties: {
        name: { type: "string" },
        fields: { type: "array" },
        sources: { type: "array" }
      },
      required: ["name", "fields", "sources"],
      additionalProperties: false
    },
    technologyStack: {
      type: "object",
      properties: {
        name: { type: "string" },
        fields: { type: "array" },
        sources: { type: "array" }
      },
      required: ["name", "fields", "sources"],
      additionalProperties: false
    },
    peerBenchmarks: {
      type: "object",
      properties: {
        name: { type: "string" },
        fields: { type: "array" },
        sources: { type: "array" }
      },
      required: ["name", "fields", "sources"],
      additionalProperties: false
    },
    recentAIEvents: {
      type: "object",
      properties: {
        name: { type: "string" },
        fields: { type: "array" },
        sources: { type: "array" }
      },
      required: ["name", "fields", "sources"],
      additionalProperties: false
    },
    skillsCredentials: {
      type: "object",
      properties: {
        name: { type: "string" },
        fields: { type: "array" },
        sources: { type: "array" }
      },
      required: ["name", "fields", "sources"],
      additionalProperties: false
    }
  },
  required: [
    "professionalProfile", "companyOverview", "companyAIPosture",
    "industryAILandscape", "regulatoryEnvironment", "countryAIPolicy",
    "competitiveIntelligence", "aiSkillsMarket", "technologyStack",
    "peerBenchmarks", "recentAIEvents", "skillsCredentials"
  ],
  additionalProperties: false
};

export async function generateWithFallback(prompt: string): Promise<string> {
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const deepseekKey = process.env.DEEPSEEK_API_KEY;
  
  console.log('Anthropic key:', !!anthropicKey);
  console.log('DeepSeek key:', !!deepseekKey);

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
          model: 'claude-sonnet-4-20250514',
          max_tokens: 3000,
          messages: [{ role: 'user', content: prompt }],
          output_config: {
            format: {
              type: 'json_schema',
              schema: SCHEMA
            }
          }
        }),
      }, 40000);

      if (!response.ok) {
        const err = await response.text();
        console.log('Anthropic error:', response.status, err);
        throw new Error(`Anthropic: ${response.status}`);
      }

      const data = await response.json();
      console.log('Anthropic success (structured)');
      
      // With structured outputs, response is guaranteed valid JSON
      return JSON.stringify(data.content[0].text);
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
