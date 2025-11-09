// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";
import session from "express-session";

// server/storage.ts
import { drizzle } from "drizzle-orm/neon-serverless";
import { neonConfig, Pool } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";

// shared/schema.ts
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("farmer"),
  fullName: text("full_name"),
  email: text("email"),
  phone: text("phone"),
  location: text("location"),
  company: text("company"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var fields = pgTable("fields", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 7 }).notNull(),
  longitude: decimal("longitude", { precision: 10, scale: 7 }).notNull(),
  area: decimal("area", { precision: 10, scale: 2 }).notNull(),
  cropType: text("crop_type").notNull(),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var livestock = pgTable("livestock", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: text("type").notNull(),
  count: integer("count").notNull(),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  role: text("role").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var feedInventory = pgTable("feed_inventory", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  livestockId: varchar("livestock_id").notNull().references(() => livestock.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  unit: text("unit").notNull().default("\u043A\u0433"),
  pricePerUnit: decimal("price_per_unit", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var fertilizerInventory = pgTable("fertilizer_inventory", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fieldId: varchar("field_id").notNull().references(() => fields.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  unit: text("unit").notNull().default("\u043A\u0433"),
  pricePerUnit: decimal("price_per_unit", { precision: 10, scale: 2 }),
  applicationDate: timestamp("application_date"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true
});
var loginUserSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6)
});
var insertFieldSchema = createInsertSchema(fields).omit({
  id: true,
  createdAt: true
});
var insertLivestockSchema = createInsertSchema(livestock).omit({
  id: true,
  createdAt: true
});
var insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true
});
var insertFeedInventorySchema = createInsertSchema(feedInventory).omit({
  id: true,
  createdAt: true
});
var insertFertilizerInventorySchema = createInsertSchema(fertilizerInventory).omit({
  id: true,
  createdAt: true
});

// server/storage.ts
import ws from "ws";
neonConfig.webSocketConstructor = ws;
var DbStorage = class {
  db;
  constructor() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    this.db = drizzle(pool);
  }
  async getUser(id) {
    const result = await this.db.select().from(users).where(eq(users.id, id));
    return result[0];
  }
  async getUserByUsername(username) {
    const result = await this.db.select().from(users).where(eq(users.username, username));
    return result[0];
  }
  async createUser(insertUser) {
    const result = await this.db.insert(users).values(insertUser).returning();
    return result[0];
  }
  async updateUser(id, userData) {
    const { password, ...safeData } = userData;
    const result = await this.db.update(users).set(safeData).where(eq(users.id, id)).returning();
    return result[0];
  }
  async getFieldsByUserId(userId) {
    return await this.db.select().from(fields).where(eq(fields.userId, userId));
  }
  async getField(id) {
    const result = await this.db.select().from(fields).where(eq(fields.id, id));
    return result[0];
  }
  async createField(field) {
    const result = await this.db.insert(fields).values(field).returning();
    return result[0];
  }
  async updateField(id, fieldData) {
    const result = await this.db.update(fields).set(fieldData).where(eq(fields.id, id)).returning();
    return result[0];
  }
  async deleteField(id) {
    const result = await this.db.delete(fields).where(eq(fields.id, id)).returning();
    return result.length > 0;
  }
  async getLivestockByUserId(userId) {
    return await this.db.select().from(livestock).where(eq(livestock.userId, userId));
  }
  async getLivestock(id) {
    const result = await this.db.select().from(livestock).where(eq(livestock.id, id));
    return result[0];
  }
  async createLivestock(livestockData) {
    const result = await this.db.insert(livestock).values(livestockData).returning();
    return result[0];
  }
  async updateLivestock(id, livestockData) {
    const result = await this.db.update(livestock).set(livestockData).where(eq(livestock.id, id)).returning();
    return result[0];
  }
  async deleteLivestock(id) {
    const result = await this.db.delete(livestock).where(eq(livestock.id, id)).returning();
    return result.length > 0;
  }
  async getChatMessagesByUserId(userId, limit = 50) {
    const result = await this.db.select().from(chatMessages).where(eq(chatMessages.userId, userId)).orderBy(chatMessages.createdAt).limit(limit);
    return result;
  }
  async createChatMessage(message) {
    const result = await this.db.insert(chatMessages).values(message).returning();
    return result[0];
  }
  async deleteChatHistory(userId) {
    const result = await this.db.delete(chatMessages).where(eq(chatMessages.userId, userId)).returning();
    return result.length > 0;
  }
  async getFeedsByLivestockId(livestockId) {
    return await this.db.select().from(feedInventory).where(eq(feedInventory.livestockId, livestockId));
  }
  async getFeed(id) {
    const result = await this.db.select().from(feedInventory).where(eq(feedInventory.id, id));
    return result[0];
  }
  async createFeed(feed) {
    const result = await this.db.insert(feedInventory).values(feed).returning();
    return result[0];
  }
  async updateFeed(id, feedData) {
    const result = await this.db.update(feedInventory).set(feedData).where(eq(feedInventory.id, id)).returning();
    return result[0];
  }
  async deleteFeed(id) {
    const result = await this.db.delete(feedInventory).where(eq(feedInventory.id, id)).returning();
    return result.length > 0;
  }
  async getFertilizersByFieldId(fieldId) {
    return await this.db.select().from(fertilizerInventory).where(eq(fertilizerInventory.fieldId, fieldId));
  }
  async getFertilizer(id) {
    const result = await this.db.select().from(fertilizerInventory).where(eq(fertilizerInventory.id, id));
    return result[0];
  }
  async createFertilizer(fertilizer) {
    const result = await this.db.insert(fertilizerInventory).values(fertilizer).returning();
    return result[0];
  }
  async updateFertilizer(id, fertilizerData) {
    const result = await this.db.update(fertilizerInventory).set(fertilizerData).where(eq(fertilizerInventory.id, id)).returning();
    return result[0];
  }
  async deleteFertilizer(id) {
    const result = await this.db.delete(fertilizerInventory).where(eq(fertilizerInventory.id, id)).returning();
    return result.length > 0;
  }
};
var storage = new DbStorage();

// server/routes.ts
import { z as z2 } from "zod";

