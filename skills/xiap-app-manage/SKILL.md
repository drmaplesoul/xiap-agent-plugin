---
name: xiap-app-manage
description: 切换到 XIAP App 管理 Agent
triggers:
  - "/xa:app"
---

# 切换到 XIAP App 管理 Agent

## 执行步骤

1. 确保数据目录存在: 创建 `~/.claude/plugins/data/myplugin/` 目录（如不存在）
2. 写入 active-agent.json:
   ```json
   {"name": "xiap-app-manage", "activatedAt": "<当前 ISO 时间戳>"}
   ```
3. 读取 `agents/xiap-app-manage.md` 获取 Agent 角色定义
4. 告知用户: "已切换到 XIAP App 管理 Agent。我擅长应用全生命周期管理，包括配置、部署、监控和运维。提出你的需求，我会自动匹配相关技能。"

## 后续行为

用户发起任务后，系统 Hook 会:
- 读取 active-agent.json 确认当前 Agent
- 扫描 skills/xiap-app-manage/index.json 按关键词匹配合适的子技能
- 扫描 skills/shared/index.json 匹配公共技能
- 按需注入匹配到的技能 + 资源文件
- 通过 MCP 工具辅助完成任务
