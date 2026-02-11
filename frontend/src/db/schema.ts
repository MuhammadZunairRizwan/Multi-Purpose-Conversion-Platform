import {
  pgTable,
  text,
  timestamp,
  integer,
  jsonb,
  uuid,
  date,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const tierEnum = pgEnum("tier", ["FREE", "STARTER", "PRO"]);
export const conversionTypeEnum = pgEnum("conversion_type", ["FILE", "CURRENCY", "UNIT"]);
export const conversionStatusEnum = pgEnum("conversion_status", ["SUCCESS", "FAILED"]);
export const documentTypeEnum = pgEnum("document_type", ["INVOICE", "RECEIPT", "NDA", "EMPLOYMENT_LETTER"]);
export const subscriptionStatusEnum = pgEnum("subscription_status", ["ACTIVE", "CANCELED", "PAST_DUE", "TRIALING"]);

// Users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkId: text("clerk_id").unique().notNull(),
  email: text("email").notNull(),
  tier: tierEnum("tier").notNull().default("FREE"),
  stripeCustomerId: text("stripe_customer_id").unique(),
  stripeSubscriptionId: text("stripe_subscription_id").unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Subscriptions table - tracks Stripe subscriptions
export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  stripeSubscriptionId: text("stripe_subscription_id").unique().notNull(),
  stripePriceId: text("stripe_price_id").notNull(),
  status: subscriptionStatusEnum("status").notNull().default("ACTIVE"),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Conversion Usage table - tracks daily conversion count
export const conversionUsage = pgTable("conversion_usage", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  conversionType: conversionTypeEnum("conversion_type").notNull(),
  date: date("date").notNull(),
  count: integer("count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Conversion History table - logs all conversions
export const conversionHistory = pgTable("conversion_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  conversionType: text("conversion_type").notNull(),
  inputData: jsonb("input_data"),
  outputData: jsonb("output_data"),
  status: conversionStatusEnum("status").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Calculator Usage table - logs calculator usage
export const calculatorUsage = pgTable("calculator_usage", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  calculatorType: text("calculator_type").notNull(),
  data: jsonb("data"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Document History table - tracks document generation history for Starter/Pro tiers
export const documentHistory = pgTable("document_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkId: text("clerk_id").notNull(),
  documentType: text("document_type").notNull(),
  documentId: text("document_id").notNull(),
  documentName: text("document_name").notNull(),
  tier: text("tier").notNull().default("FREE"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Anonymous Usage table - tracks file conversions by IP for non-logged-in users
export const anonymousUsage = pgTable("anonymous_usage", {
  id: uuid("id").primaryKey().defaultRandom(),
  ipAddress: text("ip_address").notNull(),
  date: date("date").notNull(),
  conversionCount: integer("conversion_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  conversionUsage: many(conversionUsage),
  conversionHistory: many(conversionHistory),
  calculatorUsage: many(calculatorUsage),
  documentHistory: many(documentHistory),
  subscription: one(subscriptions),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
}));

export const conversionUsageRelations = relations(conversionUsage, ({ one }) => ({
  user: one(users, {
    fields: [conversionUsage.userId],
    references: [users.id],
  }),
}));

export const conversionHistoryRelations = relations(conversionHistory, ({ one }) => ({
  user: one(users, {
    fields: [conversionHistory.userId],
    references: [users.id],
  }),
}));

export const calculatorUsageRelations = relations(calculatorUsage, ({ one }) => ({
  user: one(users, {
    fields: [calculatorUsage.userId],
    references: [users.id],
  }),
}));

export const documentHistoryRelations = relations(documentHistory, ({ one }) => ({
  user: one(users, {
    fields: [documentHistory.clerkId],
    references: [users.clerkId],
  }),
}));