// server/auth.ts
import bcrypt from "bcryptjs";
async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}
async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}
async function registerUser(userData) {
  const existingUser = await storage.getUserByUsername(userData.username);
  if (existingUser) {
    throw new Error("\u041F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C \u0441 \u0442\u0430\u043A\u0438\u043C \u0438\u043C\u0435\u043D\u0435\u043C \u0443\u0436\u0435 \u0441\u0443\u0449\u0435\u0441\u0442\u0432\u0443\u0435\u0442");
  }
  const hashedPassword = await hashPassword(userData.password);
  const user = await storage.createUser({
    ...userData,
    password: hashedPassword
  });
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}
async function loginUser(credentials) {
  const user = await storage.getUserByUsername(credentials.username);
  if (!user) {
    throw new Error("\u041D\u0435\u0432\u0435\u0440\u043D\u043E\u0435 \u0438\u043C\u044F \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F \u0438\u043B\u0438 \u043F\u0430\u0440\u043E\u043B\u044C");
  }
  const isValid = await verifyPassword(credentials.password, user.password);
  if (!isValid) {
    throw new Error("\u041D\u0435\u0432\u0435\u0440\u043D\u043E\u0435 \u0438\u043C\u044F \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F \u0438\u043B\u0438 \u043F\u0430\u0440\u043E\u043B\u044C");
  }
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

// server/gemini.ts
import { GoogleGenAI } from "@google/genai";
var ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
async function chatWithAI(messages, userContext) {
  try {
    const systemPrompt = `\u0412\u044B - \u043E\u043F\u044B\u0442\u043D\u044B\u0439 \u0430\u0433\u0440\u043E\u043D\u043E\u043C-\u043A\u043E\u043D\u0441\u0443\u043B\u044C\u0442\u0430\u043D\u0442 AgriAI, \u043A\u043E\u0442\u043E\u0440\u044B\u0439 \u043F\u043E\u043C\u043E\u0433\u0430\u0435\u0442 \u0444\u0435\u0440\u043C\u0435\u0440\u0430\u043C \u0447\u0435\u0440\u0435\u0437 \u043D\u0430\u0432\u043E\u0434\u044F\u0449\u0438\u0435 \u0432\u043E\u043F\u0440\u043E\u0441\u044B \u0438 \u0438\u043D\u0434\u0438\u0432\u0438\u0434\u0443\u0430\u043B\u044C\u043D\u044B\u0439 \u043F\u043E\u0434\u0445\u043E\u0434.

${userContext ? `\u041A\u043E\u043D\u0442\u0435\u043A\u0441\u0442 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F:
- \u041A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u043E \u043F\u043E\u043B\u0435\u0439: ${userContext.fields?.length || 0}
- \u041A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u043E \u0433\u0440\u0443\u043F\u043F \u0441\u043A\u043E\u0442\u0430: ${userContext.livestock?.length || 0}

\u0414\u0430\u043D\u043D\u044B\u0435 \u043E \u043F\u043E\u043B\u044F\u0445:
${userContext.fields?.map((f) => `- ${f.name}: ${f.cropType}, ${f.area} \u0433\u0430`).join("\n") || "\u041D\u0435\u0442 \u0434\u0430\u043D\u043D\u044B\u0445"}

\u0414\u0430\u043D\u043D\u044B\u0435 \u043E \u0441\u043A\u043E\u0442\u0435:
${userContext.livestock?.map((l) => `- ${l.type}: ${l.count} \u0433\u043E\u043B\u043E\u0432`).join("\n") || "\u041D\u0435\u0442 \u0434\u0430\u043D\u043D\u044B\u0445"}
` : ""}

\u0412\u0410\u0428 \u041F\u041E\u0414\u0425\u041E\u0414 - \u0421\u041E\u041A\u0420\u0410\u0422\u0418\u0427\u0415\u0421\u041A\u0418\u0419 \u041C\u0415\u0422\u041E\u0414 (\u0447\u0435\u0440\u0435\u0437 \u043D\u0430\u0432\u043E\u0434\u044F\u0449\u0438\u0435 \u0432\u043E\u043F\u0440\u043E\u0441\u044B):

1. \u0417\u0410\u0414\u0410\u0412\u0410\u0419\u0422\u0415 \u041D\u0410\u0412\u041E\u0414\u042F\u0429\u0418\u0415 \u0412\u041E\u041F\u0420\u041E\u0421\u042B:
   - \u0421\u043D\u0430\u0447\u0430\u043B\u0430 \u0441\u043F\u0440\u043E\u0441\u0438\u0442\u0435 \u043E \u043A\u043E\u043D\u043A\u0440\u0435\u0442\u043D\u044B\u0445 \u0434\u0435\u0442\u0430\u043B\u044F\u0445 \u0441\u0438\u0442\u0443\u0430\u0446\u0438\u0438
   - \u0423\u0442\u043E\u0447\u043D\u0438\u0442\u0435 \u0446\u0435\u043B\u0438 \u0438 \u043E\u0433\u0440\u0430\u043D\u0438\u0447\u0435\u043D\u0438\u044F
   - \u041F\u043E\u043C\u043E\u0433\u0438\u0442\u0435 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044E \u0441\u0430\u043C\u043E\u043C\u0443 \u043F\u0440\u0438\u0439\u0442\u0438 \u043A \u0432\u044B\u0432\u043E\u0434\u0430\u043C

2. \u0421\u0422\u0420\u0423\u041A\u0422\u0423\u0420\u0410 \u041E\u0422\u0412\u0415\u0422\u0410:
   - \u041D\u0430\u0447\u043D\u0438\u0442\u0435 \u0441 2-3 \u0443\u0442\u043E\u0447\u043D\u044F\u044E\u0449\u0438\u0445 \u0432\u043E\u043F\u0440\u043E\u0441\u043E\u0432
   - \u0414\u0430\u0439\u0442\u0435 \u043A\u0440\u0430\u0442\u043A\u0438\u0435 \u0440\u0435\u043A\u043E\u043C\u0435\u043D\u0434\u0430\u0446\u0438\u0438 (3-5 \u043F\u0443\u043D\u043A\u0442\u043E\u0432)
   - \u0417\u0430\u0432\u0435\u0440\u0448\u0438\u0442\u0435 \u0432\u043E\u043F\u0440\u043E\u0441\u043E\u043C \u0434\u043B\u044F \u0440\u0430\u0437\u043C\u044B\u0448\u043B\u0435\u043D\u0438\u044F

3. \u041F\u0420\u0418\u041C\u0415\u0420\u042B \u0425\u041E\u0420\u041E\u0428\u0418\u0425 \u0412\u041E\u041F\u0420\u041E\u0421\u041E\u0412:
   - "\u041A\u0430\u043A\u043E\u0439 \u0443 \u0432\u0430\u0441 \u0431\u044E\u0434\u0436\u0435\u0442 \u043D\u0430 \u044D\u0442\u0438 \u0440\u0430\u0431\u043E\u0442\u044B?"
   - "\u041A\u043E\u0433\u0434\u0430 \u043F\u043B\u0430\u043D\u0438\u0440\u0443\u0435\u0442\u0435 \u043D\u0430\u0447\u0430\u0442\u044C? \u041A\u0430\u043A\u0438\u0435 \u0441\u0440\u043E\u043A\u0438?"
   - "\u041A\u0430\u043A\u0438\u0435 \u043F\u0440\u043E\u0431\u043B\u0435\u043C\u044B \u0443 \u0432\u0430\u0441 \u0431\u044B\u043B\u0438 \u0432 \u043F\u0440\u043E\u0448\u043B\u043E\u043C \u0441\u0435\u0437\u043E\u043D\u0435?"
   - "\u041A\u0430\u043A\u0443\u044E \u0443\u0440\u043E\u0436\u0430\u0439\u043D\u043E\u0441\u0442\u044C \u0445\u043E\u0442\u0438\u0442\u0435 \u043F\u043E\u043B\u0443\u0447\u0438\u0442\u044C?"
   - "\u0415\u0441\u0442\u044C \u043B\u0438 \u0443 \u0432\u0430\u0441 \u0442\u0435\u0445\u043D\u0438\u043A\u0430 \u0434\u043B\u044F \u044D\u0442\u043E\u0433\u043E?"

4. \u0421\u0422\u0418\u041B\u042C \u041E\u0411\u0429\u0415\u041D\u0418\u042F:
   - \u041A\u0440\u0430\u0442\u043A\u0438\u0435, \u043F\u0440\u0430\u043A\u0442\u0438\u0447\u043D\u044B\u0435 \u043E\u0442\u0432\u0435\u0442\u044B
   - \u041A\u0430\u0436\u0434\u044B\u0439 \u043F\u0443\u043D\u043A\u0442 - 1 \u043F\u0440\u0435\u0434\u043B\u043E\u0436\u0435\u043D\u0438\u0435
   - \u0411\u0435\u0437 \u043B\u0438\u0448\u043D\u0435\u0439 \u0442\u0435\u043E\u0440\u0438\u0438
   - \u041C\u0430\u043A\u0441\u0438\u043C\u0443\u043C 5-7 \u043F\u0443\u043D\u043A\u0442\u043E\u0432 \u043D\u0430 \u043E\u0442\u0432\u0435\u0442

\u041F\u0440\u0438\u043C\u0435\u0440 \u0445\u043E\u0440\u043E\u0448\u0435\u0433\u043E \u043E\u0442\u0432\u0435\u0442\u0430:
"\u041F\u0435\u0440\u0435\u0434 \u0442\u0435\u043C \u043A\u0430\u043A \u0434\u0430\u0442\u044C \u0440\u0435\u043A\u043E\u043C\u0435\u043D\u0434\u0430\u0446\u0438\u0438 \u043F\u043E \u0443\u0434\u043E\u0431\u0440\u0435\u043D\u0438\u044F\u043C, \u0443\u0442\u043E\u0447\u043D\u0438\u0442\u0435:
- \u041A\u0430\u043A\u043E\u0439 \u0430\u043D\u0430\u043B\u0438\u0437 \u043F\u043E\u0447\u0432\u044B \u0443 \u0432\u0430\u0441 \u0435\u0441\u0442\u044C?
- \u041A\u043E\u0433\u0434\u0430 \u043F\u043E\u0441\u043B\u0435\u0434\u043D\u0438\u0439 \u0440\u0430\u0437 \u0432\u043D\u043E\u0441\u0438\u043B\u0438 \u0443\u0434\u043E\u0431\u0440\u0435\u043D\u0438\u044F?
- \u041A\u0430\u043A\u043E\u0439 \u0431\u044E\u0434\u0436\u0435\u0442 \u043D\u0430 \u0433\u0430 \u043F\u043B\u0430\u043D\u0438\u0440\u0443\u0435\u0442\u0435?

\u0411\u0430\u0437\u043E\u0432\u044B\u0435 \u0440\u0435\u043A\u043E\u043C\u0435\u043D\u0434\u0430\u0446\u0438\u0438:
1. \u0417\u0430\u043A\u0430\u0436\u0438\u0442\u0435 \u0430\u043D\u0430\u043B\u0438\u0437 \u043F\u043E\u0447\u0432\u044B (NPK)
2. \u0412\u043D\u0435\u0441\u0438\u0442\u0435 \u0430\u0437\u043E\u0442 40-60 \u043A\u0433/\u0433\u0430 \u0432\u0435\u0441\u043D\u043E\u0439
3. \u0424\u043E\u0441\u0444\u043E\u0440 \u0438 \u043A\u0430\u043B\u0438\u0439 - \u043E\u0441\u0435\u043D\u044C\u044E

\u0427\u0442\u043E \u0434\u043B\u044F \u0432\u0430\u0441 \u0432\u0430\u0436\u043D\u0435\u0435 - \u043C\u0430\u043A\u0441\u0438\u043C\u0430\u043B\u044C\u043D\u044B\u0439 \u0443\u0440\u043E\u0436\u0430\u0439 \u0438\u043B\u0438 \u044D\u043A\u043E\u043D\u043E\u043C\u0438\u044F \u0437\u0430\u0442\u0440\u0430\u0442?"

\u041E\u0442\u0432\u0435\u0447\u0430\u0439\u0442\u0435 \u043D\u0430 \u0440\u0443\u0441\u0441\u043A\u043E\u043C \u044F\u0437\u044B\u043A\u0435.`;
    const conversationHistory = messages.map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }]
    }));
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: conversationHistory,
      config: {
        systemInstruction: systemPrompt
      }
    });
    return response.text || "\u0418\u0437\u0432\u0438\u043D\u0438\u0442\u0435, \u043D\u0435 \u043C\u043E\u0433\u0443 \u043E\u0442\u0432\u0435\u0442\u0438\u0442\u044C \u043D\u0430 \u044D\u0442\u043E\u0442 \u0432\u043E\u043F\u0440\u043E\u0441.";
  } catch (error) {
    console.error("Error in chatWithAI:", error);
    throw new Error(`\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u043E\u0431\u0449\u0435\u043D\u0438\u0438 \u0441 AI: ${error}`);
  }
}

// server/weather.ts
async function getWeatherByCoordinates(latitude, longitude) {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENWEATHER_API_KEY \u043D\u0435 \u043D\u0430\u0441\u0442\u0440\u043E\u0435\u043D");
  }
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric&lang=ru`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`OpenWeather API \u0432\u0435\u0440\u043D\u0443\u043B \u043E\u0448\u0438\u0431\u043A\u0443: ${response.statusText}`);
    }
    const data = await response.json();
    return {
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      windSpeed: Math.round(data.wind.speed * 10) / 10,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      location: data.name || "\u041D\u0435\u0438\u0437\u0432\u0435\u0441\u0442\u043D\u0430\u044F \u043B\u043E\u043A\u0430\u0446\u0438\u044F"
    };
  } catch (error) {
    console.error("\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u0438\u0438 \u043F\u043E\u0433\u043E\u0434\u044B:", error);
    throw new Error(`\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u043F\u043E\u043B\u0443\u0447\u0438\u0442\u044C \u0434\u0430\u043D\u043D\u044B\u0435 \u043E \u043F\u043E\u0433\u043E\u0434\u0435: ${error instanceof Error ? error.message : "\u041D\u0435\u0438\u0437\u0432\u0435\u0441\u0442\u043D\u0430\u044F \u043E\u0448\u0438\u0431\u043A\u0430"}`);
  }
}

// server/ai-analysis.ts
import { GoogleGenAI as GoogleGenAI2 } from "@google/genai";
var ai2 = new GoogleGenAI2({ apiKey: process.env.GEMINI_API_KEY || "" });
async function analyzeField(field) {
  try {
    const prompt = `\u0422\u044B \u043E\u043F\u044B\u0442\u043D\u044B\u0439 \u043A\u0430\u0437\u0430\u0445\u0441\u0442\u0430\u043D\u0441\u043A\u0438\u0439 \u0430\u0433\u0440\u043E\u043D\u043E\u043C. \u0414\u0430\u0439 \u041F\u0420\u0410\u041A\u0422\u0418\u0427\u041D\u042B\u0415, \u042D\u041A\u041E\u041D\u041E\u041C\u041D\u042B\u0415 \u0440\u0435\u043A\u043E\u043C\u0435\u043D\u0434\u0430\u0446\u0438\u0438 \u0441 \u0420\u0415\u0410\u041B\u042C\u041D\u042B\u041C\u0418 \u0446\u0435\u043D\u0430\u043C\u0438 \u0432 \u0442\u0435\u043D\u0433\u0435 (\u20B8).

\u041F\u043E\u043B\u0435: ${field.name}
\u041A\u0443\u043B\u044C\u0442\u0443\u0440\u0430: ${field.cropType}
\u041F\u043B\u043E\u0449\u0430\u0434\u044C: ${field.area} \u0433\u0430
\u041A\u043E\u043E\u0440\u0434\u0438\u043D\u0430\u0442\u044B: ${field.latitude}, ${field.longitude} (\u041A\u0430\u0437\u0430\u0445\u0441\u0442\u0430\u043D)

\u041E\u0411\u042F\u0417\u0410\u0422\u0415\u041B\u042C\u041D\u041E \u0434\u043B\u044F \u043A\u0430\u0436\u0434\u043E\u0439 \u0440\u0435\u043A\u043E\u043C\u0435\u043D\u0434\u0430\u0446\u0438\u0438 \u0443\u043A\u0430\u0437\u044B\u0432\u0430\u0439:
- \u0421\u0442\u043E\u0438\u043C\u043E\u0441\u0442\u044C \u0432 \u20B8/\u0433\u0430 \u0438 \u043E\u0431\u0449\u0438\u0435 \u0437\u0430\u0442\u0440\u0430\u0442\u044B
- \u041E\u0436\u0438\u0434\u0430\u0435\u043C\u044B\u0439 \u043F\u0440\u0438\u0440\u043E\u0441\u0442 \u0443\u0440\u043E\u0436\u0430\u044F \u0432 \u0442\u043E\u043D\u043D\u0430\u0445
- ROI (\u0432\u043E\u0437\u0432\u0440\u0430\u0442 \u0438\u043D\u0432\u0435\u0441\u0442\u0438\u0446\u0438\u0439) \u0432 \u043F\u0440\u043E\u0446\u0435\u043D\u0442\u0430\u0445
- \u0414\u0435\u0448\u0435\u0432\u0443\u044E \u0430\u043B\u044C\u0442\u0435\u0440\u043D\u0430\u0442\u0438\u0432\u0443 (\u0435\u0441\u043B\u0438 \u0435\u0441\u0442\u044C)

