# API Generate 工作流

## 输入要求
- 数据模型名称（如 User, Order）
- 需要的接口类型（CRUD 全量 / 仅查询 / 自定义）

## 执行步骤

### 1. 数据模型确认
- 调用 `mcp__myplugin__db_query` 查询现有数据模型
- 如为新模型，根据用户描述推断字段结构
- 向用户确认字段定义

### 2. 模板选择
- 调用 `mcp__myplugin__tpl_render` 获取 REST API 模板
- 根据接口类型选择模板变体（全量 CRUD / 只读 / 自定义）

### 3. 代码生成
- 基于 resources/rest-api.ts 模板生成路由和控制器
- 基于 resources/crud-template.ts 生成 CRUD 服务层
- 自动生成请求/响应类型定义
- 自动生成参数校验逻辑

### 4. 部署检查
- 调用 `mcp__myplugin__deploy_check` 确认目标环境
- 生成对应的环境配置文件

## 输出
- 完整的 REST API 代码文件
- 类型定义文件
- 参数校验逻辑
- 环境配置
