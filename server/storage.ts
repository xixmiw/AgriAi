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
  users,
  fields,
  livestock,
  chatMessages,
} from "@shared/schema";
import ws from "ws";

// Configure Neon to use WebSocket polyfill
neonConfig.webSocketConstructor = ws;

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
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
}

export const storage = new DbStorage();
