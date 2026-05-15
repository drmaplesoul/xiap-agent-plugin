# XIAP Agent Plugin 用户手册

## 1. 概述

XIAP Agent Plugin 是一个 Claude Code 插件，提供**多 Agent 切换**、**按需技能加载**和**领域专用 MCP 服务**。安装后，用户可在三种专业 Agent 之间切换，共享和专属技能包按任务自动匹配加载。

**版本**：v1.0.0
**作者**：drmaplesoul
**仓库**：https://github.com/drmaplesoul/xiap-agent-plugin

---

## 2. 快速开始

### 2.1 安装插件

```bash
# 步骤1 - 注册私有 Marketplace（仅需执行一次）
claude plugin marketplace add git@github.com:drmaplesoul/xiap-agent-plugin.git

# 步骤2 - 安装插件
claude plugin install xiap-agent-plugin@xiap
```

### 2.2 激活 Agent

输入 `/xa`，Claude Code 会自动列出所有可用 Agent：

```
/xa                  # 显示所有可用 Agent 及说明
/xa:low-code         # 切换到 Low-Code 低代码开发专家
/xa:high-code        # 切换到 High-Code 高代码架构专家
/xa:data-analyzer    # 切换到 Data Analyzer 数据分析专家
```

选择后系统提示切换成功，后续任务即自动匹配对应技能包。

### 2.3 开始工作

激活 Agent 后，直接描述任务需求即可。系统自动识别任务类型，匹配并注入对应技能和资源文件。

```
示例（激活 Low-Code Agent 后）：
用户: "帮我生成一个用户管理的 REST API 接口"
系统: 自动匹配 api-generate 技能 → 注入 REST API 模板 → 生成代码
```

### 2.4 更新插件

```bash
claude plugin update xiap-agent-plugin@xiap
```

---

## 3. Agent 详解

### 3.1 Low-Code Agent（低代码开发专家）

**角色定位**：擅长可视化搭建、模板驱动生成、配置式开发。优先使用模板和配置减少手写工作量。

**可用 MCP 工具**：

| 工具 | 用途 |
|------|------|
| `mcp__myplugin__tpl_render` | 渲染低代码模板 |
| `mcp__myplugin__db_query` | 查询数据模型 |
| `mcp__myplugin__deploy_check` | 检查部署状态 |

**专属技能**：

| 技能 | 触发场景 | 关键资源 |
|------|---------|---------|
| api-generate | 生成 REST API 接口、CRUD | rest-api.ts, crud-template.ts |
| page-scaffold | 生成管理后台页面、列表、表单 | list-page.tsx, form-page.tsx |
| db-migration | 数据库迁移、表结构变更 | migration.sql |
| comp-build | 封装业务组件、表格、图表 | data-table.tsx, chart-wrapper.tsx |

**工作原则**：
- 优先使用模板生成，减少手写代码
- 涉及数据操作先查询现有数据模型
- 生成代码前确认部署环境兼容性
- 输出完整配置文件

### 3.2 High-Code Agent（高代码架构专家）

**角色定位**：擅长复杂系统设计、高性能优化、算法实现、架构重构。注重代码质量、可维护性和系统性能。

**可用 MCP 工具**：

| 工具 | 用途 |
|------|------|
| `mcp__myplugin__code_analyze` | 代码静态分析 |
| `mcp__myplugin__perf_profile` | 性能分析 |
| `mcp__myplugin__deploy_check` | 检查部署状态 |

**专属技能**：

| 技能 | 触发场景 | 关键资源 |
|------|---------|---------|
| arch-design | 系统架构设计、技术选型 | clean-arch.ts, design-patterns.ts |
| perf-optimize | 性能优化、瓶颈分析 | perf-toolkit.ts |
| code-review | 代码审查、重构 | — |
| api-design | API 设计规范制定 | api-conventions.md |

**工作原则**：
- 遵循 SOLID 原则和设计模式
- 优先考虑性能和可扩展性
- 编写完整的单元测试
- 架构变更需提供迁移方案

### 3.3 Data Analyzer Agent（数据分析专家）

**角色定位**：擅长数据处理、统计分析、可视化、ETL 管道设计。使用 Python 生态工具链。

**可用 MCP 工具**：

| 工具 | 用途 |
|------|------|
| `mcp__myplugin__db_query` | 查询数据库 |
| `mcp__myplugin__data_export` | 导出数据 |
| `mcp__myplugin__chart_render` | 渲染图表 |

**专属技能**：

