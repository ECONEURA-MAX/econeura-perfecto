/**
 * ECONEURA Prompts Registry - Enterprise Grade
 * Centralized prompt management with versioning
 */

const neuraCEO = require('./neura-ceo');
const neuraCFO = require('./neura-cfo');
const neuraCTO = require('./neura-cto');
const neuraIA = require('./neura-ia');
const neuraCISO = require('./neura-ciso');
const neuraCSO = require('./neura-cso');
const neuraCOO = require('./neura-coo');
const neuraCHRO = require('./neura-chro');
const neuraCMO = require('./neura-cmo');
const neuraCDO = require('./neura-cdo');
const neuraCINO = require('./neura-cino');

// Registry de todos los prompts
const PROMPT_REGISTRY = {
  'CEO': neuraCEO,
  'CFO': neuraCFO,
  'CTO': neuraCTO,
  'IA': neuraIA,
  'CISO': neuraCISO,
  'CSO': neuraCSO,
  'COO': neuraCOO,
  'CHRO': neuraCHRO,
  'CMO': neuraCMO,
  'CDO': neuraCDO,
  'CINO': neuraCINO
};

// Map agent IDs to NEURA IDs
const AGENT_TO_NEURA = {
  'a-ceo-01': 'CEO',
  'a-ceo-02': 'CEO',
  'a-ceo-03': 'CEO',
  'a-ceo-04': 'CEO',
  'a-cfo-01': 'CFO',
  'a-cfo-02': 'CFO',
  'a-cfo-03': 'CFO',
  'a-cfo-04': 'CFO',
  'a-cto-01': 'CTO',
  'a-cto-02': 'CTO',
  'a-cto-03': 'CTO',
  'a-cto-04': 'CTO',
  'a-ia-01': 'IA',
  'a-ia-02': 'IA',
  'a-ia-03': 'IA',
  'a-ia-04': 'IA',
  'a-ciso-01': 'CISO',
  'a-ciso-02': 'CISO',
  'a-ciso-03': 'CISO',
  'a-ciso-04': 'CISO',
  'a-cso-01': 'CSO',
  'a-cso-02': 'CSO',
  'a-cso-03': 'CSO',
  'a-cso-04': 'CSO',
  'a-coo-01': 'COO',
  'a-coo-02': 'COO',
  'a-coo-03': 'COO',
  'a-coo-04': 'COO',
  'a-chro-01': 'CHRO',
  'a-chro-02': 'CHRO',
  'a-chro-03': 'CHRO',
  'a-chro-04': 'CHRO',
  'a-mkt-01': 'CMO',
  'a-mkt-02': 'CMO',
  'a-mkt-03': 'CMO',
  'a-mkt-04': 'CMO',
  'a-cdo-01': 'CDO',
  'a-cdo-02': 'CDO',
  'a-cdo-03': 'CDO',
  'a-cdo-04': 'CDO',
  'a-cino-01': 'CINO',
  'a-cino-02': 'CINO',
  'a-cino-03': 'CINO',
  'a-cino-04': 'CINO'
};

/**
 * Get prompt for agent ID
 */
function getPromptForAgent(agentId) {
  const neuraId = AGENT_TO_NEURA[agentId];
  if (!neuraId) {
    throw new Error(`Unknown agent ID: ${agentId}`);
  }
  
  const prompt = PROMPT_REGISTRY[neuraId];
  if (!prompt) {
    throw new Error(`Prompt not found for NEURA: ${neuraId}`);
  }
  
  return prompt;
}

/**
 * Get all prompts
 */
function getAllPrompts() {
  return PROMPT_REGISTRY;
}

/**
 * Inject context into prompt template
 */
function injectContext(promptTemplate, context) {
  let result = promptTemplate;
  
  // Replace all {{VARIABLE}} with context values
  Object.keys(context).forEach(key => {
    const placeholder = `{{${key}}}`;
    const value = context[key] || 'N/A';
    result = result.replace(new RegExp(placeholder, 'g'), value);
  });
  
  return result;
}

module.exports = {
  PROMPT_REGISTRY,
  AGENT_TO_NEURA,
  getPromptForAgent,
  getAllPrompts,
  injectContext
};

