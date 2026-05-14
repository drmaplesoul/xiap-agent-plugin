---
name: xa
description: 查看和切换可用的自定义 Agent
triggers:
  - "/xa"
---

# /xa - Agent 切换

你正在帮助用户切换自定义 Agent。

## 可用 Agent 列表

| 命令 | Agent | 描述 |
|------|-------|------|
| `/xa:low-code` | Low-Code Agent | 低代码开发专家，模板驱动生成 |
| `/xa:high-code` | High-Code Agent | 高代码架构专家，复杂系统设计 |
| `/xa:data-analyzer` | Data Analyzer Agent | 数据分析专家，统计与可视化 |

## 当前状态

请检查 `~/.claude/plugins/data/myplugin/active-agent.json` 获取当前激活的 Agent。
如果文件不存在或 name 为空，表示当前未激活任何 Agent，插件技能不可用。

## 操作指引

请提示用户选择一个 Agent 进行切换：
- 输入 `/xa:low-code` 切换到 Low-Code Agent
- 输入 `/xa:high-code` 切换到 High-Code Agent
- 输入 `/xa:data-analyzer` 切换到 Data Analyzer Agent
