# XIAP Agent Plugin - 自定义 Agent 与技能包插件

## 概述
本插件提供多 Agent 切换、按需技能加载和领域专用 MCP 服务。

## Agent 切换
输入 `/xa` 查看可用 Agent，输入 `/xa:<agent-name>` 切换 Agent。
切换后，对应 Agent 的技能包和共享技能包按需可用。
未激活 Agent 时，插件技能不可用。

## 可用 Agent
- `/xa:low-code` - 低代码开发专家
- `/xa:high-code` - 高代码架构专家
- `/xa:data-analyzer` - 数据分析专家

## MCP 服务
安装插件后自动配置 MCP 服务，Agent 可通过 `mcp__myplugin__<tool_name>` 调用。

## 版本
当前版本: 1.0.0
