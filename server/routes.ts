import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactRequestSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.post("/api/contact", async (req, res) => {
    try {
      const validatedData = insertContactRequestSchema.parse(req.body);
      const contactRequest = await storage.createContactRequest(validatedData);
      
      console.log("New contact request received:", {
        name: contactRequest.name,
        email: contactRequest.email,
        message: contactRequest.message.substring(0, 50) + "...",
      });

      res.status(201).json({
        success: true,
        message: "Заявка успешно отправлена",
        id: contactRequest.id,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: "Ошибка валидации",
          errors: error.errors,
        });
      } else {
        console.error("Error creating contact request:", error);
        res.status(500).json({
          success: false,
          message: "Внутренняя ошибка сервера",
        });
      }
    }
  });

  app.get("/api/contact", async (req, res) => {
    try {
      const requests = await storage.getContactRequests();
      res.json(requests);
    } catch (error) {
      console.error("Error fetching contact requests:", error);
      res.status(500).json({
        success: false,
        message: "Внутренняя ошибка сервера",
      });
    }
  });

  return httpServer;
}
