# Data Pipeline 工作流

## 执行步骤

### 1. 数据源分析
- 调用 `mcp__myplugin__db_query` 了解数据源结构
- 确认数据量级、更新频率、数据格式

### 2. 管道设计
- 选择 ETL / ELT 策略
- 设计数据转换规则
- 基于 resources/pipeline.py 模板构建管道

### 3. 数据同步
- 实现增量/全量同步策略
- 添加错误重试和断点续传
- 调用 `mcp__myplugin__data_export` 导出结果

### 4. 验证
- 源端和目标端数据一致性校验
- 管道性能监控