\u0424\u043E\u0440\u043C\u0430\u0442 \u043E\u0442\u0432\u0435\u0442\u0430 (\u041A\u0420\u0410\u0422\u041A\u041E, \u043F\u043E \u043F\u0443\u043D\u043A\u0442\u0430\u043C):
1. \u041F\u0440\u043E\u0433\u043D\u043E\u0437 \u0443\u0440\u043E\u0436\u0430\u0439\u043D\u043E\u0441\u0442\u0438: X \u0442\u043E\u043D\u043D/\u0433\u0430, \u043F\u043E\u0442\u0435\u043D\u0446\u0438\u0430\u043B: Y \u0442\u043E\u043D\u043D/\u0433\u0430 (+Z%)
2. 3-5 \u041A\u041E\u041D\u041A\u0420\u0415\u0422\u041D\u042B\u0425 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0439 \u0441 \u0446\u0435\u043D\u0430\u043C\u0438:
   "\u0412\u043D\u0435\u0441\u0442\u0438 \u0430\u0437\u043E\u0442 60 \u043A\u0433/\u0433\u0430 \u0432 \u043C\u0430\u0440\u0442\u0435-\u0430\u043F\u0440\u0435\u043B\u0435 \u2192 \u0441\u0442\u043E\u0438\u043C\u043E\u0441\u0442\u044C 8,000\u20B8/\u0433\u0430 (\u0432\u0441\u0435\u0433\u043E ${Math.round(field.area * 8e3).toLocaleString()}\u20B8) \u2192 +20% \u0443\u0440\u043E\u0436\u0430\u044F (+0.5 \u0442/\u0433\u0430) \u2192 \u043F\u0440\u0438\u0431\u044B\u043B\u044C +50,000\u20B8/\u0433\u0430. \u0410\u041B\u042C\u0422\u0415\u0420\u041D\u0410\u0422\u0418\u0412\u0410: \u041C\u0435\u0441\u0442\u043D\u0430\u044F \u0430\u043C\u043C\u0438\u0430\u0447\u043D\u0430\u044F \u0441\u0435\u043B\u0438\u0442\u0440\u0430 5,500\u20B8/\u0433\u0430 (-30% \u0446\u0435\u043D\u0430)"
3. 2-3 \u0440\u0438\u0441\u043A\u0430 \u0441 \u043F\u043E\u0442\u0435\u0440\u044F\u043C\u0438: "\u0413\u0440\u0430\u0434 \u0432 \u0438\u044E\u043D\u0435 \u2192 \u043C\u0438\u043D\u0443\u0441 30% \u0443\u0440\u043E\u0436\u0430\u044F (\u043F\u043E\u0442\u0435\u0440\u044F 200,000\u20B8)"
4. \u0413\u0440\u0430\u0444\u0438\u043A: "\u041C\u0430\u0440\u0442: \u043F\u043E\u0441\u0435\u0432. \u0410\u043F\u0440\u0435\u043B\u044C: \u0430\u0437\u043E\u0442. \u041C\u0430\u0439: \u0433\u0435\u0440\u0431\u0438\u0446\u0438\u0434\u044B. \u0418\u044E\u043B\u044C: \u043F\u043E\u043B\u0438\u0432. \u0421\u0435\u043D\u0442\u044F\u0431\u0440\u044C: \u0443\u0431\u043E\u0440\u043A\u0430"

\u0412\u0410\u0416\u041D\u041E: \u0412\u0421\u0415 \u0446\u0438\u0444\u0440\u044B \u0438 \u0446\u0435\u043D\u044B \u041E\u0411\u042F\u0417\u0410\u0422\u0415\u041B\u042C\u041D\u042B! \u041A\u0430\u0436\u0434\u044B\u0439 \u043F\u0443\u043D\u043A\u0442 - \u041E\u0414\u041D\u041E \u043F\u0440\u0435\u0434\u043B\u043E\u0436\u0435\u043D\u0438\u0435.`;
    const response = await ai2.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    });
    const text2 = response.text || "";
    const lines = text2.split("\n").filter((l) => l.trim());
    return {
      summary: lines[0] || "\u0410\u043D\u0430\u043B\u0438\u0437 \u0432\u044B\u043F\u043E\u043B\u043D\u0435\u043D",
      recommendations: lines.slice(1, 6).filter((l) => l.includes("\u0440\u0435\u043A\u043E\u043C\u0435\u043D\u0434\u0430\u0446") || l.match(/^\d+\./)),
      yieldOptimization: lines.slice(1, 4).filter((l) => l.includes("\u0443\u0440\u043E\u0436\u0430\u0439") || l.includes("\u0432\u043D\u043E\u0441")),
      risks: lines.filter((l) => l.includes("\u0440\u0438\u0441\u043A") || l.includes("\u043E\u043F\u0430\u0441\u043D")).slice(0, 3),
      timeline: lines.find((l) => l.includes("\u0433\u0440\u0430\u0444\u0438\u043A") || l.includes("\u0441\u0435\u0437\u043E\u043D")) || "\u0421\u043E\u0441\u0442\u0430\u0432\u044C\u0442\u0435 \u0433\u0440\u0430\u0444\u0438\u043A \u0440\u0430\u0431\u043E\u0442"
    };
  } catch (error) {
    console.error("\u041E\u0448\u0438\u0431\u043A\u0430 \u0430\u043D\u0430\u043B\u0438\u0437\u0430 \u043F\u043E\u043B\u044F:", error);
    return {
      summary: "\u041F\u043E\u043B\u0435 \u0441\u043E\u0437\u0434\u0430\u043D\u043E \u0443\u0441\u043F\u0435\u0448\u043D\u043E",
      recommendations: ["\u041F\u0440\u043E\u0432\u0435\u0434\u0438\u0442\u0435 \u0430\u043D\u0430\u043B\u0438\u0437 \u043F\u043E\u0447\u0432\u044B", "\u041F\u043B\u0430\u043D\u0438\u0440\u0443\u0439\u0442\u0435 \u0441\u0435\u0432\u043E\u043E\u0431\u043E\u0440\u043E\u0442", "\u0423\u0447\u0438\u0442\u044B\u0432\u0430\u0439\u0442\u0435 \u043F\u043E\u0433\u043E\u0434\u043D\u044B\u0435 \u0443\u0441\u043B\u043E\u0432\u0438\u044F"],
      yieldOptimization: ["\u041E\u043F\u0442\u0438\u043C\u0438\u0437\u0438\u0440\u0443\u0439\u0442\u0435 \u0432\u043D\u0435\u0441\u0435\u043D\u0438\u0435 \u0443\u0434\u043E\u0431\u0440\u0435\u043D\u0438\u0439", "\u041A\u043E\u043D\u0442\u0440\u043E\u043B\u0438\u0440\u0443\u0439\u0442\u0435 \u0432\u043B\u0430\u0436\u043D\u043E\u0441\u0442\u044C \u043F\u043E\u0447\u0432\u044B"],
      risks: ["\u0421\u043B\u0435\u0434\u0438\u0442\u0435 \u0437\u0430 \u043F\u043E\u0433\u043E\u0434\u043D\u044B\u043C\u0438 \u0443\u0441\u043B\u043E\u0432\u0438\u044F\u043C\u0438"],
      timeline: "\u0421\u043E\u0441\u0442\u0430\u0432\u044C\u0442\u0435 \u0434\u0435\u0442\u0430\u043B\u044C\u043D\u044B\u0439 \u0433\u0440\u0430\u0444\u0438\u043A \u043D\u0430 \u0441\u0435\u0437\u043E\u043D"
    };
  }
}
async function generateFeedingPlan(livestock2) {
  try {
    const prompt = `\u0422\u044B \u043E\u043F\u044B\u0442\u043D\u044B\u0439 \u043A\u0430\u0437\u0430\u0445\u0441\u0442\u0430\u043D\u0441\u043A\u0438\u0439 \u0432\u0435\u0442\u0435\u0440\u0438\u043D\u0430\u0440-\u0437\u043E\u043E\u0442\u0435\u0445\u043D\u0438\u043A. \u0421\u043E\u0441\u0442\u0430\u0432\u044C \u042D\u041A\u041E\u041D\u041E\u041C\u041D\u042B\u0419 \u0438 \u042D\u0424\u0424\u0415\u041A\u0422\u0418\u0412\u041D\u042B\u0419 \u043F\u043B\u0430\u043D \u043A\u043E\u0440\u043C\u043B\u0435\u043D\u0438\u044F.

\u0416\u0438\u0432\u043E\u0442\u043D\u044B\u0435: ${livestock2.count} \u0433\u043E\u043B\u043E\u0432 ${livestock2.type}

\u0426\u0415\u041B\u042C: \u041C\u0430\u043A\u0441\u0438\u043C\u0430\u043B\u044C\u043D\u0430\u044F \u043F\u0440\u043E\u0434\u0443\u043A\u0442\u0438\u0432\u043D\u043E\u0441\u0442\u044C \u043F\u0440\u0438 \u043C\u0438\u043D\u0438\u043C\u0430\u043B\u044C\u043D\u044B\u0445 \u0437\u0430\u0442\u0440\u0430\u0442\u0430\u0445.
\u0423\u043A\u0430\u0436\u0438 \u0422\u041E\u0427\u041D\u042B\u0415 \u0446\u0438\u0444\u0440\u044B \u0438 \u0414\u0415\u0428\u0415\u0412\u042B\u0415 \u0430\u043B\u044C\u0442\u0435\u0440\u043D\u0430\u0442\u0438\u0432\u044B \u0434\u043E\u0440\u043E\u0433\u0438\u043C \u043A\u043E\u0440\u043C\u0430\u043C.

\u0424\u043E\u0440\u043C\u0430\u0442 \u043E\u0442\u0432\u0435\u0442\u0430 (\u041A\u0420\u0410\u0422\u041A\u041E):
1. \u0421\u041E\u0421\u0422\u0410\u0412 \u041A\u041E\u0420\u041C\u0410 (5-7 \u0438\u043D\u0433\u0440\u0435\u0434\u0438\u0435\u043D\u0442\u043E\u0432, \u0422\u041E\u0427\u041D\u042B\u0415 \u043F\u0440\u043E\u0446\u0435\u043D\u0442\u044B, \u0441\u0443\u043C\u043C\u0430 = 100%):
   \u0424\u043E\u0440\u043C\u0430\u0442: "\u041F\u0448\u0435\u043D\u0438\u0446\u0430: 30%, \u042F\u0447\u043C\u0435\u043D\u044C: 25%..." \u0438 \u0442.\u0434.
2. \u041A\u041E\u041B\u0418\u0427\u0415\u0421\u0422\u0412\u041E: \u0441\u043A\u043E\u043B\u044C\u043A\u043E \u043A\u0433 \u043D\u0430 1 \u0436\u0438\u0432\u043E\u0442\u043D\u043E\u0435 \u0432 \u0434\u0435\u043D\u044C (\u0422\u041E\u0427\u041D\u0410\u042F \u0446\u0438\u0444\u0440\u0430)
3. \u0413\u0420\u0410\u0424\u0418\u041A \u041A\u041E\u0420\u041C\u041B\u0415\u041D\u0418\u042F (3-4 \u043F\u0440\u0430\u0432\u0438\u043B\u0430: \u043A\u043E\u0433\u0434\u0430, \u0441\u043A\u043E\u043B\u044C\u043A\u043E \u0440\u0430\u0437, \u043A\u0430\u043A)
4. \u042D\u041A\u041E\u041D\u041E\u041C\u0418\u042F (2-3 \u0441\u043E\u0432\u0435\u0442\u0430 \u043F\u043E \u0437\u0430\u043C\u0435\u043D\u0435 \u0434\u043E\u0440\u043E\u0433\u0438\u0445 \u043A\u043E\u0440\u043C\u043E\u0432 \u0434\u0435\u0448\u0435\u0432\u044B\u043C\u0438 \u0430\u043D\u0430\u043B\u043E\u0433\u0430\u043C\u0438)

