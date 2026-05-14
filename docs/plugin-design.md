# Claude Code 插件系统设计方案

## 概述

开发一个 Claude Code 插件，支持安装自定义 Agent、按需加载技能包、自动配置 MCP 服务，通过私有 Git Marketplace 在企业内网分发。

---

## 一、整体架构

采用 Claude Code 标准 Marketplace 插件架构，通过私有 Git 仓库分发。

```
                              ┌──────────────────────────┐
                              │  内网 GitLab / Gitea       │
                              │  (marketplace + 插件仓库)  │
                              └────────────┬─────────────┘
                                           │
                              /plugin marketplace add
                              /plugin install myplugin@mycompany
                                           │
                                           ▼
┌──────────────────────────────────────────────────────────────────┐
│  ~/.claude/plugins/cache/mycompany/myplugin/<version>/           │
│                                                                   │
│  ├── .claude-plugin/                                              │
│  │   └── plugin.json              # 插件清单                     │
│  ├── agents/                       # 自定义 Agent 定义            │
│  │   ├── low-code.md                                              │
│  │   ├── high-code.md                                             │
│  │   └── data-analyzer.md                                         │
│  ├── skills/                       # 技能包                       │
│  │   ├── xa/                       # /xa 主命令入口              │
│  │   │   └── SKILL.md                                             │
│  │   ├── xa-low-code/              # /xa:low-code 子命令         │
│  │   │   └── SKILL.md                                             │
│  │   ├── xa-high-code/             # /xa:high-code 子命令        │
│  │   │   └── SKILL.md                                             │
│  │   ├── xa-data-analyzer/         # /xa:data-analyzer 子命令    │
│  │   │   └── SKILL.md                                             │
│  │   ├── shared/                   # 共享技能（所有 Agent）       │
│  │   │   ├── SKILL.md                                             │
│  │   │   ├── index.json            # 技能索引                    │
│  │   │   ├── workflows/                                           │
│  │   │   └── resources/                                           │
│  │   ├── low-code/                 # low-code Agent 专属技能      │
│  │   │   ├── SKILL.md                                             │
│  │   │   ├── index.json                                            │
│  │   │   ├── workflows/                                           │
│  │   │   └── resources/           # 模板等资源文件                │
│  │   ├── high-code/                # high-code Agent 专属技能      │
│  │   │   ├── SKILL.md                                             │
│  │   │   ├── index.json                                            │
│  │   │   ├── workflows/                                           │
│  │   │   └── resources/                                           │
│  │   └── data-analyzer/            # data-analyzer Agent 专属技能  │
│  │       ├── SKILL.md                                             │
│  │       ├── index.json                                            │
│  │       ├── workflows/                                           │
│  │       └── resources/                                           │
│  ├── hooks/                        # 生命周期钩子                 │
│  │   ├── hooks.json                                               │
│  │   └── user-prompt-submit.js     # 按需技能加载                 │
│  ├── mcp-server/                   # MCP 服务实现                 │
│  │   ├── package.json                                             │
│  │   └── server.js                                                │
│  ├── .mcp.json                     # MCP 服务声明                 │
│  ├── CLAUDE.md                     # 插件级上下文                 │
│  └── CHANGELOG.md                  # 版本变更                     │
└──────────────────────────────────────────────────────────────────┘
```

---

## 二、插件清单 (plugin.json)

```json
{
  "name": "myplugin",
  "version": "1.0.0",
  "description": "自定义 Agent 与技能包插件",
  "skills": "./skills/",
  "mcpServers": "./.mcp.json",
  "hooks": "./hooks/hooks.json"
}
```

---

## 三、Agent 定义

每个 Agent 是一个 `.md` 文件，定义角色、职责、可用 MCP 工具和技能范围。以 `low-code.md` 为例：

```markdown
# Low-Code Agent

## 角色
你是低代码开发专家，擅长可视化搭建、模板驱动生成、配置式开发。

## 可用 MCP 工具
| 工具 | 用途 |
|------|------|
| mcp__myplugin__tpl_render | 渲染低代码模板 |
| mcp__myplugin__db_query | 查询数据模型 |

## 技能包
- 专属技能: skills/low-code/
- 公共技能: skills/shared/

## 原则
- 优先使用模板生成，减少手写代码
- 涉及数据操作先查询现有模型
```

---

## 四、Agent 切换机制

### 4.1 命令设计

