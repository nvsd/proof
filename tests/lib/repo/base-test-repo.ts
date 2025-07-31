import { z } from 'zod';
import { eq, inArray } from 'drizzle-orm';

// Static validation schemas - created once and reused
const defaultIdSchema = z.union([
  z.number().int().positive('ID must be a positive integer'),
  z.string().min(1, 'ID must be a non-empty string'),
]);

const numberIdSchema = z.number().int().positive('ID must be a positive integer');
const stringIdSchema = z.string().min(1, 'ID must be a non-empty string');

export class BaseTestRepo<TTable, TSelect extends { id: any }, TInsert> {
  protected idSchema: any = defaultIdSchema;
  protected idsSchema: any = z.array(this.idSchema).min(1, 'At least one ID is required');

  constructor(
    protected db: any,
    protected table: TTable,
    protected selectSchema: z.ZodType<TSelect>,
    protected insertSchema: z.ZodType<TInsert> & { partial(): z.ZodType<Partial<TInsert>> },
  ) {}

  // Helper methods to set ID schemas (called once in constructor)
  protected useNumberIds() {
    this.idSchema = numberIdSchema;
    this.idsSchema = z.array(numberIdSchema).min(1, 'At least one ID is required');
  }

  protected useStringIds() {
    this.idSchema = stringIdSchema;
    this.idsSchema = z.array(stringIdSchema).min(1, 'At least one ID is required');
  }

  async create(data: TInsert): Promise<TSelect> {
    try {
      const validated = await this.insertSchema.parseAsync(data);
      const result = await this.db.insert(this.table).values(validated).returning();

      if (result.length === 0) {
        throw new Error('Failed to create entity');
      }

      return await this.selectSchema.parseAsync(result[0]);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const issues = error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join(', ');
        throw new Error(`Validation failed: ${issues}`);
      }
      throw error;
    }
  }

  async findById(id: string | number): Promise<TSelect | null> {
    const validatedId = this.idSchema.parse(id);

    const result = await this.db
      .select()
      .from(this.table)
      .where(eq((this.table as any).id, validatedId))
      .limit(1);
    if (result.length > 0) {
      return await this.selectSchema.parseAsync(result[0]);
    }
    return null;
  }

  async update(id: string | number, updateData: Partial<TInsert>): Promise<TSelect | null> {
    const validatedId = this.idSchema.parse(id);

    // Use Zod v4's partial() method for partial validation
    const partialSchema = this.insertSchema.partial();
    const validatedData = await partialSchema.parseAsync(updateData);

    const result = await this.db
      .update(this.table)
      .set(validatedData)
      .where(eq((this.table as any).id, validatedId))
      .returning();

    if (result.length === 0) {
      return null;
    }

    return await this.selectSchema.parseAsync(result[0]);
  }

  async delete(id: string | number): Promise<boolean> {
    const validatedId = this.idSchema.parse(id);

    const entity = await this.findById(validatedId);
    if (!entity) {
      return false;
    }

    await this.beforeDelete(entity);
    await this.db.delete(this.table).where(eq((this.table as any).id, validatedId));

    return true;
  }

  async deleteMany(ids: (string | number)[]): Promise<number> {
    const validatedIds = this.idsSchema.parse(ids);

    const foundEntities = await this.db
      .select()
      .from(this.table)
      .where(inArray((this.table as any).id, validatedIds));
    const validatedEntities = await Promise.all(foundEntities.map((e: any) => this.selectSchema.parseAsync(e)));

    if (validatedEntities.length === 0) {
      return 0;
    }

    await this.beforeDeleteMany(validatedEntities);
    await this.db.delete(this.table).where(inArray((this.table as any).id, validatedIds));

    return validatedEntities.length;
  }

  protected async beforeDelete(entity: TSelect): Promise<void> {
    // Override in subclasses for cascade deletes
  }

  protected async beforeDeleteMany(entities: TSelect[]): Promise<void> {
    // Override in subclasses for cascade deletes
  }
}
