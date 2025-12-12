import { eq } from "drizzle-orm";
import { base_tb_guidelines } from "../../schemas/base.guideline";
import { BaseModel } from "../BaseModel";

export interface GuidelineData {
  id: string;
  key: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateGuidelineParams {
  key: string;
  content: string;
}

export interface UpdateGuidelineParams {
  content?: string;
}

class GuidelineModel extends BaseModel<typeof base_tb_guidelines> {
  constructor() {
    super(base_tb_guidelines);
  }

  /**
   * Get guideline by key
   */
  async getByKey(key: string): Promise<GuidelineData | null> {
    const [guideline] = await this.db
      .select()
      .from(this.table)
      .where(eq(this.table.key, key))
      .limit(1);

    if (!guideline) {
      return null;
    }

    return {
      id: guideline.id,
      key: guideline.key,
      content: guideline.content,
      createdAt: guideline.createdAt!,
      updatedAt: guideline.updatedAt!,
    };
  }

  /**
   * Create a new guideline
   */
  async createGuideline(params: CreateGuidelineParams): Promise<GuidelineData> {
    const { key, content } = params;

    // Check if key already exists
    const existing = await this.getByKey(key);
    if (existing) {
      throw new Error(`Guideline with key "${key}" already exists`);
    }

    const now = new Date();

    const [guideline] = await this.db
      .insert(this.table)
      .values({
        key,
        content,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    if (!guideline) {
      throw new Error("Failed to create guideline");
    }

    return {
      id: guideline.id,
      key: guideline.key,
      content: guideline.content,
      createdAt: guideline.createdAt!,
      updatedAt: guideline.updatedAt!,
    };
  }

  /**
   * Update guideline by key
   */
  async updateByKey(
    key: string,
    params: UpdateGuidelineParams
  ): Promise<GuidelineData> {
    const { content } = params;

    const now = new Date();

    const [guideline] = await this.db
      .update(this.table)
      .set({
        content: content !== undefined ? content : undefined,
        updatedAt: now,
      })
      .where(eq(this.table.key, key))
      .returning();

    if (!guideline) {
      throw new Error(`Guideline with key "${key}" not found`);
    }

    return {
      id: guideline.id,
      key: guideline.key,
      content: guideline.content,
      createdAt: guideline.createdAt!,
      updatedAt: guideline.updatedAt!,
    };
  }

  /**
   * Delete guideline by key
   */
  async deleteByKey(key: string): Promise<boolean> {
    const result = await this.db
      .delete(this.table)
      .where(eq(this.table.key, key))
      .returning();

    return result.length > 0;
  }
}

export default GuidelineModel;
