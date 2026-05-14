/**
 * MyPlugin - UserPromptSubmit Hook
 *
 * 按需技能加载机制：
 * 1. 读取 active-agent.json 获取当前激活的 Agent
 * 2. 对用户输入做关键词匹配（index.json）
 * 3. 只注入匹配到的技能 + 资源文件
 * 4. 未激活 Agent 时不注入任何技能
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// Configuration
const PLUGIN_NAME = 'myplugin';
const PLUGIN_DATA_DIR = path.join(os.homedir(), '.claude', 'plugins', 'data', PLUGIN_NAME);
const ACTIVE_AGENT_FILE = path.join(PLUGIN_DATA_DIR, 'active-agent.json');

// Resolve plugin root from CLAUDE_PLUGIN_ROOT env var or derive from script location
function getPluginRoot() {
  if (process.env.CLAUDE_PLUGIN_ROOT) {
    return process.env.CLAUDE_PLUGIN_ROOT;
  }
  // Fallback: derive from script location
  // Script is at <plugin_root>/hooks/user-prompt-submit.js
  return path.resolve(__dirname, '..');
}

function getActiveAgent() {
  try {
    if (!fs.existsSync(ACTIVE_AGENT_FILE)) {
      return null;
    }
    const data = JSON.parse(fs.readFileSync(ACTIVE_AGENT_FILE, 'utf-8'));
    if (!data.name) {
      return null;
    }
    return data;
  } catch (err) {
    console.error('[myplugin] Error reading active agent:', err.message);
    return null;
  }
}

/**
 * Simple keyword matching: tokenize user input and check against index keywords.
 * Uses word segmentation + substring matching for both Chinese and English.
 */
function tokenizeChinese(text) {
  // Simple bigram tokenization for Chinese text
  const tokens = [];
  const chineseChars = text.match(/[\u4e00-\u9fff]+/g);
  if (chineseChars) {
    for (const segment of chineseChars) {
      for (let i = 0; i < segment.length - 1; i++) {
        tokens.push(segment.substring(i, i + 2));
      }
      tokens.push(segment); // Also include the full segment
    }
  }
  return tokens;
}

function tokenizeEnglish(text) {
  // Extract English words
  const words = text.toLowerCase().match(/[a-zA-Z_]+/g) || [];
  return words;
}

function matchKeywords(userInput, skillIndex) {
  const chineseTokens = tokenizeChinese(userInput);
  const englishTokens = tokenizeEnglish(userInput);
  const allTokens = [...chineseTokens, ...englishTokens, userInput.toLowerCase()];

  const matched = [];

  for (const skill of skillIndex) {
    const keywords = skill.keywords || [];
    let matchCount = 0;

    for (const keyword of keywords) {
      const kw = keyword.toLowerCase();
      // Check if any token contains the keyword or vice versa
      for (const token of allTokens) {
        if (token.includes(kw) || kw.includes(token)) {
          matchCount++;
          break;
        }
      }
    }

    if (matchCount > 0) {
      matched.push({ ...skill, matchCount });
    }
  }

  // Sort by match count descending, take top 2
  matched.sort((a, b) => b.matchCount - a.matchCount);
  return matched.slice(0, 2);
}

function readSkillFile(skillsDir, skillInfo) {
  const filePath = path.join(skillsDir, skillInfo.file);
  try {
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf-8');
    }
  } catch (err) {
    console.error(`[myplugin] Error reading skill file ${filePath}:`, err.message);
  }
  return null;
}

function readResourceFile(skillsDir, resourcePath) {
  const filePath = path.join(skillsDir, resourcePath);
  try {
    if (fs.existsSync(filePath)) {
      return {
        path: resourcePath,
        content: fs.readFileSync(filePath, 'utf-8'),
      };
    }
  } catch (err) {
    console.error(`[myplugin] Error reading resource ${filePath}:`, err.message);
  }
  return null;
}

function buildContextInjection(agent, agentSkills, sharedSkills, pluginRoot) {
  const parts = [];

  // 1. Agent role context
  parts.push('<system-reminder>');
  parts.push(`[MyPlugin] Active Agent: **${agent.name}** (activated at ${agent.activatedAt})`);
  parts.push('');

  // 2. Injected skills
  const allMatched = [...agentSkills, ...sharedSkills];
  if (allMatched.length > 0) {
    parts.push('## Matched Skills');
    for (const skill of allMatched) {
      parts.push(`### ${skill.name} (match: ${skill.matchCount} keywords)`);
      parts.push('');
      if (skill._content) {
        parts.push(skill._content);
        parts.push('');
      }
      if (skill._resources && skill._resources.length > 0) {
        parts.push('#### 资源文件');
        for (const res of skill._resources) {
          parts.push(`**${res.path}**:`);
          parts.push('```' + (res.path.endsWith('.py') ? 'python' : res.path.endsWith('.ts') || res.path.endsWith('.tsx') ? 'typescript' : '') + '\n' + res.content + '\n```');
          parts.push('');
        }
      }
    }
  } else {
    parts.push('(No specific skills matched for this task. Using agent role only.)');
    parts.push('');
  }

  parts.push('---');
  parts.push(`Use MCP tools prefixed with \`mcp__${PLUGIN_NAME}__\` when needed.`);
  parts.push('</system-reminder>');

  return parts.join('\n');
}

/**
 * Main hook handler - called on every UserPromptSubmit event
 */
async function handleUserPromptSubmit(event) {
  const pluginRoot = getPluginRoot();

  // 1. Check active agent
  const agent = getActiveAgent();
  if (!agent) {
    // No active agent - do not inject any plugin skills
    return { continue: true };
  }

  const userInput = event.prompt || '';

  // 2. Load agent-specific skill index
  const agentSkillsDir = path.join(pluginRoot, 'skills', agent.name);
  const agentIndexPath = path.join(agentSkillsDir, 'index.json');
  let agentSkills = [];

  if (fs.existsSync(agentIndexPath)) {
    try {
      const agentIndex = JSON.parse(fs.readFileSync(agentIndexPath, 'utf-8'));
      const matched = matchKeywords(userInput, agentIndex);
      for (const skill of matched) {
        skill._content = readSkillFile(agentSkillsDir, skill);
        skill._resources = [];
        for (const resPath of (skill.resources || [])) {
          const res = readResourceFile(agentSkillsDir, resPath);
          if (res) skill._resources.push(res);
        }
      }
      agentSkills = matched;
    } catch (err) {
      console.error('[myplugin] Error processing agent skills:', err.message);
    }
  }

  // 3. Load shared skill index
  const sharedSkillsDir = path.join(pluginRoot, 'skills', 'shared');
  const sharedIndexPath = path.join(sharedSkillsDir, 'index.json');
  let sharedSkills = [];

  if (fs.existsSync(sharedIndexPath)) {
    try {
      const sharedIndex = JSON.parse(fs.readFileSync(sharedIndexPath, 'utf-8'));
      const matched = matchKeywords(userInput, sharedIndex);
      for (const skill of matched) {
        skill._content = readSkillFile(sharedSkillsDir, skill);
        skill._resources = [];
        for (const resPath of (skill.resources || [])) {
          const res = readResourceFile(sharedSkillsDir, resPath);
          if (res) skill._resources.push(res);
        }
      }
      sharedSkills = matched;
    } catch (err) {
      console.error('[myplugin] Error processing shared skills:', err.message);
    }
  }

  // 4. Build and inject context
  const injection = buildContextInjection(agent, agentSkills, sharedSkills, pluginRoot);

  return {
    continue: true,
    systemMessage: injection,
  };
}

// Hook entry point
module.exports = handleUserPromptSubmit;
