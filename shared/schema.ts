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
  email: text("email").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertContactRequestSchema = createInsertSchema(contactRequests).pick({
  name: true,
  email: true,
  message: true,
}).extend({
  name: z.string().min(2, "Имя должно содержать минимум 2 символа"),
  email: z.string().email("Введите корректный email"),
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
});

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;
