const API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';
const MAX_TOKENS = 1000;

const getApiKey = () => {
  return import.meta.env.VITE_GROQ_API_KEY;
};

const callGroq = async (system, messages) => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    return { error: 'API key not configured. Please set VITE_GROQ_API_KEY in .env file.' };
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        messages: [
          { role: 'system', content: system },
          ...messages
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { error: errorData.error?.message || 'API request failed' };
    }

    const data = await response.json();
    return { content: data.choices[0].message.content };
  } catch (error) {
    return { error: 'AI service temporarily unavailable. Please retry.' };
  }
};

export const getRCA = async (machineId, machineLabel, sensorSnapshot, recentTrend) => {
  const system = 'You are an industrial maintenance AI expert. Analyze sensor data and identify root cause. Respond in a structured format with these sections: ROOT_CAUSE: [explanation], MECHANISM: [technical description], ACTIONS: [numbered list of immediate actions], CONFIDENCE: [LOW/MEDIUM/HIGH].';
  
  const userPrompt = `Machine: ${machineLabel} (${machineId}). Current readings: ${JSON.stringify(sensorSnapshot)}. Recent trend: ${JSON.stringify(recentTrend)}. Identify: 1) Root Cause 2) Failure Mechanism 3) Immediate Actions. Be concise and technical.`;
  
  const result = await callGroq(system, [{ role: 'user', content: userPrompt }]);
  
  if (result.error) return result;
  
  try {
    const content = result.content;
    const rootCause = content.match(/ROOT_CAUSE:\s*(.+?)(?=\nMECHANISM:|$)/is)?.[1]?.trim() || 'Unable to determine';
    const mechanism = content.match(/MECHANISM:\s*(.+?)(?=\nACTIONS:|$)/is)?.[1]?.trim() || 'Unable to determine';
    const actionsText = content.match(/ACTIONS:\s*(.+?)(?=\nCONFIDENCE:|$)/is)?.[1]?.trim() || '';
    const actions = actionsText.split(/\d+\.\s*/).filter(a => a.trim()).map(a => a.trim());
    const confidence = content.match(/CONFIDENCE:\s*(LOW|MEDIUM|HIGH)/i)?.[1]?.toUpperCase() || 'MEDIUM';
    
    return {
      rootCause,
      mechanism,
      actions,
      confidence,
      rawResponse: content
    };
  } catch (error) {
    return { error: 'Failed to parse AI response' };
  }
};

export const predictFailure = async (machineId, machineLabel, trendData) => {
  const system = 'You are a predictive maintenance AI. Estimate time to failure from sensor trends. Respond in format: TIME_ESTIMATE: [X hours Y minutes or "No imminent failure"], REASONING: [explanation], URGENCY: [CRITICAL/HIGH/MODERATE/LOW].';
  
  const userPrompt = `Machine: ${machineLabel} (${machineId}). Sensor trend over last 5 minutes: ${JSON.stringify(trendData)}. Estimate time to failure and explain your reasoning.`;
  
  const result = await callGroq(system, [{ role: 'user', content: userPrompt }]);
  
  if (result.error) return result;
  
  try {
    const content = result.content;
    const timeEstimate = content.match(/TIME_ESTIMATE:\s*(.+?)(?=\nREASONING:|$)/is)?.[1]?.trim() || 'Unable to estimate';
    const reasoning = content.match(/REASONING:\s*(.+?)(?=\nURGENCY:|$)/is)?.[1]?.trim() || 'Unable to determine';
    const urgency = content.match(/URGENCY:\s*(CRITICAL|HIGH|MODERATE|LOW)/i)?.[1]?.toUpperCase() || 'MODERATE';
    
    return {
      timeEstimate,
      reasoning,
      urgency,
      rawResponse: content
    };
  } catch (error) {
    return { error: 'Failed to parse AI response' };
  }
};