\u041F\u0440\u0438\u043C\u0435\u0440: "\u0417\u0430\u043C\u0435\u043D\u0438\u0442\u0435 \u0438\u043C\u043F\u043E\u0440\u0442\u043D\u044B\u0439 \u043F\u0440\u043E\u0442\u0435\u0438\u043D (150\u20B8/\u043A\u0433) \u043D\u0430 \u043C\u0435\u0441\u0442\u043D\u044B\u0439 \u044F\u0447\u043C\u0435\u043D\u044C (40\u20B8/\u043A\u0433) \u2192 \u044D\u043A\u043E\u043D\u043E\u043C\u0438\u044F 30%"
\u041A\u0430\u0436\u0434\u044B\u0439 \u043F\u0443\u043D\u043A\u0442 - \u041E\u0414\u041D\u041E \u043F\u0440\u0435\u0434\u043B\u043E\u0436\u0435\u043D\u0438\u0435 \u0441 \u0446\u0438\u0444\u0440\u0430\u043C\u0438 \u0438 \u0446\u0435\u043D\u0430\u043C\u0438 \u0432 \u0442\u0435\u043D\u0433\u0435.`;
    const response = await ai2.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    });
    const text2 = response.text || "";
    const percentageMatches = text2.match(/([А-Яа-яA-Za-z\s]+?):\s*(\d+)%/g) || [];
    const dailyFeed = percentageMatches.slice(0, 7).map((match) => {
      const parts = match.split(":");
      if (parts.length < 2) return null;
      const ingredient = parts[0].trim();
      const percentStr = parts[1].trim();
      const percentage = parseInt(percentStr);
      const perAnimal = Math.round(percentage * 0.15 * 10) / 10;
      const total = Math.round(perAnimal * livestock2.count * 10) / 10;
      return {
        ingredient,
        percentage: percentage || 0,
        amountPerAnimal: `${perAnimal} \u043A\u0433/\u0434\u0435\u043D\u044C`,
        totalAmount: `${total} \u043A\u0433/\u0434\u0435\u043D\u044C (\u0432\u0441\u0435\u0433\u043E \u0434\u043B\u044F ${livestock2.count} \u0433\u043E\u043B\u043E\u0432)`
      };
    }).filter(Boolean);
    if (dailyFeed.length === 0) {
      const defaultFeeds = [
        { ingredient: "\u041F\u0448\u0435\u043D\u0438\u0446\u0430", percentage: 30, base: 4.5 },
        { ingredient: "\u042F\u0447\u043C\u0435\u043D\u044C", percentage: 25, base: 3.8 },
        { ingredient: "\u041A\u0443\u043A\u0443\u0440\u0443\u0437\u0430", percentage: 20, base: 3 },
        { ingredient: "\u0421\u0435\u043D\u043E", percentage: 15, base: 2.3 },
        { ingredient: "\u0412\u0438\u0442\u0430\u043C\u0438\u043D\u044B", percentage: 10, base: 1.5 }
      ];
      dailyFeed.push(...defaultFeeds.map((f) => ({
        ingredient: f.ingredient,
        percentage: f.percentage,
        amountPerAnimal: `${f.base} \u043A\u0433/\u0434\u0435\u043D\u044C`,
        totalAmount: `${Math.round(f.base * livestock2.count * 10) / 10} \u043A\u0433/\u0434\u0435\u043D\u044C (\u0432\u0441\u0435\u0433\u043E \u0434\u043B\u044F ${livestock2.count} \u0433\u043E\u043B\u043E\u0432)`
      })));
    }
    const lines = text2.split("\n").map((l) => l.trim()).filter((l) => l.length > 5);
    const costSavings = lines.filter((l) => {
      const lower = l.toLowerCase();
      const hasCostKeyword = lower.includes("\u20B8") || lower.includes("\u0442\u0435\u043D\u0433\u0435") || lower.includes("\u044D\u043A\u043E\u043D\u043E\u043C\u0438") || lower.includes("\u0437\u0430\u043C\u0435\u043D") || lower.includes("\u0434\u0435\u0448\u0435\u0432") || lower.includes("\u0430\u043B\u044C\u0442\u0435\u0440\u043D\u0430\u0442\u0438\u0432") || lower.includes("roi") || lower.includes("\u0440\u0435\u043D\u0442\u0430\u0431\u0435\u043B\u044C\u043D") || lower.includes("\u0432\u044B\u0433\u043E\u0434") || lower.includes("\u0441\u0431\u0435\u0440\u0435\u0433");
      const isNotPercentage = !l.match(/^\d+%/);
      return hasCostKeyword && isNotPercentage;
    }).slice(0, 5);
    const costSavingsSet = new Set(costSavings);
    const remainingLines = lines.filter((l) => !costSavingsSet.has(l));
    const feedingSchedule = remainingLines.filter((l) => {
      const lower = l.toLowerCase();
      const hasScheduleKeyword = lower.includes("\u0440\u0430\u0437") || lower.includes("\u0433\u0440\u0430\u0444\u0438\u043A") || lower.includes("\u0432\u0440\u0435\u043C\u044F") || lower.includes("\u043A\u043E\u0440\u043C") && !l.match(/^\d+%/);
      const noCost = !lower.includes("\u20B8") && !lower.includes("\u0442\u0435\u043D\u0433\u0435");
      return hasScheduleKeyword && noCost;
    }).slice(0, 4);
    const scheduleSet = new Set(feedingSchedule);
    const nutritionTips = remainingLines.filter((l) => {
      const lower = l.toLowerCase();
      return !scheduleSet.has(l) && !l.match(/^\d+%/) && l.length > 15 && !lower.includes("\u20B8") && !lower.includes("\u0442\u0435\u043D\u0433\u0435");
    }).slice(0, 3);
    return {
      summary: `\u041F\u043B\u0430\u043D \u043A\u043E\u0440\u043C\u043B\u0435\u043D\u0438\u044F \u0434\u043B\u044F ${livestock2.count} ${livestock2.type}`,
      dailyFeed,
      feedingSchedule: feedingSchedule.length > 0 ? feedingSchedule : [
        "\u041A\u043E\u0440\u043C\u0438\u0442\u044C 2 \u0440\u0430\u0437\u0430 \u0432 \u0434\u0435\u043D\u044C",
        "\u0423\u0442\u0440\u043E\u043C \u0432 6:00 \u0438 \u0432\u0435\u0447\u0435\u0440\u043E\u043C \u0432 18:00",
        "\u041E\u0431\u0435\u0441\u043F\u0435\u0447\u0438\u0442\u044C \u043F\u043E\u0441\u0442\u043E\u044F\u043D\u043D\u044B\u0439 \u0434\u043E\u0441\u0442\u0443\u043F \u043A \u0432\u043E\u0434\u0435"
      ],
      nutritionTips: nutritionTips.length > 0 ? nutritionTips : [
        "\u0421\u043B\u0435\u0434\u0438\u0442\u0435 \u0437\u0430 \u043A\u0430\u0447\u0435\u0441\u0442\u0432\u043E\u043C \u043A\u043E\u0440\u043C\u043E\u0432",
        "\u0410\u0434\u0430\u043F\u0442\u0438\u0440\u0443\u0439\u0442\u0435 \u0440\u0430\u0446\u0438\u043E\u043D \u043F\u043E \u0441\u0435\u0437\u043E\u043D\u0443"
      ],
      costSavings: costSavings.length > 0 ? costSavings : [
        "\u0418\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0439\u0442\u0435 \u043C\u0435\u0441\u0442\u043D\u044B\u0435 \u043A\u043E\u0440\u043C\u0430 - \u0434\u0435\u0448\u0435\u0432\u043B\u0435 \u0438\u043C\u043F\u043E\u0440\u0442\u043D\u044B\u0445 \u043D\u0430 30-40%",
        "\u041F\u043E\u043A\u0443\u043F\u0430\u0439\u0442\u0435 \u043E\u043F\u0442\u043E\u043C \u0434\u043B\u044F \u044D\u043A\u043E\u043D\u043E\u043C\u0438\u0438 15-20%"
      ]
    };
  } catch (error) {
    console.error("\u041E\u0448\u0438\u0431\u043A\u0430 \u0441\u043E\u0437\u0434\u0430\u043D\u0438\u044F \u043F\u043B\u0430\u043D\u0430 \u043A\u043E\u0440\u043C\u043B\u0435\u043D\u0438\u044F:", error);
    const defaultFeeds = [
      { ingredient: "\u041F\u0448\u0435\u043D\u0438\u0446\u0430", percentage: 30, base: 4.5 },
      { ingredient: "\u042F\u0447\u043C\u0435\u043D\u044C", percentage: 25, base: 3.8 },
      { ingredient: "\u041A\u0443\u043A\u0443\u0440\u0443\u0437\u0430", percentage: 20, base: 3 },
      { ingredient: "\u0421\u0435\u043D\u043E", percentage: 15, base: 2.3 },
      { ingredient: "\u0412\u0438\u0442\u0430\u043C\u0438\u043D\u044B", percentage: 10, base: 1.5 }
    ];
    return {
      summary: `\u041F\u043B\u0430\u043D \u043A\u043E\u0440\u043C\u043B\u0435\u043D\u0438\u044F \u0434\u043B\u044F ${livestock2.count} ${livestock2.type}`,
      dailyFeed: defaultFeeds.map((f) => ({
        ingredient: f.ingredient,
        percentage: f.percentage,
        amountPerAnimal: `${f.base} \u043A\u0433/\u0434\u0435\u043D\u044C`,
        totalAmount: `${Math.round(f.base * livestock2.count * 10) / 10} \u043A\u0433/\u0434\u0435\u043D\u044C (\u0432\u0441\u0435\u0433\u043E \u0434\u043B\u044F ${livestock2.count} \u0433\u043E\u043B\u043E\u0432)`
      })),
      feedingSchedule: [
        "\u041A\u043E\u0440\u043C\u0438\u0442\u044C 2 \u0440\u0430\u0437\u0430 \u0432 \u0434\u0435\u043D\u044C: \u0443\u0442\u0440\u043E\u043C \u0438 \u0432\u0435\u0447\u0435\u0440\u043E\u043C",
        "\u041E\u0431\u0435\u0441\u043F\u0435\u0447\u0438\u0442\u044C \u043F\u043E\u0441\u0442\u043E\u044F\u043D\u043D\u044B\u0439 \u0434\u043E\u0441\u0442\u0443\u043F \u043A \u0432\u043E\u0434\u0435",
        "\u0420\u0435\u0433\u0443\u043B\u044F\u0440\u043D\u043E \u043F\u0440\u043E\u0432\u0435\u0440\u044F\u0442\u044C \u0441\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u0435 \u0436\u0438\u0432\u043E\u0442\u043D\u044B\u0445"
      ],
      nutritionTips: [
        "\u0421\u043B\u0435\u0434\u0438\u0442\u0435 \u0437\u0430 \u043A\u0430\u0447\u0435\u0441\u0442\u0432\u043E\u043C \u0438 \u0441\u0432\u0435\u0436\u0435\u0441\u0442\u044C\u044E \u043A\u043E\u0440\u043C\u043E\u0432",
        "\u0410\u0434\u0430\u043F\u0442\u0438\u0440\u0443\u0439\u0442\u0435 \u0440\u0430\u0446\u0438\u043E\u043D \u0432 \u0437\u0430\u0432\u0438\u0441\u0438\u043C\u043E\u0441\u0442\u0438 \u043E\u0442 \u0441\u0435\u0437\u043E\u043D\u0430 \u0438 \u043F\u0440\u043E\u0434\u0443\u043A\u0442\u0438\u0432\u043D\u043E\u0441\u0442\u0438"
      ],
      costSavings: [
        "\u0418\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0439\u0442\u0435 \u043C\u0435\u0441\u0442\u043D\u044B\u0435 \u043A\u043E\u0440\u043C\u0430 - \u0434\u0435\u0448\u0435\u0432\u043B\u0435 \u0438\u043C\u043F\u043E\u0440\u0442\u043D\u044B\u0445 \u043D\u0430 30-40%",
        "\u041F\u043E\u043A\u0443\u043F\u0430\u0439\u0442\u0435 \u043E\u043F\u0442\u043E\u043C \u0434\u043B\u044F \u044D\u043A\u043E\u043D\u043E\u043C\u0438\u0438 15-20%"
      ]
    };
  }
}
async function getFieldRecommendations(field, category) {
  const categoryNames = {
    fertilizer: "\u0423\u0434\u043E\u0431\u0440\u0435\u043D\u0438\u044F",
    soil: "\u041F\u043E\u0447\u0432\u0430",
    pesticides: "\u041F\u0435\u0441\u0442\u0438\u0446\u0438\u0434\u044B \u0438 \u0437\u0430\u0449\u0438\u0442\u0430"
  };
  try {
    const prompt = `\u0414\u0430\u0439 \u041A\u0420\u0410\u0422\u041A\u0418\u0415 \u0440\u0435\u043A\u043E\u043C\u0435\u043D\u0434\u0430\u0446\u0438\u0438 \u043F\u043E \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0438 "${categoryNames[category]}" \u0434\u043B\u044F \u043F\u043E\u043B\u044F:
