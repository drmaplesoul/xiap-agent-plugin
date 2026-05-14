// CRUD Service 模板
export class {{ModelName}}Service {
  async list(query: any): Promise<PaginatedResult<{{ModelName}}>> {
    const { page = 1, pageSize = 20, ...filters } = query;
    const [items, total] = await Promise.all([
      {{ModelName}}.find(filters).skip((page - 1) * pageSize).limit(pageSize),
      {{ModelName}}.countDocuments(filters),
    ]);
    return { items, total, page, pageSize };
  }

  async getById(id: string): Promise<{{ModelName}} | null> {
    return {{ModelName}}.findById(id);
  }

  async create(data: Create{{ModelName}}Dto): Promise<{{ModelName}}> {
    return {{ModelName}}.create(data);
  }

  async update(id: string, data: Update{{ModelName}}Dto): Promise<{{ModelName}} | null> {
    return {{ModelName}}.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string): Promise<void> {
    await {{ModelName}}.findByIdAndDelete(id);
  }
}
