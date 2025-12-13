import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactRequestSchema, insertOrderSchema } from "@shared/schema";
import { z } from "zod";
import crypto from "crypto";

const ROBOKASSA_MERCHANT_LOGIN = process.env.ROBOKASSA_MERCHANT_LOGIN || "";
const ROBOKASSA_PASSWORD1 = process.env.ROBOKASSA_PASSWORD1 || "";
const ROBOKASSA_PASSWORD2 = process.env.ROBOKASSA_PASSWORD2 || "";
const IS_TEST_MODE = true;

let orderCounter = 1;

function getNextInvId(): number {
  return orderCounter++;
}

function generateRobokassaSignature(merchantLogin: string, sum: string, invId: number, password: string, shpOrderId: string): string {
  const signatureString = `${merchantLogin}:${sum}:${invId}:${password}:shp_orderId=${shpOrderId}`;
  return crypto.createHash("md5").update(signatureString).digest("hex");
}

function verifyRobokassaSignature(sum: string, invId: string, signatureValue: string, shpOrderId: string): boolean {
  const signatureString = `${sum}:${invId}:${ROBOKASSA_PASSWORD2}:shp_orderId=${shpOrderId}`;
  const calculatedSignature = crypto.createHash("md5").update(signatureString).digest("hex");
  return calculatedSignature.toLowerCase() === signatureValue.toLowerCase();
}

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

  app.post("/api/orders", async (req, res) => {
    try {
      const validatedData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(validatedData);
      
      console.log("New order created:", {
        id: order.id,
        clientName: order.clientName,
        projectType: order.projectType,
        amount: order.amount,
      });

      const invId = getNextInvId();
      const sum = parseFloat(order.amount).toFixed(2);
      const description = `Заказ сайта: ${order.projectType}`;
      
      const signatureValue = generateRobokassaSignature(
        ROBOKASSA_MERCHANT_LOGIN,
        sum,
        invId,
        ROBOKASSA_PASSWORD1,
        order.id
      );

      const baseUrl = "https://auth.robokassa.ru/Merchant/Index.aspx";
      
      const paymentUrl = `${baseUrl}?MerchantLogin=${ROBOKASSA_MERCHANT_LOGIN}&OutSum=${sum}&InvId=${invId}&Description=${encodeURIComponent(description)}&SignatureValue=${signatureValue}&IsTest=${IS_TEST_MODE ? 1 : 0}&shp_orderId=${order.id}`;

      res.status(201).json({
        success: true,
        message: "Заказ создан",
        orderId: order.id,
        paymentUrl,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: "Ошибка валидации",
          errors: error.errors,
        });
      } else {
        console.error("Error creating order:", error);
        res.status(500).json({
          success: false,
          message: "Внутренняя ошибка сервера",
        });
      }
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Заказ не найден",
        });
      }
      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({
        success: false,
        message: "Внутренняя ошибка сервера",
      });
    }
  });

  app.post("/api/robokassa/result", async (req, res) => {
    try {
      const OutSum = req.body.OutSum || req.query.OutSum;
      const InvId = req.body.InvId || req.query.InvId;
      const SignatureValue = req.body.SignatureValue || req.query.SignatureValue;
      const shp_orderId = req.body.shp_orderId || req.query.shp_orderId;
      
      console.log("Robokassa result callback:", { OutSum, InvId, shp_orderId });
      
      if (!verifyRobokassaSignature(OutSum, InvId, SignatureValue, shp_orderId)) {
        console.error("Invalid Robokassa signature");
        return res.status(400).send("bad sign");
      }

      const order = await storage.getOrder(shp_orderId);
      if (!order) {
        console.error("Order not found:", shp_orderId);
        return res.status(404).send("order not found");
      }

      await storage.updateOrderStatus(shp_orderId, "paid", new Date());
      
      console.log("Order paid successfully:", shp_orderId);
      
      res.send(`OK${InvId}`);
    } catch (error) {
      console.error("Error processing Robokassa result:", error);
      res.status(500).send("error");
    }
  });

  app.get("/api/robokassa/success", async (req, res) => {
    const { shp_orderId } = req.query;
    res.redirect(`/payment-success?orderId=${shp_orderId}`);
  });

  app.get("/api/robokassa/fail", async (req, res) => {
    const { shp_orderId } = req.query;
    res.redirect(`/payment-fail?orderId=${shp_orderId}`);
  });

  return httpServer;
}
