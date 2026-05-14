# XIAP Agent Plugin

自定义 Agent 与技能包 Claude Code 插件。

## 安装

### 1. 注册 Marketplace（一次性）

```bash
claude plugin marketplace add git@github.com:drmaplesoul/xiap-agent-plugin.git
```

### 2. 安装插件

```bash
claude plugin install xiap-agent-plugin@xiap
```

### 3. 激活 Agent

输入 `/xa` 查看可用 Agent，选择切换：

```
/xa              # 显示所有可用 Agent
/xa:low-code     # 低代码开发专家
/xa:high-code    # 高代码架构专家
/xa:data-analyzer # 数据分析专家
```

### 4. 更新插件

```bash
claude plugin update xiap-agent-plugin@xiap
```

## 可用 Agent

| Agent | 职责 | 技能数 |
|-------|------|--------|
| Low-Code | 模板驱动生成、CRUD 页面、API 接口 | 4 workflows + 7 resources |
| High-Code | 架构设计、性能优化、代码审查 | 4 workflows + 4 resources |
| Data Analyzer | ETL 管道、统计分析、可视化 | 4 workflows + 4 resources |

## MCP 工具

插件安装后自动注册 MCP 服务，提供 7 个领域工具：

| 工具 | 用途 |
|------|------|
| `mcp__myplugin__tpl_render` | 模板渲染 |
| `mcp__myplugin__db_query` | 数据库查询 |
| `mcp__myplugin__deploy_check` | 部署环境检查 |
| `mcp__myplugin__code_analyze` | 代码静态分析 |
| `mcp__myplugin__perf_profile` | 性能分析 |
| `mcp__myplugin__data_export` | 数据导出 |
| `mcp__myplugin__chart_render` | 图表渲染 |

## 版本

当前版本: **v1.0.0** (2026-05-15)

更新方式:
```bash
claude plugin update xiap-agent-plugin@xiap
```
