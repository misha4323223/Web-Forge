import { type User, type InsertUser, type ContactRequest, type InsertContactRequest, type Order, type InsertOrder, type AdditionalInvoice, type InsertAdditionalInvoice, users, contactRequests, orders, additionalInvoices } from "@shared/schema";
import { db } from "./db";
import { eq, isNull, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createContactRequest(request: InsertContactRequest): Promise<ContactRequest>;
  getContactRequests(): Promise<ContactRequest[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  getOrder(id: string): Promise<Order | undefined>;
  updateOrderStatus(id: string, status: string, paidAt?: Date): Promise<Order | undefined>;
  getOrders(): Promise<Order[]>;
  getActiveOrders(): Promise<Order[]>;
  updateOrderNote(id: string, note: string): Promise<Order | undefined>;
  softDeleteOrder(id: string): Promise<Order | undefined>;
  createAdditionalInvoice(invoice: InsertAdditionalInvoice): Promise<AdditionalInvoice>;
  getAdditionalInvoice(id: string): Promise<AdditionalInvoice | undefined>;
  getAdditionalInvoicesByOrderId(orderId: string): Promise<AdditionalInvoice[]>;
  updateAdditionalInvoiceStatus(id: string, status: string, invId?: string, paidAt?: Date): Promise<AdditionalInvoice | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async createContactRequest(request: InsertContactRequest): Promise<ContactRequest> {
    const [contactRequest] = await db.insert(contactRequests).values(request).returning();
    return contactRequest;
  }

  async getContactRequests(): Promise<ContactRequest[]> {
    return db.select().from(contactRequests);
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const [order] = await db.insert(orders).values({
      ...insertOrder,
      status: "pending",
    }).returning();
    return order;
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async updateOrderStatus(id: string, status: string, paidAt?: Date): Promise<Order | undefined> {
    const [order] = await db
      .update(orders)
      .set({ status, paidAt: paidAt || null })
      .where(eq(orders.id, id))
      .returning();
    return order;
  }

  async getOrders(): Promise<Order[]> {
    return db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async getActiveOrders(): Promise<Order[]> {
    return db.select().from(orders).where(isNull(orders.deletedAt)).orderBy(desc(orders.createdAt));
  }

  async updateOrderNote(id: string, note: string): Promise<Order | undefined> {
    const [order] = await db
      .update(orders)
      .set({ internalNote: note })
      .where(eq(orders.id, id))
      .returning();
    return order;
  }

  async softDeleteOrder(id: string): Promise<Order | undefined> {
    const [order] = await db
      .update(orders)
      .set({ deletedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return order;
  }

  async createAdditionalInvoice(insertInvoice: InsertAdditionalInvoice): Promise<AdditionalInvoice> {
    const [invoice] = await db.insert(additionalInvoices).values({
      ...insertInvoice,
      status: "pending",
    }).returning();
    return invoice;
  }

  async getAdditionalInvoice(id: string): Promise<AdditionalInvoice | undefined> {
    const [invoice] = await db.select().from(additionalInvoices).where(eq(additionalInvoices.id, id));
    return invoice;
  }

  async getAdditionalInvoicesByOrderId(orderId: string): Promise<AdditionalInvoice[]> {
    return db.select().from(additionalInvoices).where(eq(additionalInvoices.orderId, orderId));
  }

  async updateAdditionalInvoiceStatus(id: string, status: string, invId?: string, paidAt?: Date): Promise<AdditionalInvoice | undefined> {
    const [invoice] = await db
      .update(additionalInvoices)
      .set({ status, invId: invId || null, paidAt: paidAt || null })
      .where(eq(additionalInvoices.id, id))
      .returning();
    return invoice;
  }
}

export const storage = new DatabaseStorage();