| 技能 | 触发场景 | 关键资源 |
|------|---------|---------|
| data-pipeline | ETL 管道、数据同步、导入导出 | pipeline.py |
| stat-analysis | 统计分析、回归、聚类 | stats-utils.py |
| dashboard | 报表、看板、可视化 | chart-template.py |
| data-quality | 数据质量检测、清洗 | quality-check.py |

**工作原则**：
- 先理解数据结构和业务含义再分析
- 优先使用向量化操作
- 输出附带可视化图表
- 大数据集使用分块处理

---

## 4. 共享技能

所有 Agent 均可用，系统根据任务关键词自动匹配：

| 技能 | 触发场景 |
|------|---------|
| common-util | 通用开发工具、格式化、日志、错误处理 |
| git-workflow | Git 工作流辅助、提交、分支管理、PR |
| env-config | 环境配置管理、部署配置 |

---

## 5. MCP 工具参考

插件安装后自动注册 7 个 MCP 工具和 2 个资源。Agent 和技能通过 `mcp__myplugin__<tool_name>` 调用。

### 5.1 工具列表

| 工具 | 参数 | 说明 |
|------|------|------|
| `tpl_render` | `template`(必填), `params`(可选) | 渲染代码模板，支持 rest-api, crud-page, list-page, form-page |
| `db_query` | `query`(必填), `type`(sql/nosql) | 执行数据库查询 |
| `deploy_check` | `environment`(dev/staging/prod) | 检查部署环境状态 |
| `code_analyze` | `file`(必填), `language`(可选) | 代码静态分析 |
| `perf_profile` | `target`(必填), `duration`(可选) | 性能分析，默认采样 30s |
| `data_export` | `source`(必填), `format`(csv/json/xlsx), `destination`(可选) | 数据导出 |
| `chart_render` | `type`(必填), `data`(必填), `title`(可选) | 图表渲染，支持 bar/line/pie/scatter/heatmap |

### 5.2 资源列表

| URI | 说明 |
|-----|------|
| `schema://api/v2` | REST API OpenAPI Schema 定义 |
| `config://deploy/prod` | 生产环境部署配置 |

### 5.3 Agent 工具分配

| 工具 | Low-Code | High-Code | Data Analyzer |
|------|:---:|:---:|:---:|
| `tpl_render` | ✓ |   |   |
| `db_query` | ✓ |   | ✓ |
| `deploy_check` | ✓ | ✓ |   |
| `code_analyze` |   | ✓ |   |
| `perf_profile` |   | ✓ |   |
| `data_export` |   |   | ✓ |
| `chart_render` |   |   | ✓ |

---

## 6. 技能加载原理

### 6.1 架构

```
用户输入 → Hook 拦截 → 读取当前 Agent → 关键词匹配 → 注入技能+资源 → Claude 执行
```

### 6.2 关键词匹配

- **中文分词**：二元分词 + 全段匹配（如「数据分析」生成 token: 数据、据分、分析、数据分析）
- **英文分词**：提取单词并归一化为小写
- **匹配规则**：token 包含关键词 OR 关键词包含 token
- **结果排序**：按命中次数降序，取前 2 个技能
- **共享技能**：同时匹配 shared/index.json，同样取前 2 个

### 6.3 注入格式

