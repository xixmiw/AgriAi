import { drizzle } from "drizzle-orm/neon-serverless";
import { neonConfig, Pool } from "@neondatabase/serverless";
import { eq, and } from "drizzle-orm";
import {
  type User,
  type InsertUser,
  type Field,
  type InsertField,
  type Livestock,
  type InsertLivestock,
  type ChatMessage,
  type InsertChatMessage,
  type FeedInventory,
  type InsertFeedInventory,
  type FertilizerInventory,
  type InsertFertilizerInventory,
  users,
  fields,
  livestock,
  chatMessages,
  feedInventory,
  fertilizerInventory,
} from "@shared/schema";
import ws from "ws";

// Configure Neon to use WebSocket polyfill
neonConfig.webSocketConstructor = ws;

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, userData: Partial<User>): Promise<User | undefined>;
  
  getFieldsByUserId(userId: string): Promise<Field[]>;
  getField(id: string): Promise<Field | undefined>;
  createField(field: InsertField): Promise<Field>;
  updateField(id: string, field: Partial<InsertField>): Promise<Field | undefined>;
  deleteField(id: string): Promise<boolean>;
  
  getLivestockByUserId(userId: string): Promise<Livestock[]>;
  getLivestock(id: string): Promise<Livestock | undefined>;
  createLivestock(livestock: InsertLivestock): Promise<Livestock>;
  updateLivestock(id: string, livestock: Partial<InsertLivestock>): Promise<Livestock | undefined>;
  deleteLivestock(id: string): Promise<boolean>;
  
  getChatMessagesByUserId(userId: string, limit?: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  deleteChatHistory(userId: string): Promise<boolean>;
  
  getFeedsByLivestockId(livestockId: string): Promise<FeedInventory[]>;
  getFeed(id: string): Promise<FeedInventory | undefined>;
  createFeed(feed: InsertFeedInventory): Promise<FeedInventory>;
  updateFeed(id: string, feed: Partial<InsertFeedInventory>): Promise<FeedInventory | undefined>;
  deleteFeed(id: string): Promise<boolean>;
  
  getFertilizersByFieldId(fieldId: string): Promise<FertilizerInventory[]>;
  getFertilizer(id: string): Promise<FertilizerInventory | undefined>;
  createFertilizer(fertilizer: InsertFertilizerInventory): Promise<FertilizerInventory>;
  updateFertilizer(id: string, fertilizer: Partial<InsertFertilizerInventory>): Promise<FertilizerInventory | undefined>;
  deleteFertilizer(id: string): Promise<boolean>;
}

export class DbStorage implements IStorage {
  private db;

  constructor() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    this.db = drizzle(pool);
  }

  async getUser(id: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await this.db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User | undefined> {
    const { password, ...safeData } = userData;
    const result = await this.db
      .update(users)
      .set(safeData)
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  async getFieldsByUserId(userId: string): Promise<Field[]> {
    return await this.db.select().from(fields).where(eq(fields.userId, userId));
  }

  async getField(id: string): Promise<Field | undefined> {
    const result = await this.db.select().from(fields).where(eq(fields.id, id));
    return result[0];
  }

  async createField(field: InsertField): Promise<Field> {
    const result = await this.db.insert(fields).values(field).returning();
    return result[0];
  }

  async updateField(id: string, fieldData: Partial<InsertField>): Promise<Field | undefined> {
    const result = await this.db
      .update(fields)
      .set(fieldData)
      .where(eq(fields.id, id))
      .returning();
    return result[0];
  }

  async deleteField(id: string): Promise<boolean> {
    const result = await this.db.delete(fields).where(eq(fields.id, id)).returning();
    return result.length > 0;
  }

  async getLivestockByUserId(userId: string): Promise<Livestock[]> {
    return await this.db.select().from(livestock).where(eq(livestock.userId, userId));
  }

  async getLivestock(id: string): Promise<Livestock | undefined> {
    const result = await this.db.select().from(livestock).where(eq(livestock.id, id));
    return result[0];
  }

  async createLivestock(livestockData: InsertLivestock): Promise<Livestock> {
    const result = await this.db.insert(livestock).values(livestockData).returning();
    return result[0];
  }

  async updateLivestock(id: string, livestockData: Partial<InsertLivestock>): Promise<Livestock | undefined> {
    const result = await this.db
      .update(livestock)
      .set(livestockData)
      .where(eq(livestock.id, id))
      .returning();
    return result[0];
  }

  async deleteLivestock(id: string): Promise<boolean> {
    const result = await this.db.delete(livestock).where(eq(livestock.id, id)).returning();
    return result.length > 0;
  }

  async getChatMessagesByUserId(userId: string, limit: number = 50): Promise<ChatMessage[]> {
    const result = await this.db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.userId, userId))
      .orderBy(chatMessages.createdAt)
      .limit(limit);
    return result;
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const result = await this.db.insert(chatMessages).values(message).returning();
    return result[0];
  }

  async deleteChatHistory(userId: string): Promise<boolean> {
    const result = await this.db.delete(chatMessages).where(eq(chatMessages.userId, userId)).returning();
    return result.length > 0;
  }

  async getFeedsByLivestockId(livestockId: string): Promise<FeedInventory[]> {
    return await this.db.select().from(feedInventory).where(eq(feedInventory.livestockId, livestockId));
  }

  async getFeed(id: string): Promise<FeedInventory | undefined> {
    const result = await this.db.select().from(feedInventory).where(eq(feedInventory.id, id));
    return result[0];
  }

  async createFeed(feed: InsertFeedInventory): Promise<FeedInventory> {
    const result = await this.db.insert(feedInventory).values(feed).returning();
    return result[0];
  }

  async updateFeed(id: string, feedData: Partial<InsertFeedInventory>): Promise<FeedInventory | undefined> {
    const result = await this.db
      .update(feedInventory)
      .set(feedData)
      .where(eq(feedInventory.id, id))
      .returning();
    return result[0];
  }

  async deleteFeed(id: string): Promise<boolean> {
    const result = await this.db.delete(feedInventory).where(eq(feedInventory.id, id)).returning();
    return result.length > 0;
  }

  async getFertilizersByFieldId(fieldId: string): Promise<FertilizerInventory[]> {
    return await this.db.select().from(fertilizerInventory).where(eq(fertilizerInventory.fieldId, fieldId));
  }

  async getFertilizer(id: string): Promise<FertilizerInventory | undefined> {
    const result = await this.db.select().from(fertilizerInventory).where(eq(fertilizerInventory.id, id));
    return result[0];
  }

  async createFertilizer(fertilizer: InsertFertilizerInventory): Promise<FertilizerInventory> {
    const result = await this.db.insert(fertilizerInventory).values(fertilizer).returning();
    return result[0];
  }

  async updateFertilizer(id: string, fertilizerData: Partial<InsertFertilizerInventory>): Promise<FertilizerInventory | undefined> {
    const result = await this.db
      .update(fertilizerInventory)
      .set(fertilizerData)
      .where(eq(fertilizerInventory.id, id))
      .returning();
    return result[0];
  }

  async deleteFertilizer(id: string): Promise<boolean> {
    const result = await this.db.delete(fertilizerInventory).where(eq(fertilizerInventory.id, id)).returning();
    return result.length > 0;
  }
}

export const storage = new DbStorage();
