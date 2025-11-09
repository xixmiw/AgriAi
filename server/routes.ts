import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import { storage } from "./storage";
import { 
  insertFieldSchema, 
  insertLivestockSchema, 
  insertUserSchema,
  loginUserSchema,
  insertChatMessageSchema,
  insertFeedInventorySchema,
  insertFertilizerInventorySchema,
  type User 
} from "@shared/schema";
import { z } from "zod";
import { registerUser, loginUser } from "./auth";
import { chatWithAI } from "./gemini";
import { getWeatherByCoordinates } from "./weather";
import { analyzeField, generateFeedingPlan, getFieldRecommendations, analyzeFeedingData, analyzeFertilizerData } from "./ai-analysis";

declare module 'express-session' {
  interface SessionData {
    userId: string;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "agri-ai-secret-change-in-production",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7,
      },
    })
  );

  const requireAuth = (req: Request, res: any, next: any) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Необходима авторизация" });
    }
    next();
  };

  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const user = await registerUser(validatedData);
      req.session.userId = user.id;
      res.status(201).json({ user });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error registering user:", error);
      res.status(400).json({ error: error instanceof Error ? error.message : "Ошибка регистрации" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const validatedData = loginUserSchema.parse(req.body);
      const user = await loginUser(validatedData);
      req.session.userId = user.id;
      res.json({ user });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error logging in:", error);
      res.status(401).json({ error: error instanceof Error ? error.message : "Ошибка входа" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Ошибка при выходе" });
      }
      res.json({ message: "Успешный выход" });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Не авторизован" });
    }
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ error: "Пользователь не найден" });
      }
      const { password, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Ошибка при получении данных пользователя" });
    }
  });

  app.patch("/api/profile", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const { fullName, email, phone, location, company, avatarUrl } = req.body;
      const updated = await storage.updateUser(userId, {
        fullName,
        email,
        phone,
        location,
        company,
        avatarUrl,
      });
      if (!updated) {
        return res.status(404).json({ error: "Пользователь не найден" });
      }
      const { password, ...userWithoutPassword } = updated;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ error: "Ошибка при обновлении профиля" });
    }
  });

  app.get("/api/fields", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const fields = await storage.getFieldsByUserId(userId);
      res.json(fields);
    } catch (error) {
      console.error("Error fetching fields:", error);
      res.status(500).json({ error: "Failed to fetch fields" });
    }
  });

  app.post("/api/fields", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const validatedData = insertFieldSchema.parse({
        ...req.body,
        userId,
      });
      const field = await storage.createField(validatedData);
      
      const analysis = await analyzeField({
        name: field.name,
        cropType: field.cropType,
        area: parseFloat(field.area),
        latitude: parseFloat(field.latitude),
        longitude: parseFloat(field.longitude),
      });
      
      res.status(201).json({ field, analysis });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error creating field:", error);
      res.status(500).json({ error: "Failed to create field" });
    }
  });

  app.patch("/api/fields/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const field = await storage.getField(req.params.id);
      if (!field || field.userId !== userId) {
        return res.status(404).json({ error: "Field not found" });
      }
      const validatedData = insertFieldSchema.omit({ userId: true }).partial().parse(req.body);
      const updated = await storage.updateField(req.params.id, validatedData);
      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error updating field:", error);
      res.status(500).json({ error: "Failed to update field" });
    }
  });

  app.delete("/api/fields/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
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

  app.get("/api/livestock", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const livestockData = await storage.getLivestockByUserId(userId);
      res.json(livestockData);
    } catch (error) {
      console.error("Error fetching livestock:", error);
      res.status(500).json({ error: "Failed to fetch livestock" });
    }
  });

  app.post("/api/livestock", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const validatedData = insertLivestockSchema.parse({
        ...req.body,
        userId,
      });
      const livestockItem = await storage.createLivestock(validatedData);
      
      const feedingPlan = await generateFeedingPlan({
        type: livestockItem.type,
        count: livestockItem.count,
      });
      
      res.status(201).json({ livestock: livestockItem, feedingPlan });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error creating livestock:", error);
      res.status(500).json({ error: "Failed to create livestock" });
    }
  });

  app.patch("/api/livestock/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const livestockItem = await storage.getLivestock(req.params.id);
      if (!livestockItem || livestockItem.userId !== userId) {
        return res.status(404).json({ error: "Livestock not found" });
      }
      const validatedData = insertLivestockSchema.omit({ userId: true }).partial().parse(req.body);
      
      const oldCount = livestockItem.count;
      const newCount = validatedData.count !== undefined ? validatedData.count : oldCount;
      
      const updated = await storage.updateLivestock(req.params.id, validatedData);
      
      if (newCount < oldCount) {
        try {
          const feeds = await storage.getFeedsByLivestockId(req.params.id);
          const feedUpdateErrors: string[] = [];
          
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
            
            let newQuantity: string;
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
            console.error(`Feed adjustment failed, rolling back livestock update. Errors: ${feedUpdateErrors.join('; ')}`);
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
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error updating livestock:", error);
      res.status(500).json({ error: "Failed to update livestock" });
    }
  });

  app.delete("/api/livestock/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
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

  app.get("/api/chat/history", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const messages = await storage.getChatMessagesByUserId(userId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching chat history:", error);
      res.status(500).json({ error: "Ошибка при загрузке истории чата" });
    }
  });

  app.post("/api/chat/message", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const { content } = req.body;

      if (!content || typeof content !== 'string') {
        return res.status(400).json({ error: "Сообщение не может быть пустым" });
      }

      const userMessage = await storage.createChatMessage({
        userId,
        role: "user",
        content,
      });

      const chatHistory = await storage.getChatMessagesByUserId(userId);
      const formattedHistory = chatHistory.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      const user = await storage.getUser(userId);
      const fields = await storage.getFieldsByUserId(userId);
      const livestock = await storage.getLivestockByUserId(userId);

      const aiResponse = await chatWithAI(formattedHistory, {
        fields,
        livestock,
        role: user?.role,
      });

      const assistantMessage = await storage.createChatMessage({
        userId,
        role: "assistant",
        content: aiResponse,
      });

      res.json({
        userMessage,
        assistantMessage,
      });
    } catch (error) {
      console.error("Error in chat:", error);
      res.status(500).json({ error: "Ошибка при общении с AI" });
    }
  });

  app.delete("/api/chat/history", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      await storage.deleteChatHistory(userId);
      res.json({ message: "История чата удалена" });
    } catch (error) {
      console.error("Error deleting chat history:", error);
      res.status(500).json({ error: "Ошибка при удалении истории" });
    }
  });

  app.get("/api/weather", requireAuth, async (req, res) => {
    try {
      const { latitude, longitude } = req.query;
      
      if (!latitude || !longitude) {
        return res.status(400).json({ error: "Необходимо указать координаты" });
      }
      
      const weather = await getWeatherByCoordinates(
        parseFloat(latitude as string),
        parseFloat(longitude as string)
      );
      
      res.json(weather);
    } catch (error) {
      console.error("Error fetching weather:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Ошибка при получении погоды" });
    }
  });

  app.post("/api/fields/:id/analyze", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const field = await storage.getField(req.params.id);
      
      if (!field || field.userId !== userId) {
        return res.status(404).json({ error: "Поле не найдено" });
      }
      
      const analysis = await analyzeField({
        name: field.name,
        cropType: field.cropType,
        area: parseFloat(field.area),
        latitude: parseFloat(field.latitude),
        longitude: parseFloat(field.longitude),
      });
      
      res.json(analysis);
    } catch (error) {
      console.error("Error analyzing field:", error);
      res.status(500).json({ error: "Ошибка при анализе поля" });
    }
  });

  app.get("/api/fields/:id/recommendations/:category", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const { category } = req.params;
      
      if (!['fertilizer', 'soil', 'pesticides'].includes(category)) {
        return res.status(400).json({ error: "Неверная категория" });
      }
      
      const field = await storage.getField(req.params.id);
      
      if (!field || field.userId !== userId) {
        return res.status(404).json({ error: "Поле не найдено" });
      }
      
      const recommendations = await getFieldRecommendations(
        {
          name: field.name,
          cropType: field.cropType,
          area: parseFloat(field.area),
        },
        category as "fertilizer" | "soil" | "pesticides"
      );
      
      res.json(recommendations);
    } catch (error) {
      console.error("Error getting recommendations:", error);
      res.status(500).json({ error: "Ошибка при получении рекомендаций" });
    }
  });

  app.post("/api/livestock/:id/feeding-plan", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const livestockItem = await storage.getLivestock(req.params.id);
      
      if (!livestockItem || livestockItem.userId !== userId) {
        return res.status(404).json({ error: "Скот не найден" });
      }
      
      const feedingPlan = await generateFeedingPlan({
        type: livestockItem.type,
        count: livestockItem.count,
      });
      
      res.json(feedingPlan);
    } catch (error) {
      console.error("Error generating feeding plan:", error);
      res.status(500).json({ error: "Ошибка при создании плана кормления" });
    }
  });

  app.get("/api/livestock/:id/feeds", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const livestockItem = await storage.getLivestock(req.params.id);
      
      if (!livestockItem || livestockItem.userId !== userId) {
        return res.status(404).json({ error: "Скот не найден" });
      }
      
      const feeds = await storage.getFeedsByLivestockId(req.params.id);
      res.json(feeds);
    } catch (error) {
      console.error("Error getting feeds:", error);
      res.status(500).json({ error: "Ошибка при получении кормов" });
    }
  });

  app.post("/api/livestock/:id/feeds", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const livestockItem = await storage.getLivestock(req.params.id);
      
      if (!livestockItem || livestockItem.userId !== userId) {
        return res.status(404).json({ error: "Скот не найден" });
      }
      
      const validatedData = insertFeedInventorySchema.parse({
        ...req.body,
        livestockId: req.params.id,
      });
      
      const feed = await storage.createFeed(validatedData);
      res.status(201).json(feed);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error creating feed:", error);
      res.status(500).json({ error: "Ошибка при создании корма" });
    }
  });

  app.put("/api/feeds/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const feed = await storage.getFeed(req.params.id);
      
      if (!feed) {
        return res.status(404).json({ error: "Корм не найден" });
      }
      
      const livestockItem = await storage.getLivestock(feed.livestockId);
      if (!livestockItem || livestockItem.userId !== userId) {
        return res.status(403).json({ error: "Доступ запрещен" });
      }
      
      const updatedFeed = await storage.updateFeed(req.params.id, req.body);
      res.json(updatedFeed);
    } catch (error) {
      console.error("Error updating feed:", error);
      res.status(500).json({ error: "Ошибка при обновлении корма" });
    }
  });

  app.delete("/api/feeds/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const feed = await storage.getFeed(req.params.id);
      
      if (!feed) {
        return res.status(404).json({ error: "Корм не найден" });
      }
      
      const livestockItem = await storage.getLivestock(feed.livestockId);
      if (!livestockItem || livestockItem.userId !== userId) {
        return res.status(403).json({ error: "Доступ запрещен" });
      }
      
      await storage.deleteFeed(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting feed:", error);
      res.status(500).json({ error: "Ошибка при удалении корма" });
    }
  });


  app.get("/api/fields/:id/fertilizers", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const field = await storage.getField(req.params.id);
      
      if (!field || field.userId !== userId) {
        return res.status(404).json({ error: "Поле не найдено" });
      }
      
      const fertilizers = await storage.getFertilizersByFieldId(req.params.id);
      res.json(fertilizers);
    } catch (error) {
      console.error("Error getting fertilizers:", error);
      res.status(500).json({ error: "Ошибка при получении удобрений" });
    }
  });

  app.post("/api/fields/:id/fertilizers", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const field = await storage.getField(req.params.id);
      
      if (!field || field.userId !== userId) {
        return res.status(404).json({ error: "Поле не найдено" });
      }
      
      const validatedData = insertFertilizerInventorySchema.parse({
        ...req.body,
        fieldId: req.params.id,
      });
      
      const fertilizer = await storage.createFertilizer(validatedData);
      res.status(201).json(fertilizer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error creating fertilizer:", error);
      res.status(500).json({ error: "Ошибка при создании удобрения" });
    }
  });

  app.put("/api/fertilizers/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const fertilizer = await storage.getFertilizer(req.params.id);
      
      if (!fertilizer) {
        return res.status(404).json({ error: "Удобрение не найдено" });
      }
      
      const field = await storage.getField(fertilizer.fieldId);
      if (!field || field.userId !== userId) {
        return res.status(403).json({ error: "Доступ запрещен" });
      }
      
      const updatedFertilizer = await storage.updateFertilizer(req.params.id, req.body);
      res.json(updatedFertilizer);
    } catch (error) {
      console.error("Error updating fertilizer:", error);
      res.status(500).json({ error: "Ошибка при обновлении удобрения" });
    }
  });

  app.delete("/api/fertilizers/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const fertilizer = await storage.getFertilizer(req.params.id);
      
      if (!fertilizer) {
        return res.status(404).json({ error: "Удобрение не найдено" });
      }
      
      const field = await storage.getField(fertilizer.fieldId);
      if (!field || field.userId !== userId) {
        return res.status(403).json({ error: "Доступ запрещен" });
      }
      
      await storage.deleteFertilizer(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting fertilizer:", error);
      res.status(500).json({ error: "Ошибка при удалении удобрения" });
    }
  });

  app.post("/api/livestock/:id/analyze-feeds", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const livestockItem = await storage.getLivestock(req.params.id);
      
      if (!livestockItem || livestockItem.userId !== userId) {
        return res.status(404).json({ error: "Скот не найден" });
      }
      
      const feeds = await storage.getFeedsByLivestockId(req.params.id);
      const feedsData = feeds.map(f => ({
        name: f.name,
        quantity: f.quantity.toString(),
        unit: f.unit,
        pricePerUnit: f.pricePerUnit?.toString(),
      }));
      
      const analysis = await analyzeFeedingData(
        {
          type: livestockItem.type,
          count: livestockItem.count,
        },
        feedsData
      );
      
      res.json(analysis);
    } catch (error) {
      console.error("Error analyzing feeds:", error);
      res.status(500).json({ error: "Ошибка при анализе кормов" });
    }
  });

  app.post("/api/fields/:id/analyze-fertilizers", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const field = await storage.getField(req.params.id);
      
      if (!field || field.userId !== userId) {
        return res.status(404).json({ error: "Поле не найдено" });
      }
      
      const fertilizers = await storage.getFertilizersByFieldId(req.params.id);
      const fertilizersData = fertilizers.map(f => ({
        name: f.name,
        quantity: f.quantity.toString(),
        unit: f.unit,
        pricePerUnit: f.pricePerUnit?.toString(),
        applicationDate: f.applicationDate?.toISOString(),
      }));
      
      const analysis = await analyzeFertilizerData(
        {
          name: field.name,
          cropType: field.cropType,
          area: parseFloat(field.area),
        },
        fertilizersData
      );
      
      res.json(analysis);
    } catch (error) {
      console.error("Error analyzing fertilizers:", error);
      res.status(500).json({ error: "Ошибка при анализе удобрений" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