匹配到的技能以 `<system-reminder>` 块注入到会话上下文，包含：
- 当前激活 Agent 信息
- 匹配到的技能工作流内容（workflows/*.md）
- 关联的资源文件内容（resources/*）

### 6.4 未激活状态

无 Agent 激活时，Hook 跳过注入，插件技能全部不可用。通过 `/xa:<name>` 激活一个 Agent 即可恢复正常。

---

## 7. 项目结构

```
xiap-agent-plugin/
├── .claude-plugin/
│   ├── plugin.json               # 插件清单
│   └── marketplace.json          # Marketplace 注册清单
├── .mcp.json                     # MCP 服务声明
├── agents/                       # Agent 角色定义
│   ├── low-code.md
│   ├── high-code.md
│   └── data-analyzer.md
├── skills/                       # 技能包
│   ├── xa/                       # /xa 主命令
│   ├── xa-low-code/              # /xa:low-code
│   ├── xa-high-code/             # /xa:high-code
│   ├── xa-data-analyzer/         # /xa:data-analyzer
│   ├── shared/                   # 共享技能
│   ├── low-code/                 # Low-Code 专属技能
│   ├── high-code/                # High-Code 专属技能
│   └── data-analyzer/            # Data Analyzer 专属技能
├── hooks/
│   ├── hooks.json                # Hook 注册
│   └── user-prompt-submit.js     # 按需加载实现（241 行）
├── mcp-server/
│   ├── package.json
│   └── server.js                 # MCP 服务实现（328 行）
├── docs/
│   ├── plugin-design.md          # 架构设计文档
│   └── user-manual.md            # 用户手册（本文件）
├── CLAUDE.md                     # 插件级上下文
├── README.md                     # 安装说明
└── CHANGELOG.md                  # 版本变更
```

---

## 8. 扩展开发

### 8.1 添加新 Agent

1. 创建 `agents/<new-agent>.md` — 定义角色、MCP 工具列表、工作原则
2. 创建 `skills/xa-<new-agent>/SKILL.md` — 切换命令，YAML frontmatter 注册 trigger
3. 创建 `skills/<new-agent>/` — 技能包目录，包含 SKILL.md、index.json、workflows/、resources/
4. 更新 `skills/xa/SKILL.md` — 在 Agent 列表中添加新条目

### 8.2 添加新技能

1. 在 `skills/<agent>/workflows/` 下创建新的工作流 .md 文件
2. 在 `skills/<agent>/index.json` 中添加条目，指定 name、keywords、file和 resources
3. 按需在 `skills/<agent>/resources/` 下添加模板或配置资源

### 8.3 添加 MCP 工具

1. 在 `mcp-server/server.js` 的 `TOOLS` 对象中添加新工具定义（description, handler, inputSchema）
2. 在对应 Agent 的 `agents/<agent>.md` 中声明该工具可用
3. 在对应的工作流 .md 中说明何时调用该工具

### 8.4 实现真实的 MCP 工具

当前 MCP 工具为模拟实现。要替换为真实实现：
1. 在 `mcp-server/` 下创建 `tools/` 目录，按功能拆分模块（database.js、devops.js、template.js 等）
2. 在 `server.js` 中引入真实实现替换 mock handler
3. 更新 `package.json` 添加真实依赖（如数据库驱动、API 客户端）

---

## 9. FAQ

**Q: 输入 `/xa` 没有反应？**
A: 请确认插件已正确安装（`claude plugin list` 查看）。如未安装，先执行 `claude plugin install xiap-agent-plugin@xiap`。

**Q: 激活 Agent 后技能没有自动加载？**
A: 检查 `~/.claude/plugins/data/myplugin/active-agent.json` 是否存在且 name 字段非空。如文件缺失，重新执行 `/xa:<name>` 切换命令。

**Q: 技能匹配不准确？**
A: 当前使用简单关键词匹配，可尝试使用更明确的术语描述任务。未来版本将优化匹配算法。

**Q: 如何关闭当前 Agent？**
A: 手动删除 `~/.claude/plugins/data/myplugin/active-agent.json` 或在 Claude Code 中重启会话。

**Q: MCP 工具返回结果不正确？**
A: 当前 MCP 工具为模拟实现，返回示例数据。实际业务逻辑需在 `mcp-server/server.js` 中替换。

**Q: 更新失败？**
A: 确认网络可达 GitHub、SSH Key 已配置。如果 marketplace 缓存损坏，可尝试删除 `~/.claude/plugins/marketplaces/` 下对应目录后重新注册。

---

## 10. 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| v1.0.0 | 2026-05-15 | 初始发布：3 个 Agent、4 组技能包、7 个 MCP 工具、Hook 按需加载 |

---

## 11. 实现状态

| 组件 | 状态 | 说明 |
|------|:----:|------|
| Agent 切换 (/xa) | ✅ 完成 | 4 个斜杠命令，原生自动补全 |
| Hook 按需加载 | ✅ 完成 | 中英文关键词匹配 + 上下文注入 |
| MCP 服务框架 | ✅ 完成 | 7 个工具 + 2 个资源，stdio 协议 |
| Low-Code 技能 | ⚠️ 2/4 实现 | api-generate、page-scaffold 完成；db-migration、comp-build 占位 |
| High-Code 技能 | ⚠️ 1/4 实现 | arch-design 完成；其余占位 |
| Data Analyzer 技能 | ⚠️ 1/4 实现 | data-pipeline 完成；其余占位 |
| 共享技能 | ⚠️ 1/3 实现 | common-util 完成；其余占位 |
| MCP 真实工具 | ❌ 全部模拟 | 需替换为真实业务逻辑 |
| 测试 | ❌ 无 | 待添加 |