\u041A\u0443\u043B\u044C\u0442\u0443\u0440\u0430: ${field.cropType}
\u041F\u043B\u043E\u0449\u0430\u0434\u044C: ${field.area} \u0433\u0430

\u0414\u0430\u0439 4-5 \u043A\u043E\u043D\u043A\u0440\u0435\u0442\u043D\u044B\u0445 \u043F\u0443\u043D\u043A\u0442\u043E\u0432. \u041A\u0430\u0436\u0434\u044B\u0439 \u043F\u0443\u043D\u043A\u0442 - 1 \u043A\u043E\u0440\u043E\u0442\u043A\u043E\u0435 \u043F\u0440\u0435\u0434\u043B\u043E\u0436\u0435\u043D\u0438\u0435.
\u0411\u0435\u0437 \u0434\u043B\u0438\u043D\u043D\u044B\u0445 \u043E\u0431\u044A\u044F\u0441\u043D\u0435\u043D\u0438\u0439, \u0442\u043E\u043B\u044C\u043A\u043E \u0441\u0443\u0442\u044C.`;
    const response = await ai2.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    });
    const text2 = response.text || "";
    const lines = text2.split("\n").filter((l) => l.trim() && (l.match(/^\d+\./) || l.match(/^[-•]/))).map((l) => l.replace(/^\d+\.\s*/, "").replace(/^[-•]\s*/, "")).slice(0, 5);
    return {
      title: categoryNames[category],
      recommendations: lines.length > 0 ? lines : [
        "\u041F\u0440\u043E\u0432\u0435\u0434\u0438\u0442\u0435 \u0430\u043D\u0430\u043B\u0438\u0437 \u043F\u0435\u0440\u0435\u0434 \u043F\u0440\u0438\u043C\u0435\u043D\u0435\u043D\u0438\u0435\u043C",
        "\u0421\u043B\u0435\u0434\u0443\u0439\u0442\u0435 \u0440\u0435\u043A\u043E\u043C\u0435\u043D\u0434\u043E\u0432\u0430\u043D\u043D\u044B\u043C \u0434\u043E\u0437\u0438\u0440\u043E\u0432\u043A\u0430\u043C",
        "\u0423\u0447\u0438\u0442\u044B\u0432\u0430\u0439\u0442\u0435 \u043F\u043E\u0433\u043E\u0434\u043D\u044B\u0435 \u0443\u0441\u043B\u043E\u0432\u0438\u044F"
      ]
    };
  } catch (error) {
    console.error("\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u0438\u044F \u0440\u0435\u043A\u043E\u043C\u0435\u043D\u0434\u0430\u0446\u0438\u0439:", error);
    return {
      title: categoryNames[category],
      recommendations: [
        "\u041F\u0440\u043E\u0432\u0435\u0434\u0438\u0442\u0435 \u043F\u0440\u043E\u0444\u0435\u0441\u0441\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u044B\u0439 \u0430\u043D\u0430\u043B\u0438\u0437",
        "\u0421\u043B\u0435\u0434\u0443\u0439\u0442\u0435 \u0430\u0433\u0440\u043E\u043D\u043E\u043C\u0438\u0447\u0435\u0441\u043A\u0438\u043C \u0440\u0435\u043A\u043E\u043C\u0435\u043D\u0434\u0430\u0446\u0438\u044F\u043C",
        "\u0423\u0447\u0438\u0442\u044B\u0432\u0430\u0439\u0442\u0435 \u043C\u0435\u0441\u0442\u043D\u044B\u0435 \u0443\u0441\u043B\u043E\u0432\u0438\u044F"
      ]
    };
  }
}
async function analyzeFeedingData(livestock2, feeds) {
  if (feeds.length === 0) {
    return {
      summary: "\u0414\u043E\u0431\u0430\u0432\u044C\u0442\u0435 \u043A\u043E\u0440\u043C\u0430 \u0434\u043B\u044F \u0430\u043D\u0430\u043B\u0438\u0437\u0430",
      nutritionBalance: ["\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u0434\u0430\u043D\u043D\u044B\u0435 \u043E \u043A\u043E\u0440\u043C\u0430\u0445 \u0434\u043B\u044F \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u0438\u044F \u0430\u043D\u0430\u043B\u0438\u0437\u0430"],
      costOptimization: [],
      warnings: ["\u041A\u043E\u0440\u043C\u0430 \u043D\u0435 \u0434\u043E\u0431\u0430\u0432\u043B\u0435\u043D\u044B! \u0414\u043E\u0431\u0430\u0432\u044C\u0442\u0435 \u043A\u043E\u0440\u043C\u0430 \u0434\u043B\u044F \u0436\u0438\u0432\u043E\u0442\u043D\u044B\u0445"],
      suggestions: ["\u041D\u0430\u0447\u043D\u0438\u0442\u0435 \u0441 \u0434\u043E\u0431\u0430\u0432\u043B\u0435\u043D\u0438\u044F \u043E\u0441\u043D\u043E\u0432\u043D\u044B\u0445 \u043A\u043E\u0440\u043C\u043E\u0432: \u043F\u0448\u0435\u043D\u0438\u0446\u0430, \u044F\u0447\u043C\u0435\u043D\u044C, \u0441\u0435\u043D\u043E"]
    };
  }
  try {
    const feedList = feeds.map((f) => `${f.name}: ${f.quantity} ${f.unit}${f.pricePerUnit ? ` \u043F\u043E ${f.pricePerUnit}\u20B8/${f.unit}` : ""}`).join("\n");
    const prompt = `\u0422\u044B \u043E\u043F\u044B\u0442\u043D\u044B\u0439 \u043A\u0430\u0437\u0430\u0445\u0441\u0442\u0430\u043D\u0441\u043A\u0438\u0439 \u0432\u0435\u0442\u0435\u0440\u0438\u043D\u0430\u0440-\u0437\u043E\u043E\u0442\u0435\u0445\u043D\u0438\u043A. \u041F\u0420\u041E\u0410\u041D\u0410\u041B\u0418\u0417\u0418\u0420\u0423\u0419 \u0442\u0435\u043A\u0443\u0449\u0438\u0439 \u0440\u0430\u0446\u0438\u043E\u043D \u043A\u043E\u0440\u043C\u043B\u0435\u043D\u0438\u044F \u0438 \u0434\u0430\u0439 \u041F\u0420\u0410\u041A\u0422\u0418\u0427\u041D\u042B\u0415 \u0441\u043E\u0432\u0435\u0442\u044B.

\u0416\u0438\u0432\u043E\u0442\u043D\u044B\u0435: ${livestock2.count} \u0433\u043E\u043B\u043E\u0432 ${livestock2.type}

\u0422\u0415\u041A\u0423\u0429\u0418\u0415 \u041A\u041E\u0420\u041C\u0410 (\u0432\u0432\u0435\u0434\u0435\u043D\u044B \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u0435\u043C):
${feedList}

\u0414\u0430\u0439 \u0410\u041D\u0410\u041B\u0418\u0417 \u0432 \u0444\u043E\u0440\u043C\u0430\u0442\u0435 (\u041A\u0420\u0410\u0422\u041A\u041E, \u043F\u043E \u043F\u0443\u043D\u043A\u0442\u0430\u043C):
1. \u041E\u0426\u0415\u041D\u041A\u0410 \u0411\u0410\u041B\u0410\u041D\u0421\u0410: \u0434\u043E\u0441\u0442\u0430\u0442\u043E\u0447\u043D\u043E \u043B\u0438 \u0431\u0435\u043B\u043A\u0430, \u044D\u043D\u0435\u0440\u0433\u0438\u0438, \u0432\u0438\u0442\u0430\u043C\u0438\u043D\u043E\u0432? (2-3 \u043F\u0443\u043D\u043A\u0442\u0430)
2. \u042D\u041A\u041E\u041D\u041E\u041C\u0418\u042F: \u043A\u0430\u043A \u0441\u043D\u0438\u0437\u0438\u0442\u044C \u0437\u0430\u0442\u0440\u0430\u0442\u044B \u0431\u0435\u0437 \u043F\u043E\u0442\u0435\u0440\u0438 \u043A\u0430\u0447\u0435\u0441\u0442\u0432\u0430? (2-3 \u043A\u043E\u043D\u043A\u0440\u0435\u0442\u043D\u044B\u0445 \u0441\u043E\u0432\u0435\u0442\u0430 \u0441 \u0446\u0435\u043D\u0430\u043C\u0438 \u0432 \u20B8)
3. \u041F\u0420\u0415\u0414\u0423\u041F\u0420\u0415\u0416\u0414\u0415\u041D\u0418\u042F: \u0447\u0442\u043E \u043D\u0435 \u0442\u0430\u043A \u0438\u043B\u0438 \u0447\u0435\u0433\u043E \u043D\u0435 \u0445\u0432\u0430\u0442\u0430\u0435\u0442? (1-2 \u043A\u0440\u0438\u0442\u0438\u0447\u043D\u044B\u0445 \u043C\u043E\u043C\u0435\u043D\u0442\u0430)
4. \u0420\u0415\u041A\u041E\u041C\u0415\u041D\u0414\u0410\u0426\u0418\u0418: \u0447\u0442\u043E \u0434\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u0438\u043B\u0438 \u0438\u0437\u043C\u0435\u043D\u0438\u0442\u044C? (2-3 \u043F\u0440\u0430\u043A\u0442\u0438\u0447\u043D\u044B\u0445 \u0441\u043E\u0432\u0435\u0442\u0430)