export const generateReport = async (machineId, machineLabel, reportType, alerts, sensorSummary, rcaResults) => {
  const system = 'You are a professional maintenance report writer for industrial equipment. Generate comprehensive, well-formatted reports with clear sections.';
  
  const userPrompt = `Generate a ${reportType} maintenance report for ${machineLabel} (${machineId}). Alerts: ${JSON.stringify(alerts)}. Sensor summary: ${JSON.stringify(sensorSummary)}. RCA findings: ${JSON.stringify(rcaResults)}. Format with these sections: EXECUTIVE SUMMARY | SENSOR ANALYSIS | ANOMALIES DETECTED | ROOT CAUSE FINDINGS | RECOMMENDATIONS | NEXT MAINTENANCE SCHEDULE. Use professional language and clear formatting.`;
  
  const result = await callGroq(system, [{ role: 'user', content: userPrompt }]);
  
  if (result.error) return result;
  
  return { report: result.content };
};

export const chatMessage = async (conversationHistory, userMessage, allMachineSummaries) => {
  const system = `You are SenseBot, an AI assistant for industrial predictive maintenance. Current machine status: ${JSON.stringify(allMachineSummaries)}. Answer questions about machine health, alerts, and maintenance. Be concise and helpful. Keep responses under 200 words.`;
  
  const messages = [
    ...conversationHistory.slice(-10), // Last 10 messages to stay within token limits
    { role: 'user', content: userMessage }
  ];
  
  const result = await callGroq(system, messages);
  
  if (result.error) return result;
  
  return { reply: result.content };
};

export const getEnergySuggestions = async (machineId, machineLabel, energyData, operatingParams) => {
  const system = 'You are an industrial energy efficiency AI consultant. Provide specific, actionable recommendations. Respond in format: SUGGESTION_1: [action] | SAVINGS: [X%] | DIFFICULTY: [Easy/Medium/Hard], SUGGESTION_2: ... etc.';
  
  const userPrompt = `Machine: ${machineLabel} (${machineId}). Energy consumption: ${energyData} kW. Operating params: ${JSON.stringify(operatingParams)}. Suggest 3-5 specific actions to reduce energy consumption. For each: action, estimated savings %, implementation difficulty (Easy/Medium/Hair).`;
  
  const result = await callGroq(system, [{ role: 'user', content: userPrompt }]);
  
  if (result.error) return result;
  
  try {
    const content = result.content;
    const suggestions = [];
    const pattern = /SUGGESTION_\d+:\s*(.+?)\s*\|\s*SAVINGS:\s*(.+?)\s*\|\s*DIFFICULTY:\s*(Easy|Medium|Hard)/gi;
    let match;
    
    while ((match = pattern.exec(content)) !== null) {
      suggestions.push({
        action: match[1].trim(),
        savings: match[2].trim(),
        difficulty: match[3].trim()
      });
    }
    
    if (suggestions.length === 0) {
      // Fallback parsing
      return { suggestions: [{ action: content, savings: 'Unknown', difficulty: 'Medium' }], rawResponse: content };
    }
    
    return { suggestions, rawResponse: content };
  } catch (error) {
    return { error: 'Failed to parse AI response' };
  }
};

export const calculateCostAnalysis = (machineId, riskScore, predictedFailureHours) => {
  // Cost per hour per machine
  const costPerHourMap = {
    CNC_01: 10000,
    CNC_02: 7000,
    HVAC_01: 7000,
    PUMP_01: 5000
  };
  
  const costPerHour = costPerHourMap[machineId] || 5000;
  
  // Maintenance cost based on risk score
  let maintenanceCost;
  if (riskScore < 50) {
    maintenanceCost = 3000;
  } else if (riskScore <= 80) {
    maintenanceCost = 7000;
  } else {
    maintenanceCost = 15000;
  }
  
  // Calculate loss and savings
  const loss = predictedFailureHours * costPerHour;
  const savings = loss - maintenanceCost;
  
  // Recommendation logic
  let recommendation;
  if (savings > 0) {
    recommendation = 'Fix Immediately';
  } else if (riskScore > 60) {
    recommendation = 'Schedule Soon';
  } else {
    recommendation = 'Monitor';
  }
  
  return {
    loss,
    maintenanceCost,
    savings,
    recommendation
  };
};
