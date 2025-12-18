import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactRequestSchema, insertOrderSchema, insertAdditionalInvoiceSchema } from "@shared/schema";
import { z } from "zod";
import crypto from "crypto";

const ROBOKASSA_MERCHANT_LOGIN = process.env.ROBOKASSA_MERCHANT_LOGIN || "";
const ROBOKASSA_PASSWORD1 = process.env.ROBOKASSA_PASSWORD1 || "";
const ROBOKASSA_PASSWORD2 = process.env.ROBOKASSA_PASSWORD2 || "";
const IS_TEST_MODE = true;

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || "";
const SITE_URL = process.env.SITE_URL || "https://mp-webstudio.ru";

async function sendTelegramMessage(message: string): Promise<void> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.log("Telegram not configured, skipping notification");
    return;
  }
  
  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: "HTML",
      }),
    });
  } catch (error) {
    console.error("Failed to send Telegram message:", error);
  }
}

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

      await sendTelegramMessage(
        `📩 <b>Новая заявка с сайта!</b>\n\n` +
        `👤 Имя: ${contactRequest.name}\n` +
        `📧 Email: ${contactRequest.email}\n` +
        `💬 Сообщение:\n${contactRequest.message}`
      );

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

  app.get("/api/orders", async (req, res) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({
        success: false,
        message: "Внутренняя ошибка сервера",
      });
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

      const projectTypeLabel = order.projectType === "landing" ? "Лендинг" : 
                              order.projectType === "corporate" ? "Корпоративный сайт" : "Интернет-магазин";
      
      if (order.status === "paid") {
        await storage.updateOrderStatus(shp_orderId, "completed", new Date());
        console.log("Order fully paid (remaining):", shp_orderId);
        
        await sendTelegramMessage(
          `✅ <b>Заказ полностью оплачен!</b>\n\n` +
          `👤 Клиент: ${order.clientName}\n` +
          `📧 Email: ${order.clientEmail}\n` +
          `📱 Телефон: ${order.clientPhone}\n` +
          `🌐 Тип: ${projectTypeLabel}\n` +
          `💰 Сумма: ${OutSum} ₽ (остаток)\n` +
          `📋 Заказ: ${shp_orderId.substring(0, 8).toUpperCase()}`
        );
      } else {
        await storage.updateOrderStatus(shp_orderId, "paid", new Date());
        console.log("Order prepaid successfully:", shp_orderId);
        
        const payRemainingLink = `${SITE_URL}/pay-remaining?orderId=${shp_orderId}`;
        
        await sendTelegramMessage(
          `💳 <b>Получена предоплата!</b>\n\n` +
          `👤 Клиент: ${order.clientName}\n` +
          `📧 Email: ${order.clientEmail}\n` +
          `📱 Телефон: ${order.clientPhone}\n` +
          `🌐 Тип: ${projectTypeLabel}\n` +
          `💰 Сумма: ${OutSum} ₽ (50%)\n` +
          `📋 Заказ: ${shp_orderId.substring(0, 8).toUpperCase()}\n\n` +
          `🔗 Ссылка для оплаты остатка:\n${payRemainingLink}`
        );
      }
      
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

  app.post("/api/orders/pay-remaining", async (req, res) => {
    try {
      const { orderId } = req.body;
      
      if (!orderId) {
        return res.status(400).json({
          success: false,
          message: "Не указан номер заказа",
        });
      }

      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Заказ не найден",
        });
      }

      if (order.status === "completed") {
        return res.status(400).json({
          success: false,
          message: "Заказ уже полностью оплачен",
        });
      }

      if (order.status !== "paid") {
        return res.status(400).json({
          success: false,
          message: "Предоплата по заказу не подтверждена",
        });
      }

      const invId = getNextInvId();
      const remainingAmount = parseFloat(order.amount).toFixed(2);
      const description = `Оплата остатка: ${order.projectType}`;
      
      const signatureValue = generateRobokassaSignature(
        ROBOKASSA_MERCHANT_LOGIN,
        remainingAmount,
        invId,
        ROBOKASSA_PASSWORD1,
        order.id
      );

      const baseUrl = "https://auth.robokassa.ru/Merchant/Index.aspx";
      
      const paymentUrl = `${baseUrl}?MerchantLogin=${ROBOKASSA_MERCHANT_LOGIN}&OutSum=${remainingAmount}&InvId=${invId}&Description=${encodeURIComponent(description)}&SignatureValue=${signatureValue}&IsTest=${IS_TEST_MODE ? 1 : 0}&shp_orderId=${order.id}`;

      res.json({
        success: true,
        message: "Ссылка на оплату сформирована",
        orderId: order.id,
        amount: remainingAmount,
        paymentUrl,
      });
    } catch (error) {
      console.error("Error creating remaining payment:", error);
      res.status(500).json({
        success: false,
        message: "Внутренняя ошибка сервера",
      });
    }
  });

  app.post("/api/additional-invoices", async (req, res) => {
    try {
      console.log("Creating additional invoice with data:", req.body);
      
      const validatedData = insertAdditionalInvoiceSchema.parse(req.body);
      console.log("Validated data:", validatedData);
      
      // Проверяем, существует ли заказ
      const order = await storage.getOrder(validatedData.orderId);
      console.log("Order lookup result:", order);
      
      if (!order) {
        console.log("Order not found for ID:", validatedData.orderId);
        return res.status(404).json({
          success: false,
          message: "Заказ не найден. Проверьте ID заказа",
        });
      }
      
      console.log("Creating invoice in database...");
      const invoice = await storage.createAdditionalInvoice(validatedData);
      console.log("Invoice created:", invoice);
      
      const invId = getNextInvId();
      const sum = parseFloat(invoice.amount).toFixed(2);
      const description = `Доп. счёт: ${invoice.description}`;
      
      const signatureValue = generateRobokassaSignature(
        ROBOKASSA_MERCHANT_LOGIN,
        sum,
        invId,
        ROBOKASSA_PASSWORD1,
        invoice.id
      );

      const baseUrl = "https://auth.robokassa.ru/Merchant/Index.aspx";
      const paymentUrl = `${baseUrl}?MerchantLogin=${ROBOKASSA_MERCHANT_LOGIN}&OutSum=${sum}&InvId=${invId}&Description=${encodeURIComponent(description)}&SignatureValue=${signatureValue}&IsTest=${IS_TEST_MODE ? 1 : 0}&shp_orderId=${invoice.id}`;

      console.log("Updating invoice status...");
      await storage.updateAdditionalInvoiceStatus(invoice.id, "pending", String(invId));
      console.log("Invoice status updated. Payment URL:", paymentUrl);

      res.status(201).json({
        success: true,
        message: "Счёт создан",
        invoiceId: invoice.id,
        paymentUrl,
      });
    } catch (error) {
      console.error("Error creating additional invoice:", error);
      if (error instanceof z.ZodError) {
        console.error("Validation errors:", error.errors);
        res.status(400).json({
          success: false,
          message: "Ошибка валидации",
          errors: error.errors,
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Внутренняя ошибка сервера",
        });
      }
    }
  });

  app.get("/api/additional-invoices/order/:orderId", async (req, res) => {
    try {
      const invoices = await storage.getAdditionalInvoicesByOrderId(req.params.orderId);
      res.json(invoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      res.status(500).json({
        success: false,
        message: "Внутренняя ошибка сервера",
      });
    }
  });

  app.post("/api/robokassa/additional-invoice", async (req, res) => {
    try {
      const OutSum = req.body.OutSum || req.query.OutSum;
      const InvId = req.body.InvId || req.query.InvId;
      const SignatureValue = req.body.SignatureValue || req.query.SignatureValue;
      const shp_orderId = req.body.shp_orderId || req.query.shp_orderId;
      
      console.log("Robokassa additional invoice callback:", { OutSum, InvId, shp_orderId });
      
      if (!verifyRobokassaSignature(OutSum, InvId, SignatureValue, shp_orderId)) {
        console.error("Invalid Robokassa signature for additional invoice");
        return res.status(400).send("bad sign");
      }

      const invoice = await storage.getAdditionalInvoice(shp_orderId);
      if (!invoice) {
        console.error("Invoice not found:", shp_orderId);
        return res.status(404).send("invoice not found");
      }

      const order = await storage.getOrder(invoice.orderId);
      if (!order) {
        console.error("Order not found:", invoice.orderId);
        return res.status(404).send("order not found");
      }

      await storage.updateAdditionalInvoiceStatus(invoice.id, "paid", String(InvId), new Date());

      await sendTelegramMessage(
        `💳 <b>Дополнительный счёт оплачен!</b>\n\n` +
        `👤 Клиент: ${order.clientName}\n` +
        `📋 Счёт: ${invoice.description}\n` +
        `💰 Сумма: ${OutSum} ₽\n` +
        `📧 Email: ${order.clientEmail}`
      );
      
      res.send(`OK${InvId}`);
    } catch (error) {
      console.error("Error processing additional invoice payment:", error);
      res.status(500).send("error");
    }
  });

  return httpServer;
}
