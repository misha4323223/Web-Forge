import { type User, type InsertUser, type ContactRequest, type InsertContactRequest, type Order, type InsertOrder, users, contactRequests, orders } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

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
    return db.select().from(orders);
  }
}

export const storage = new DatabaseStorage();