通过 Claude Code 原生斜杠命令自动补全实现切换。输入 `/xa` 时会自动提示所有匹配选项：

```
/xa                    # 显示帮助，列出所有 Agent
/xa:low-code           # 切换到 Low-Code Agent
/xa:high-code          # 切换到 High-Code Agent
/xa:data-analyzer      # 切换到 Data Analyzer Agent
```

### 4.2 Skill 注册

每个命令对应一个 skill 目录，通过 YAML frontmatter 注册 trigger：

```yaml
# skills/xa-low-code/SKILL.md
---
name: xa-low-code
description: 切换到 Low-Code 开发 Agent
triggers:
  - "/xa:low-code"
---
```

输入 `/xa` 时 Claude Code 自动匹配所有 `/xa*` 开头的 trigger 并以下拉选项展示。

### 4.3 切换流程

```
用户输入 /xa:low-code
        │
        ▼
Claude Code 匹配 trigger → 加载 xa-low-code/SKILL.md
        │
        ▼
SKILL.md 执行:
  1. 写 active-agent.json → {"name": "low-code", "activatedAt": "..."}
  2. 加载 agents/low-code.md 角色上下文
  3. 提示用户: "已切换到 Low-Code Agent"
        │
        ▼
后续用户任务 → Hook 读取 active-agent.json → 按需匹配技能
```

### 4.4 状态持久化

```
~/.claude/plugins/data/myplugin/
└── active-agent.json    # {"name": "low-code", "activatedAt": "2026-05-14T10:00:00Z"}
```

无 Agent 激活时，文件不存在或 `name` 为空，插件技能全部不可用。

---

## 五、技能按需加载

### 5.1 目录结构

```
skills/<agent-name>/
├── SKILL.md                       # Agent 激活时加载的角色+规则
├── index.json                     # 技能索引（Hook 用来匹配）
├── workflows/                     # 子技能定义
│   ├── api-generate.md
│   └── db-migration.md
└── resources/                     # 资源文件（模板、配置等）
    ├── rest-api.ts
    └── migration.sql
```

### 5.2 技能索引 (index.json)

```json
[
  {
    "name": "api-generate",
    "keywords": ["生成", "API", "接口", "REST", "create", "generate"],
    "file": "workflows/api-generate.md",
    "resources": ["resources/rest-api.ts"]
  },
  {
    "name": "db-migration",
    "keywords": ["迁移", "数据库", "migration", "schema"],
    "file": "workflows/db-migration.md",
    "resources": ["resources/migration.sql"]
  }
]
```

### 5.3 Hook 匹配流程 (user-prompt-submit.js)

```
用户输入 "帮我生成一个用户管理的 REST API"
        │
        ▼
1. 读取 active-agent.json → "low-code"
2. 如果无激活 Agent → 跳过（不注入任何技能）
        │
        ▼
3. 对 skills/low-code/index.json 做关键词匹配
   用户输入分词: ["生成", "用户管理", "REST", "API"]
   → 匹配 api-generate (命中 "生成", "API", "REST")
        │
        ▼
4. 对 skills/shared/index.json 做关键词匹配
   → 匹配 common-util (如有命中)
        │
        ▼
5. 读取匹配到的技能文件 + 资源文件
   - skills/low-code/workflows/api-generate.md
   - skills/low-code/resources/rest-api.ts
        │
        ▼
6. 注入到 context (system reminder)
```

### 5.4 设计要点

- **切换 Agent 时只加载角色定义**（~200-500 tokens），不加载技能
- **用户发起任务时才按关键词匹配**，只注入命中的 1-2 个子技能
- **未命中任何技能时**，只保留 Agent 角色，Claude 自行处理
- **资源文件按需读取**，不预加载模板/配置到上下文

---

## 六、MCP 服务

### 6.1 声明 (.mcp.json)

```json
{
  "mcpServers": {
    "myplugin": {
      "command": "node",
      "args": ["${CLAUDE_PLUGIN_ROOT}/mcp-server/server.js"]
    }
  }
}
```

`${CLAUDE_PLUGIN_ROOT}` 由 Claude Code 运行时自动解析为插件安装目录。

### 6.2 服务结构

```
mcp-server/
├── package.json         # 依赖: @modelcontextprotocol/sdk
├── server.js            # stdio MCP 服务入口
└── tools/
    ├── database.js      # 数据库操作工具
    ├── devops.js        # 运维相关工具
    └── template.js      # 模板渲染工具
```

