---
name: low-code-skills
description: Low-Code Agent 专属技能包 - 模板驱动代码生成
---

# Low-Code 技能包

## 可用技能
技能由系统 Hook 根据用户任务关键词自动匹配加载，无需手动选择。

## 技能列表
| 技能 | 触发关键词 | 描述 |
|------|-----------|------|
| api-generate | 生成, API, 接口, REST, CRUD | 基于模板生成 REST API 接口 |
| page-scaffold | 页面, 脚手架, 列表, 表单 | 生成管理后台 CRUD 页面 |
| db-migration | 迁移, 数据库, 表结构 | 生成数据库迁移脚本 |
| comp-build | 组件, 封装, 表格, 图表 | 生成可复用业务组件 |

## MCP 工具
- mcp__myplugin__tpl_render: 渲染模板
- mcp__myplugin__db_query: 查询数据模型
- mcp__myplugin__deploy_check: 检查部署环境
