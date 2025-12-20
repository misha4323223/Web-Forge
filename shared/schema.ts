import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const contactRequests = pgTable("contact_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  projectType: text("project_type"),
  budget: text("budget"),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertContactRequestSchema = createInsertSchema(contactRequests).pick({
  name: true,
  phone: true,
  email: true,
  projectType: true,
  budget: true,
  message: true,
}).extend({
  name: z.string().min(2, "Имя должно содержать минимум 2 символа"),
  phone: z.string().min(10, "Введите корректный номер телефона"),
  email: z.string().email("Введите корректный email"),
  projectType: z.string().optional(),
  budget: z.string().optional(),
  message: z.string().min(10, "Сообщение должно содержать минимум 10 символов"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertContactRequest = z.infer<typeof insertContactRequestSchema>;
export type ContactRequest = typeof contactRequests.$inferSelect;

export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientName: text("client_name").notNull(),
  clientEmail: text("client_email").notNull(),
  clientPhone: text("client_phone").notNull(),
  projectType: text("project_type").notNull(),
  projectDescription: text("project_description").notNull(),
  amount: text("amount").notNull(),
  totalAmount: text("total_amount"),
  selectedFeatures: text("selected_features"),
  status: text("status").notNull().default("pending"),
  contractAccepted: timestamp("contract_accepted"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow(),
  internalNote: text("internal_note"),
  deletedAt: timestamp("deleted_at"),
  paymentMethod: text("payment_method").default("card"),
  companyName: text("company_name"),
  companyInn: text("company_inn"),
  companyKpp: text("company_kpp"),
  companyAddress: text("company_address"),
  prepaymentPaidAt: timestamp("prepayment_paid_at"),
  remainingPaidAt: timestamp("remaining_paid_at"),
});

export const insertOrderSchema = createInsertSchema(orders).pick({
  clientName: true,
  clientEmail: true,
  clientPhone: true,
  projectType: true,
  projectDescription: true,
  amount: true,
}).extend({
  clientName: z.string().min(2, "Имя должно содержать минимум 2 символа"),
  clientEmail: z.string().email("Введите корректный email"),
  clientPhone: z.string().min(10, "Введите корректный телефон"),
  projectType: z.enum(["landing", "corporate", "shop"]),
  projectDescription: z.string().min(10, "Опишите проект подробнее"),
  amount: z.string(),
  totalAmount: z.string().optional(),
  selectedFeatures: z.string().optional(),
  paymentMethod: z.enum(["card", "invoice"]).optional(),
  companyName: z.string().optional(),
  companyInn: z.string().optional(),
  companyKpp: z.string().optional(),
  companyAddress: z.string().optional(),
});

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

export const additionalInvoices = pgTable("additional_invoices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").notNull(),
  description: text("description").notNull(),
  amount: text("amount").notNull(),
  status: text("status").notNull().default("pending"),
  invId: text("inv_id"),
  invoiceNumber: text("invoice_number"),
  paymentMethod: text("payment_method").default("card"),
  createdAt: timestamp("created_at").defaultNow(),
  paidAt: timestamp("paid_at"),
});

export const insertAdditionalInvoiceSchema = createInsertSchema(additionalInvoices).pick({
  orderId: true,
  description: true,
  amount: true,
}).extend({
  orderId: z.string().min(1, "ID заказа обязателен"),
  description: z.string().min(5, "Описание должно быть минимум 5 символов"),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Сумма должна быть числом"),
});

export type InsertAdditionalInvoice = z.infer<typeof insertAdditionalInvoiceSchema>;
export type AdditionalInvoice = typeof additionalInvoices.$inferSelect;

export const insertCalculatorOrderSchema = z.object({
  name: z.string().min(2, "Имя должно содержать минимум 2 символа"),
  phone: z.string().min(10, "Введите корректный номер телефона"),
  email: z.string().email("Введите корректный email"),
  projectType: z.string().min(1, "Выберите основу"),
  selectedFeatures: z.array(z.string()).default([]),
  basePrice: z.number().positive(),
  totalPrice: z.number().positive(),
  description: z.string().min(10, "Описание должно содержать минимум 10 символов"),
});

export type InsertCalculatorOrder = z.infer<typeof insertCalculatorOrderSchema>;

export const insertChatMessageSchema = z.object({
  message: z.string().min(1, "Сообщение не может быть пусто").max(2000, "Сообщение слишком длинное"),
});

export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
