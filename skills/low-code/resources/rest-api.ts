// REST API 模板 - 用于生成标准 CRUD 接口
import { Router } from 'express';
import { validate } from '../middleware/validate';
import { createSchema, updateSchema, querySchema } from './schemas/{{modelName}}';

const router = Router();
const service = new {{ModelName}}Service();

// GET /api/{{modelName}}s - 列表查询
router.get('/', validate(querySchema), async (req, res) => {
  const result = await service.list(req.query);
  res.json({ code: 0, data: result });
});

// GET /api/{{modelName}}s/:id - 详情查询
router.get('/:id', async (req, res) => {
  const result = await service.getById(req.params.id);
  res.json({ code: 0, data: result });
});

// POST /api/{{modelName}}s - 创建
router.post('/', validate(createSchema), async (req, res) => {
  const result = await service.create(req.body);
  res.json({ code: 0, data: result });
});

// PUT /api/{{modelName}}s/:id - 更新
router.put('/:id', validate(updateSchema), async (req, res) => {
  const result = await service.update(req.params.id, req.body);
  res.json({ code: 0, data: result });
});

// DELETE /api/{{modelName}}s/:id - 删除
router.delete('/:id', async (req, res) => {
  await service.delete(req.params.id);
  res.json({ code: 0, message: 'deleted' });
});

export default router;