### 6.3 自动注册流程

```
/plugin install myplugin@mycompany
        │
        ▼
Claude Code 读取 plugin.json → "mcpServers": "./.mcp.json"
        │
        ▼
读取 .mcp.json → 解析 ${CLAUDE_PLUGIN_ROOT}
        │
        ▼
cd mcp-server/ && npm install   # 安装 MCP 依赖
        │
        ▼
注册 MCP Server → 启动 stdio 进程
        │
        ▼
Agent 和 Skill 中通过 mcp__myplugin__<tool_name> 调用
```

---

## 七、版本管理与分发

### 7.1 版本管理

- 语义化版本号 (Semver): `MAJOR.MINOR.PATCH`
- Git tags 标记版本: `git tag v1.0.0`
- `CHANGELOG.md` 记录每个版本的变更
- `plugin.json` 中 `version` 字段与 Git tag 保持一致

### 7.2 私有 Marketplace 搭建

**Marketplace 清单仓库结构：**

```
# git.internal.com/ai-team/claude-plugins.git
claude-plugins/
├── marketplace.json              # marketplace 元数据
│   {
│     "name": "mycompany",
│     "displayName": "Internal AI Plugins",
│     "plugins": {
│       "myplugin": {
│         "source": "git",
│         "url": "git@git.internal.com:ai-team/myplugin.git",
│         "description": "自定义 Agent 与技能包"
│       }
│     }
│   }
└── plugins/
    └── myplugin/                 # 插件源码（可独立仓库）
```

### 7.3 用户安装命令

```bash
# 1. 注册私有 marketplace（一次性）
claude plugin marketplace add \
  --name mycompany \
  --source git \
  --url git@git.internal.com:ai-team/claude-plugins.git

# 2. 安装插件
claude plugin install myplugin@mycompany

# 3. 更新到最新版本
claude plugin update myplugin@mycompany

# 4. 查看已安装版本
claude plugin list
```

---

## 八、核心文件清单

| 文件 | 职责 |
|------|------|
| `.claude-plugin/plugin.json` | 插件元数据、版本号、skills/mcp/hooks 路径 |
| `agents/*.md` | Agent 角色定义（轻量，~200-500 tokens） |
| `skills/xa/SKILL.md` | `/xa` 主命令，列出可用 Agent |
| `skills/xa-<name>/SKILL.md` | 各 Agent 的切换命令，更新 active-agent.json |
| `skills/<name>/SKILL.md` | Agent 激活时加载的角色规则 |
| `skills/<name>/index.json` | 技能关键词索引，供 hook 匹配 |
| `skills/<name>/workflows/*.md` | 具体子技能定义 |
| `skills/<name>/resources/*` | 模板、配置等资源文件 |
| `skills/shared/` | 所有 Agent 共用的公共技能 |
| `hooks/hooks.json` | 注册 UserPromptSubmit 钩子 |
| `hooks/user-prompt-submit.js` | 按需技能匹配 + 上下文注入逻辑 |
| `.mcp.json` | MCP 服务声明（命令、参数） |
| `mcp-server/server.js` | MCP 服务实现（stdio 协议） |
| `CLAUDE.md` | 插件级指令，SessionStart 时加载 |
| `CHANGELOG.md` | 版本变更日志 |

---

## 九、用户使用流程

```
1. 注册 marketplace（一次性）
   claude plugin marketplace add --name mycompany --source git --url <内网地址>

2. 安装插件
   claude plugin install myplugin@mycompany

3. 激活 Agent
   输入 /xa → 看到选项 → 选择 /xa:low-code

4. 执行任务
   "帮我生成一个用户管理 REST API"
   → Hook 匹配到 api-generate 技能
   → 注入模板 + 工作流
   → MCP 渲染模板、查询数据模型
   → 输出代码

5. 切换 Agent
   输入 /xa:high-code → 切换上下文

6. 更新插件
   claude plugin update myplugin@mycompany
```

---

## 十、待定事项

以下细节需在实现阶段确定：

1. **关键词匹配算法**：简单分词 + 字符串包含，还是用更精确的 TF-IDF / 向量匹配
2. **匹配多个技能时的处理**：全部注入 vs 只注入最佳匹配的前 N 个
3. **技能缓存策略**：同一会话内是否缓存已读取的技能
4. **MCP 工具具体实现**：根据实际业务领域开发 `mcp-server/tools/` 下的工具
