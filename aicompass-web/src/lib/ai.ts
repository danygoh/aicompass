import https from 'https';

function repairJSON(text: string): any {
  let cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
  cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');
  cleaned = cleaned.replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3');
  cleaned = cleaned.replace(/'([^']*?)'/g, '"$1"');
  cleaned = cleaned.replace(/[\x00-\x1F\x7F]/g, '');
  
  try { return JSON.parse(cleaned); } catch {}
  const match = cleaned.match(/\[[\s\S]*\]/);
  if (match) try { return JSON.parse(match[0]); } catch {}
  return null;
}

export async function generateWithFallback(prompt: string): Promise<any> {
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicKey) throw new Error('No API key');

  // Better prompt that includes user details
  const fullPrompt = `Generate AI readiness report for: ${prompt}. 

Required JSON with exactly these 12 keys: professionalProfile, companyOverview, companyAIPosture, industryAILandscape, regulatoryEnvironment, countryAIPolicy, competitiveIntelligence, aiSkillsMarket, technologyStack, peerBenchmarks, recentAIEvents, skillsCredentials.

Format: {"key1":"value","key2":"value2"}. Each value is 1-2 sentences about how this relates to the person/company above. Be specific and personalized.`;

  const postData = JSON.stringify({
    model: 'claude-opus-4-6',
    max_tokens: 1800,
    messages: [{ role: 'user', content: fullPrompt }]
  });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.anthropic.com',
      port: 443,
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 35000
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        if (res.statusCode !== 200) { reject(new Error(`API: ${res.statusCode}`)); return; }
        try {
          const parsed = JSON.parse(data);
          const text = parsed.content[0].text;
          const repaired = repairJSON(text);
          if (repaired) resolve(repaired);
          else resolve(text);
        } catch(e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
    req.write(postData);
    req.end();
  });
}
