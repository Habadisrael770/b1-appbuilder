import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, apps, subscriptions, payments, InsertApp, InsertSubscription, InsertPayment } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// App queries
export async function getUserApps(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(apps).where(eq(apps.userId, userId));
}

export async function createApp(app: InsertApp) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(apps).values(app);
}

export async function getAppById(appId: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(apps).where(and(eq(apps.id, appId), eq(apps.userId, userId))).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateApp(appId: number, userId: number, updates: Partial<InsertApp>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(apps).set(updates).where(and(eq(apps.id, appId), eq(apps.userId, userId)));
}

export async function deleteApp(appId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(apps).where(and(eq(apps.id, appId), eq(apps.userId, userId)));
}

// Subscription queries
export async function getUserSubscription(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createSubscription(subscription: InsertSubscription) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(subscriptions).values(subscription);
}

export async function updateSubscription(userId: number, updates: Partial<InsertSubscription>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(subscriptions).set(updates).where(eq(subscriptions.userId, userId));
}

// Payment queries
export async function getUserPayments(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(payments).where(eq(payments.userId, userId));
}

export async function createPayment(payment: InsertPayment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(payments).values(payment);
}

export async function getPaymentByStripeId(stripePaymentId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(payments).where(eq(payments.stripePaymentId, stripePaymentId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Admin queries
export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(users);
}

export async function getAllApps() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(apps);
}

export async function getAllPayments() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(payments);
}