\u041A\u0430\u0436\u0434\u044B\u0439 \u043F\u0443\u043D\u043A\u0442 - \u041E\u0414\u041D\u041E \u043A\u043E\u0440\u043E\u0442\u043A\u043E\u0435 \u043F\u0440\u0435\u0434\u043B\u043E\u0436\u0435\u043D\u0438\u0435 \u0441 \u0446\u0438\u0444\u0440\u0430\u043C\u0438.`;
    const response = await ai2.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    });
    const text2 = response.text || "";
    const lines = text2.split("\n").filter((l) => l.trim());
    return {
      summary: `\u0410\u043D\u0430\u043B\u0438\u0437 \u043A\u043E\u0440\u043C\u043B\u0435\u043D\u0438\u044F \u0434\u043B\u044F ${livestock2.count} ${livestock2.type}`,
      nutritionBalance: lines.filter((l) => l.includes("\u0431\u0430\u043B\u0430\u043D\u0441") || l.includes("\u0431\u0435\u043B\u043E\u043A") || l.includes("\u044D\u043D\u0435\u0440\u0433") || l.includes("\u0432\u0438\u0442\u0430\u043C\u0438\u043D")).slice(0, 3),
      costOptimization: lines.filter((l) => l.includes("\u044D\u043A\u043E\u043D\u043E\u043C") || l.includes("\u0437\u0430\u0442\u0440\u0430\u0442") || l.includes("\u0434\u0435\u0448\u0435\u0432\u043B\u0435") || l.includes("\u20B8")).slice(0, 3),
      warnings: lines.filter((l) => l.includes("\u043F\u0440\u0435\u0434\u0443\u043F\u0440") || l.includes("\u043D\u0435 \u0445\u0432\u0430\u0442\u0430\u0435\u0442") || l.includes("\u043D\u0435\u0434\u043E\u0441\u0442\u0430\u0442") || l.includes("\u043E\u043F\u0430\u0441\u043D")).slice(0, 2),
      suggestions: lines.filter((l) => l.includes("\u0440\u0435\u043A\u043E\u043C\u0435\u043D\u0434") || l.includes("\u0434\u043E\u0431\u0430\u0432\u0438\u0442\u044C") || l.includes("\u0438\u0437\u043C\u0435\u043D\u0438\u0442\u044C") || l.includes("\u0441\u043E\u0432\u0435\u0442")).slice(0, 3)
    };
  } catch (error) {
    console.error("\u041E\u0448\u0438\u0431\u043A\u0430 \u0430\u043D\u0430\u043B\u0438\u0437\u0430 \u043A\u043E\u0440\u043C\u043E\u0432:", error);
    return {
      summary: `\u041A\u043E\u0440\u043C\u0430 \u0434\u043E\u0431\u0430\u0432\u043B\u0435\u043D\u044B \u0434\u043B\u044F ${livestock2.count} ${livestock2.type}`,
      nutritionBalance: ["\u041F\u0440\u043E\u0432\u0435\u0440\u044C\u0442\u0435 \u0431\u0430\u043B\u0430\u043D\u0441 \u0431\u0435\u043B\u043A\u043E\u0432 \u0438 \u0443\u0433\u043B\u0435\u0432\u043E\u0434\u043E\u0432"],
      costOptimization: ["\u0418\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0439\u0442\u0435 \u043C\u0435\u0441\u0442\u043D\u044B\u0435 \u043A\u043E\u0440\u043C\u0430 \u0434\u043B\u044F \u044D\u043A\u043E\u043D\u043E\u043C\u0438\u0438"],
      warnings: [],
      suggestions: ["\u041E\u0431\u0440\u0430\u0442\u0438\u0442\u0435\u0441\u044C \u043A \u0432\u0435\u0442\u0435\u0440\u0438\u043D\u0430\u0440\u0443 \u0434\u043B\u044F \u0434\u0435\u0442\u0430\u043B\u044C\u043D\u043E\u0439 \u043A\u043E\u043D\u0441\u0443\u043B\u044C\u0442\u0430\u0446\u0438\u0438"]
    };
  }
}
async function analyzeFertilizerData(field, fertilizers) {
  if (fertilizers.length === 0) {
    return {
      summary: "\u0414\u043E\u0431\u0430\u0432\u044C\u0442\u0435 \u0443\u0434\u043E\u0431\u0440\u0435\u043D\u0438\u044F \u0434\u043B\u044F \u0430\u043D\u0430\u043B\u0438\u0437\u0430",
      effectiveness: ["\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u0434\u0430\u043D\u043D\u044B\u0435 \u043E\u0431 \u0443\u0434\u043E\u0431\u0440\u0435\u043D\u0438\u044F\u0445 \u0434\u043B\u044F \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u0438\u044F \u0430\u043D\u0430\u043B\u0438\u0437\u0430"],
      costOptimization: [],
      warnings: ["\u0423\u0434\u043E\u0431\u0440\u0435\u043D\u0438\u044F \u043D\u0435 \u0434\u043E\u0431\u0430\u0432\u043B\u0435\u043D\u044B! \u0414\u043E\u0431\u0430\u0432\u044C\u0442\u0435 \u0443\u0434\u043E\u0431\u0440\u0435\u043D\u0438\u044F \u0434\u043B\u044F \u043F\u043E\u043B\u044F"],
      suggestions: ["\u041D\u0430\u0447\u043D\u0438\u0442\u0435 \u0441 \u0434\u043E\u0431\u0430\u0432\u043B\u0435\u043D\u0438\u044F \u043E\u0441\u043D\u043E\u0432\u043D\u044B\u0445 \u0443\u0434\u043E\u0431\u0440\u0435\u043D\u0438\u0439: \u0430\u0437\u043E\u0442, \u0444\u043E\u0441\u0444\u043E\u0440, \u043A\u0430\u043B\u0438\u0439"]
    };
  }
  try {
    const fertilizerList = fertilizers.map(
      (f) => `${f.name}: ${f.quantity} ${f.unit}${f.pricePerUnit ? ` \u043F\u043E ${f.pricePerUnit}\u20B8/${f.unit}` : ""}${f.applicationDate ? `, \u0432\u043D\u0435\u0441\u0435\u043D\u0438\u0435: ${new Date(f.applicationDate).toLocaleDateString("ru-RU")}` : ""}`
    ).join("\n");
    const prompt = `\u0422\u044B \u043E\u043F\u044B\u0442\u043D\u044B\u0439 \u043A\u0430\u0437\u0430\u0445\u0441\u0442\u0430\u043D\u0441\u043A\u0438\u0439 \u0430\u0433\u0440\u043E\u043D\u043E\u043C. \u041F\u0420\u041E\u0410\u041D\u0410\u041B\u0418\u0417\u0418\u0420\u0423\u0419 \u043F\u043B\u0430\u043D \u0432\u043D\u0435\u0441\u0435\u043D\u0438\u044F \u0443\u0434\u043E\u0431\u0440\u0435\u043D\u0438\u0439 \u0438 \u0434\u0430\u0439 \u041F\u0420\u0410\u041A\u0422\u0418\u0427\u041D\u042B\u0415 \u0441\u043E\u0432\u0435\u0442\u044B.

\u041F\u043E\u043B\u0435: ${field.name}
\u041A\u0443\u043B\u044C\u0442\u0443\u0440\u0430: ${field.cropType}
\u041F\u043B\u043E\u0449\u0430\u0434\u044C: ${field.area} \u0433\u0430

\u0422\u0415\u041A\u0423\u0429\u0418\u0415 \u0423\u0414\u041E\u0411\u0420\u0415\u041D\u0418\u042F (\u0432\u0432\u0435\u0434\u0435\u043D\u044B \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u0435\u043C):
${fertilizerList}

\u0414\u0430\u0439 \u0410\u041D\u0410\u041B\u0418\u0417 \u0432 \u0444\u043E\u0440\u043C\u0430\u0442\u0435 (\u041A\u0420\u0410\u0422\u041A\u041E, \u043F\u043E \u043F\u0443\u043D\u043A\u0442\u0430\u043C):
1. \u042D\u0424\u0424\u0415\u041A\u0422\u0418\u0412\u041D\u041E\u0421\u0422\u042C: \u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u043E \u043B\u0438 \u043F\u043E\u0434\u043E\u0431\u0440\u0430\u043D\u044B \u0443\u0434\u043E\u0431\u0440\u0435\u043D\u0438\u044F? \u0434\u043E\u0441\u0442\u0430\u0442\u043E\u0447\u043D\u043E \u043B\u0438? (2-3 \u043F\u0443\u043D\u043A\u0442\u0430 \u0441 \u043E\u0446\u0435\u043D\u043A\u043E\u0439)
2. \u042D\u041A\u041E\u041D\u041E\u041C\u0418\u042F: \u043A\u0430\u043A \u0441\u043D\u0438\u0437\u0438\u0442\u044C \u0437\u0430\u0442\u0440\u0430\u0442\u044B? (2-3 \u043A\u043E\u043D\u043A\u0440\u0435\u0442\u043D\u044B\u0445 \u0441\u043E\u0432\u0435\u0442\u0430 \u0441 \u0446\u0435\u043D\u0430\u043C\u0438 \u0432 \u20B8/\u0433\u0430)
3. \u041F\u0420\u0415\u0414\u0423\u041F\u0420\u0415\u0416\u0414\u0415\u041D\u0418\u042F: \u0447\u0442\u043E \u043D\u0435 \u0442\u0430\u043A? \u043F\u0435\u0440\u0435\u0434\u043E\u0437\u0438\u0440\u043E\u0432\u043A\u0430? \u043D\u0435\u0445\u0432\u0430\u0442\u043A\u0430? (1-2 \u043A\u0440\u0438\u0442\u0438\u0447\u043D\u044B\u0445 \u043C\u043E\u043C\u0435\u043D\u0442\u0430)
4. \u0420\u0415\u041A\u041E\u041C\u0415\u041D\u0414\u0410\u0426\u0418\u0418: \u0447\u0442\u043E \u0434\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u0438\u043B\u0438 \u0438\u0437\u043C\u0435\u043D\u0438\u0442\u044C? \u043A\u043E\u0433\u0434\u0430 \u0432\u043D\u043E\u0441\u0438\u0442\u044C? (2-3 \u043F\u0440\u0430\u043A\u0442\u0438\u0447\u043D\u044B\u0445 \u0441\u043E\u0432\u0435\u0442\u0430)

