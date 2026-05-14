# Page Scaffold 工作流

## 执行步骤

### 1. 需求分析
- 确认页面类型：列表页 / 表单页 / 详情页 / 混合
- 确认数据源：现有 API / 新建 API

### 2. 模板渲染
- 调用 `mcp__myplugin__tpl_render` 获取页面模板
- 列表页使用 resources/list-page.tsx 模板
- 表单页使用 resources/form-page.tsx 模板

### 3. 组件生成
- 生成表格列配置
- 生成搜索表单
- 生成新增/编辑弹窗
- 绑定 API 调用

## 输出
- 完整的 React/Vue 页面组件
- API 调用封装
- 表单校验规则