\u041A\u0430\u0436\u0434\u044B\u0439 \u043F\u0443\u043D\u043A\u0442 - \u041E\u0414\u041D\u041E \u043A\u043E\u0440\u043E\u0442\u043A\u043E\u0435 \u043F\u0440\u0435\u0434\u043B\u043E\u0436\u0435\u043D\u0438\u0435 \u0441 \u0446\u0438\u0444\u0440\u0430\u043C\u0438.`;
    const response = await ai2.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    });
    const text2 = response.text || "";
    const lines = text2.split("\n").filter((l) => l.trim());
    return {
      summary: `\u0410\u043D\u0430\u043B\u0438\u0437 \u0443\u0434\u043E\u0431\u0440\u0435\u043D\u0438\u0439 \u0434\u043B\u044F \u043F\u043E\u043B\u044F ${field.name}`,
      effectiveness: lines.filter((l) => l.includes("\u044D\u0444\u0444\u0435\u043A\u0442") || l.includes("\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u043E") || l.includes("\u043F\u043E\u0434\u043E\u0431\u0440\u0430\u043D") || l.includes("\u0434\u043E\u0441\u0442\u0430\u0442\u043E\u0447")).slice(0, 3),
      costOptimization: lines.filter((l) => l.includes("\u044D\u043A\u043E\u043D\u043E\u043C") || l.includes("\u0437\u0430\u0442\u0440\u0430\u0442") || l.includes("\u0434\u0435\u0448\u0435\u0432\u043B\u0435") || l.includes("\u20B8")).slice(0, 3),
      warnings: lines.filter((l) => l.includes("\u043F\u0440\u0435\u0434\u0443\u043F\u0440") || l.includes("\u043F\u0435\u0440\u0435\u0434\u043E\u0437") || l.includes("\u043D\u0435 \u0445\u0432\u0430\u0442\u0430\u0435\u0442") || l.includes("\u043E\u043F\u0430\u0441\u043D")).slice(0, 2),
      suggestions: lines.filter((l) => l.includes("\u0440\u0435\u043A\u043E\u043C\u0435\u043D\u0434") || l.includes("\u0434\u043E\u0431\u0430\u0432\u0438\u0442\u044C") || l.includes("\u0438\u0437\u043C\u0435\u043D\u0438\u0442\u044C") || l.includes("\u0432\u043D\u0435\u0441\u0442\u0438")).slice(0, 3)
    };
  } catch (error) {
    console.error("\u041E\u0448\u0438\u0431\u043A\u0430 \u0430\u043D\u0430\u043B\u0438\u0437\u0430 \u0443\u0434\u043E\u0431\u0440\u0435\u043D\u0438\u0439:", error);
    return {
      summary: `\u0423\u0434\u043E\u0431\u0440\u0435\u043D\u0438\u044F \u0434\u043E\u0431\u0430\u0432\u043B\u0435\u043D\u044B \u0434\u043B\u044F \u043F\u043E\u043B\u044F ${field.name}`,
      effectiveness: ["\u041F\u0440\u043E\u0432\u0435\u0440\u044C\u0442\u0435 \u0441\u043E\u043E\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0438\u0435 \u043D\u043E\u0440\u043C\u0430\u043C \u0432\u043D\u0435\u0441\u0435\u043D\u0438\u044F"],
      costOptimization: ["\u0418\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0439\u0442\u0435 \u043C\u0435\u0441\u0442\u043D\u044B\u0435 \u0443\u0434\u043E\u0431\u0440\u0435\u043D\u0438\u044F \u0434\u043B\u044F \u044D\u043A\u043E\u043D\u043E\u043C\u0438\u0438"],
      warnings: [],
      suggestions: ["\u041F\u0440\u043E\u0432\u0435\u0434\u0438\u0442\u0435 \u0430\u043D\u0430\u043B\u0438\u0437 \u043F\u043E\u0447\u0432\u044B \u043F\u0435\u0440\u0435\u0434 \u0432\u043D\u0435\u0441\u0435\u043D\u0438\u0435\u043C \u0443\u0434\u043E\u0431\u0440\u0435\u043D\u0438\u0439"]
    };
  }
}

// server/routes.ts
async function registerRoutes(app2) {
  app2.use(
    session({
      secret: process.env.SESSION_SECRET || "agri-ai-secret-change-in-production",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 1e3 * 60 * 60 * 24 * 7
      }
    })
  );
  const requireAuth = (req, res, next) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "\u041D\u0435\u043E\u0431\u0445\u043E\u0434\u0438\u043C\u0430 \u0430\u0432\u0442\u043E\u0440\u0438\u0437\u0430\u0446\u0438\u044F" });
    }
    next();
  };
  app2.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const user = await registerUser(validatedData);
      req.session.userId = user.id;
      res.status(201).json({ user });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error registering user:", error);
      res.status(400).json({ error: error instanceof Error ? error.message : "\u041E\u0448\u0438\u0431\u043A\u0430 \u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u0438" });
    }
  });
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const validatedData = loginUserSchema.parse(req.body);
      const user = await loginUser(validatedData);
      req.session.userId = user.id;
      res.json({ user });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error logging in:", error);
      res.status(401).json({ error: error instanceof Error ? error.message : "\u041E\u0448\u0438\u0431\u043A\u0430 \u0432\u0445\u043E\u0434\u0430" });
    }
  });
  app2.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u0432\u044B\u0445\u043E\u0434\u0435" });
      }
      res.json({ message: "\u0423\u0441\u043F\u0435\u0448\u043D\u044B\u0439 \u0432\u044B\u0445\u043E\u0434" });
    });
  });
  app2.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "\u041D\u0435 \u0430\u0432\u0442\u043E\u0440\u0438\u0437\u043E\u0432\u0430\u043D" });
    }
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ error: "\u041F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D" });
      }
      const { password, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u0438\u0438 \u0434\u0430\u043D\u043D\u044B\u0445 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F" });
    }
  });
  app2.patch("/api/profile", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const { fullName, email, phone, location, company, avatarUrl } = req.body;
      const updated = await storage.updateUser(userId, {
        fullName,
        email,
        phone,
        location,
        company,
        avatarUrl
      });
      if (!updated) {
        return res.status(404).json({ error: "\u041F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D" });
      }
      const { password, ...userWithoutPassword } = updated;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ error: "\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u0438 \u043F\u0440\u043E\u0444\u0438\u043B\u044F" });
    }
  });
  app2.get("/api/fields", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const fields2 = await storage.getFieldsByUserId(userId);
      res.json(fields2);
    } catch (error) {
      console.error("Error fetching fields:", error);
      res.status(500).json({ error: "Failed to fetch fields" });
    }
  });
  app2.post("/api/fields", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const validatedData = insertFieldSchema.parse({
        ...req.body,
        userId
      });
      const field = await storage.createField(validatedData);
      const analysis = await analyzeField({
        name: field.name,
        cropType: field.cropType,
        area: parseFloat(field.area),
        latitude: parseFloat(field.latitude),
        longitude: parseFloat(field.longitude)
      });
      res.status(201).json({ field, analysis });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error creating field:", error);
      res.status(500).json({ error: "Failed to create field" });
    }
  });
  app2.patch("/api/fields/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const field = await storage.getField(req.params.id);
      if (!field || field.userId !== userId) {
        return res.status(404).json({ error: "Field not found" });
      }
      const validatedData = insertFieldSchema.omit({ userId: true }).partial().parse(req.body);
      const updated = await storage.updateField(req.params.id, validatedData);
      res.json(updated);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error updating field:", error);
      res.status(500).json({ error: "Failed to update field" });
    }
  });
  app2.delete("/api/fields/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const field = await storage.getField(req.params.id);
      if (!field || field.userId !== userId) {
        return res.status(404).json({ error: "Field not found" });
      }
      await storage.deleteField(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting field:", error);
      res.status(500).json({ error: "Failed to delete field" });
    }
  });
  app2.get("/api/livestock", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const livestockData = await storage.getLivestockByUserId(userId);
      res.json(livestockData);
    } catch (error) {
      console.error("Error fetching livestock:", error);
      res.status(500).json({ error: "Failed to fetch livestock" });
    }
  });
  app2.post("/api/livestock", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const validatedData = insertLivestockSchema.parse({
        ...req.body,
        userId
      });
      const livestockItem = await storage.createLivestock(validatedData);
      const feedingPlan = await generateFeedingPlan({
        type: livestockItem.type,
        count: livestockItem.count
      });
      res.status(201).json({ livestock: livestockItem, feedingPlan });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error creating livestock:", error);
      res.status(500).json({ error: "Failed to create livestock" });
    }
  });
  app2.patch("/api/livestock/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const livestockItem = await storage.getLivestock(req.params.id);
      if (!livestockItem || livestockItem.userId !== userId) {
        return res.status(404).json({ error: "Livestock not found" });
      }
      const validatedData = insertLivestockSchema.omit({ userId: true }).partial().parse(req.body);
      const oldCount = livestockItem.count;
      const newCount = validatedData.count !== void 0 ? validatedData.count : oldCount;
      const updated = await storage.updateLivestock(req.params.id, validatedData);
      if (newCount < oldCount) {
        try {
          const feeds = await storage.getFeedsByLivestockId(req.params.id);
          const feedUpdateErrors = [];
          for (const feed of feeds) {
            const currentQuantity = parseFloat(feed.quantity);
            if (isNaN(currentQuantity) || currentQuantity < 0) {
              console.warn(`Invalid feed quantity for feed ${feed.id}: ${feed.quantity}, setting to 0`);
              try {
                await storage.updateFeed(feed.id, { quantity: "0" });
              } catch (feedUpdateError) {
                feedUpdateErrors.push(`Failed to zero invalid feed ${feed.id}`);
              }
              continue;
            }
            let newQuantity;
            if (newCount === 0) {
              newQuantity = "0";
            } else {
              const ratio = newCount / oldCount;
              newQuantity = (currentQuantity * ratio).toFixed(2);
            }
            try {
              await storage.updateFeed(feed.id, { quantity: newQuantity });
            } catch (feedUpdateError) {
              const errorMsg = `Failed to update feed ${feed.id}`;
              console.error(errorMsg, feedUpdateError);
              feedUpdateErrors.push(errorMsg);
            }
          }
          if (feedUpdateErrors.length > 0) {
            console.error(`Feed adjustment failed, rolling back livestock update. Errors: ${feedUpdateErrors.join("; ")}`);
            await storage.updateLivestock(req.params.id, { count: oldCount });
            return res.status(500).json({
              error: "Failed to adjust feed quantities after livestock count change. Operation rolled back.",
              details: feedUpdateErrors
            });
          }
        } catch (feedAdjustmentError) {
          console.error("Error adjusting feeds after livestock count change, rolling back:", feedAdjustmentError);
          try {
            await storage.updateLivestock(req.params.id, { count: oldCount });
          } catch (rollbackError) {
            console.error("CRITICAL: Failed to rollback livestock update:", rollbackError);
          }
          return res.status(500).json({
            error: "Failed to adjust feed quantities after livestock count change. Attempted rollback.",
            message: feedAdjustmentError instanceof Error ? feedAdjustmentError.message : "Unknown error"
          });
        }
      }
      res.json(updated);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error updating livestock:", error);
      res.status(500).json({ error: "Failed to update livestock" });
    }
  });
  app2.delete("/api/livestock/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const livestockItem = await storage.getLivestock(req.params.id);
      if (!livestockItem || livestockItem.userId !== userId) {
        return res.status(404).json({ error: "Livestock not found" });
      }
      await storage.deleteLivestock(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting livestock:", error);
      res.status(500).json({ error: "Failed to delete livestock" });
    }
  });
  app2.get("/api/chat/history", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const messages = await storage.getChatMessagesByUserId(userId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching chat history:", error);
      res.status(500).json({ error: "\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0435 \u0438\u0441\u0442\u043E\u0440\u0438\u0438 \u0447\u0430\u0442\u0430" });
    }
  });
  app2.post("/api/chat/message", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const { content } = req.body;
      if (!content || typeof content !== "string") {
        return res.status(400).json({ error: "\u0421\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435 \u043D\u0435 \u043C\u043E\u0436\u0435\u0442 \u0431\u044B\u0442\u044C \u043F\u0443\u0441\u0442\u044B\u043C" });
      }
      const userMessage = await storage.createChatMessage({
        userId,
        role: "user",
        content
      });
      const chatHistory = await storage.getChatMessagesByUserId(userId);
      const formattedHistory = chatHistory.map((msg) => ({
        role: msg.role,
        content: msg.content
      }));
      const user = await storage.getUser(userId);
      const fields2 = await storage.getFieldsByUserId(userId);
      const livestock2 = await storage.getLivestockByUserId(userId);
      const aiResponse = await chatWithAI(formattedHistory, {
        fields: fields2,
        livestock: livestock2,
        role: user?.role
      });
      const assistantMessage = await storage.createChatMessage({
        userId,
        role: "assistant",
        content: aiResponse
      });
      res.json({
        userMessage,
        assistantMessage
      });
    } catch (error) {
      console.error("Error in chat:", error);
      res.status(500).json({ error: "\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u043E\u0431\u0449\u0435\u043D\u0438\u0438 \u0441 AI" });
    }
  });
  app2.delete("/api/chat/history", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      await storage.deleteChatHistory(userId);
      res.json({ message: "\u0418\u0441\u0442\u043E\u0440\u0438\u044F \u0447\u0430\u0442\u0430 \u0443\u0434\u0430\u043B\u0435\u043D\u0430" });
    } catch (error) {
      console.error("Error deleting chat history:", error);
      res.status(500).json({ error: "\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u0443\u0434\u0430\u043B\u0435\u043D\u0438\u0438 \u0438\u0441\u0442\u043E\u0440\u0438\u0438" });
    }
  });
  app2.get("/api/weather", requireAuth, async (req, res) => {
    try {
      const { latitude, longitude } = req.query;
      if (!latitude || !longitude) {
        return res.status(400).json({ error: "\u041D\u0435\u043E\u0431\u0445\u043E\u0434\u0438\u043C\u043E \u0443\u043A\u0430\u0437\u0430\u0442\u044C \u043A\u043E\u043E\u0440\u0434\u0438\u043D\u0430\u0442\u044B" });
      }
      const weather = await getWeatherByCoordinates(
        parseFloat(latitude),
        parseFloat(longitude)
      );
      res.json(weather);
    } catch (error) {
      console.error("Error fetching weather:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u0438\u0438 \u043F\u043E\u0433\u043E\u0434\u044B" });
    }
  });
  app2.post("/api/fields/:id/analyze", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const field = await storage.getField(req.params.id);
      if (!field || field.userId !== userId) {
        return res.status(404).json({ error: "\u041F\u043E\u043B\u0435 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E" });
      }
      const analysis = await analyzeField({
        name: field.name,
        cropType: field.cropType,
        area: parseFloat(field.area),
        latitude: parseFloat(field.latitude),
        longitude: parseFloat(field.longitude)
      });
      res.json(analysis);
    } catch (error) {
      console.error("Error analyzing field:", error);
      res.status(500).json({ error: "\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u0430\u043D\u0430\u043B\u0438\u0437\u0435 \u043F\u043E\u043B\u044F" });
    }
  });
  app2.get("/api/fields/:id/recommendations/:category", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const { category } = req.params;
      if (!["fertilizer", "soil", "pesticides"].includes(category)) {
        return res.status(400).json({ error: "\u041D\u0435\u0432\u0435\u0440\u043D\u0430\u044F \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u044F" });
      }
      const field = await storage.getField(req.params.id);
      if (!field || field.userId !== userId) {
        return res.status(404).json({ error: "\u041F\u043E\u043B\u0435 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E" });
      }
      const recommendations = await getFieldRecommendations(
        {
          name: field.name,
          cropType: field.cropType,
          area: parseFloat(field.area)
        },
        category
      );
      res.json(recommendations);
    } catch (error) {
      console.error("Error getting recommendations:", error);
      res.status(500).json({ error: "\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u0438\u0438 \u0440\u0435\u043A\u043E\u043C\u0435\u043D\u0434\u0430\u0446\u0438\u0439" });
    }
  });
  app2.post("/api/livestock/:id/feeding-plan", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const livestockItem = await storage.getLivestock(req.params.id);
      if (!livestockItem || livestockItem.userId !== userId) {
        return res.status(404).json({ error: "\u0421\u043A\u043E\u0442 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D" });
      }
      const feedingPlan = await generateFeedingPlan({
        type: livestockItem.type,
        count: livestockItem.count
      });
      res.json(feedingPlan);
    } catch (error) {
      console.error("Error generating feeding plan:", error);
      res.status(500).json({ error: "\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u0441\u043E\u0437\u0434\u0430\u043D\u0438\u0438 \u043F\u043B\u0430\u043D\u0430 \u043A\u043E\u0440\u043C\u043B\u0435\u043D\u0438\u044F" });
    }
  });
  app2.get("/api/livestock/:id/feeds", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const livestockItem = await storage.getLivestock(req.params.id);
      if (!livestockItem || livestockItem.userId !== userId) {
        return res.status(404).json({ error: "\u0421\u043A\u043E\u0442 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D" });
      }
      const feeds = await storage.getFeedsByLivestockId(req.params.id);
      res.json(feeds);
    } catch (error) {
      console.error("Error getting feeds:", error);
      res.status(500).json({ error: "\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u0438\u0438 \u043A\u043E\u0440\u043C\u043E\u0432" });
    }
  });
  app2.post("/api/livestock/:id/feeds", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const livestockItem = await storage.getLivestock(req.params.id);
      if (!livestockItem || livestockItem.userId !== userId) {
        return res.status(404).json({ error: "\u0421\u043A\u043E\u0442 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D" });
      }
      const validatedData = insertFeedInventorySchema.parse({
        ...req.body,
        livestockId: req.params.id
      });
      const feed = await storage.createFeed(validatedData);
      res.status(201).json(feed);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error creating feed:", error);
      res.status(500).json({ error: "\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u0441\u043E\u0437\u0434\u0430\u043D\u0438\u0438 \u043A\u043E\u0440\u043C\u0430" });
    }
  });
  app2.put("/api/feeds/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const feed = await storage.getFeed(req.params.id);
      if (!feed) {
        return res.status(404).json({ error: "\u041A\u043E\u0440\u043C \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D" });
      }
      const livestockItem = await storage.getLivestock(feed.livestockId);
      if (!livestockItem || livestockItem.userId !== userId) {
        return res.status(403).json({ error: "\u0414\u043E\u0441\u0442\u0443\u043F \u0437\u0430\u043F\u0440\u0435\u0449\u0435\u043D" });
      }
      const updatedFeed = await storage.updateFeed(req.params.id, req.body);
      res.json(updatedFeed);
    } catch (error) {
      console.error("Error updating feed:", error);
      res.status(500).json({ error: "\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u0438 \u043A\u043E\u0440\u043C\u0430" });
    }
  });
  app2.delete("/api/feeds/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const feed = await storage.getFeed(req.params.id);
      if (!feed) {
        return res.status(404).json({ error: "\u041A\u043E\u0440\u043C \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D" });
      }
      const livestockItem = await storage.getLivestock(feed.livestockId);
      if (!livestockItem || livestockItem.userId !== userId) {
        return res.status(403).json({ error: "\u0414\u043E\u0441\u0442\u0443\u043F \u0437\u0430\u043F\u0440\u0435\u0449\u0435\u043D" });
      }
      await storage.deleteFeed(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting feed:", error);
      res.status(500).json({ error: "\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u0443\u0434\u0430\u043B\u0435\u043D\u0438\u0438 \u043A\u043E\u0440\u043C\u0430" });
    }
  });
  app2.get("/api/fields/:id/fertilizers", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const field = await storage.getField(req.params.id);
      if (!field || field.userId !== userId) {
        return res.status(404).json({ error: "\u041F\u043E\u043B\u0435 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E" });
      }
      const fertilizers = await storage.getFertilizersByFieldId(req.params.id);
      res.json(fertilizers);
    } catch (error) {
      console.error("Error getting fertilizers:", error);
      res.status(500).json({ error: "\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u0438\u0438 \u0443\u0434\u043E\u0431\u0440\u0435\u043D\u0438\u0439" });
    }
  });
  app2.post("/api/fields/:id/fertilizers", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const field = await storage.getField(req.params.id);
      if (!field || field.userId !== userId) {
        return res.status(404).json({ error: "\u041F\u043E\u043B\u0435 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E" });
      }
      const validatedData = insertFertilizerInventorySchema.parse({
        ...req.body,
        fieldId: req.params.id
      });
      const fertilizer = await storage.createFertilizer(validatedData);
      res.status(201).json(fertilizer);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error creating fertilizer:", error);
      res.status(500).json({ error: "\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u0441\u043E\u0437\u0434\u0430\u043D\u0438\u0438 \u0443\u0434\u043E\u0431\u0440\u0435\u043D\u0438\u044F" });
    }
  });
  app2.put("/api/fertilizers/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const fertilizer = await storage.getFertilizer(req.params.id);
      if (!fertilizer) {
        return res.status(404).json({ error: "\u0423\u0434\u043E\u0431\u0440\u0435\u043D\u0438\u0435 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E" });
      }
      const field = await storage.getField(fertilizer.fieldId);
      if (!field || field.userId !== userId) {
        return res.status(403).json({ error: "\u0414\u043E\u0441\u0442\u0443\u043F \u0437\u0430\u043F\u0440\u0435\u0449\u0435\u043D" });
      }
      const updatedFertilizer = await storage.updateFertilizer(req.params.id, req.body);
      res.json(updatedFertilizer);
    } catch (error) {
      console.error("Error updating fertilizer:", error);
      res.status(500).json({ error: "\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u0438 \u0443\u0434\u043E\u0431\u0440\u0435\u043D\u0438\u044F" });
    }
  });
  app2.delete("/api/fertilizers/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const fertilizer = await storage.getFertilizer(req.params.id);
      if (!fertilizer) {
        return res.status(404).json({ error: "\u0423\u0434\u043E\u0431\u0440\u0435\u043D\u0438\u0435 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E" });
      }
      const field = await storage.getField(fertilizer.fieldId);
      if (!field || field.userId !== userId) {
        return res.status(403).json({ error: "\u0414\u043E\u0441\u0442\u0443\u043F \u0437\u0430\u043F\u0440\u0435\u0449\u0435\u043D" });
      }
      await storage.deleteFertilizer(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting fertilizer:", error);
      res.status(500).json({ error: "\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u0443\u0434\u0430\u043B\u0435\u043D\u0438\u0438 \u0443\u0434\u043E\u0431\u0440\u0435\u043D\u0438\u044F" });
    }
  });
  app2.post("/api/livestock/:id/analyze-feeds", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const livestockItem = await storage.getLivestock(req.params.id);
      if (!livestockItem || livestockItem.userId !== userId) {
        return res.status(404).json({ error: "\u0421\u043A\u043E\u0442 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D" });
      }
      const feeds = await storage.getFeedsByLivestockId(req.params.id);
      const feedsData = feeds.map((f) => ({
        name: f.name,
        quantity: f.quantity.toString(),
        unit: f.unit,
        pricePerUnit: f.pricePerUnit?.toString()
      }));
      const analysis = await analyzeFeedingData(
        {
          type: livestockItem.type,
          count: livestockItem.count
        },
        feedsData
      );
      res.json(analysis);
    } catch (error) {
      console.error("Error analyzing feeds:", error);
      res.status(500).json({ error: "\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u0430\u043D\u0430\u043B\u0438\u0437\u0435 \u043A\u043E\u0440\u043C\u043E\u0432" });
    }
  });
  app2.post("/api/fields/:id/analyze-fertilizers", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const field = await storage.getField(req.params.id);
      if (!field || field.userId !== userId) {
        return res.status(404).json({ error: "\u041F\u043E\u043B\u0435 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E" });
      }
      const fertilizers = await storage.getFertilizersByFieldId(req.params.id);
      const fertilizersData = fertilizers.map((f) => ({
        name: f.name,
        quantity: f.quantity.toString(),
        unit: f.unit,
        pricePerUnit: f.pricePerUnit?.toString(),
        applicationDate: f.applicationDate?.toISOString()
      }));
      const analysis = await analyzeFertilizerData(
        {
          name: field.name,
          cropType: field.cropType,
          area: parseFloat(field.area)
        },
        fertilizersData
      );
      res.json(analysis);
    } catch (error) {
      console.error("Error analyzing fertilizers:", error);
      res.status(500).json({ error: "\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u0430\u043D\u0430\u043B\u0438\u0437\u0435 \u0443\u0434\u043E\u0431\u0440\u0435\u043D\u0438\u0439" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      ),
      await import("@replit/vite-plugin-dev-banner").then(
        (m) => m.devBanner()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
