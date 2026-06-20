import { 
  pgTable, 
  text, 
  timestamp, 
  boolean, 
  integer, 
  jsonb, 
  uuid,
  primaryKey,
  index,
  customType
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import type { AdapterAccountType } from "next-auth/adapters"; // Required for strict Auth.js typing

// ==========================================
// CUSTOM TYPES & UTILS
// ==========================================
const customVector = customType<{ data: number[]; driverData: string }>({
  dataType() {
    return "vector(1536)"; 
  },
});

// ==========================================
// 1. AUTH.JS CORE (Strict OAuth Requirements)
// ==========================================

export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()), // Auth.js standardizes on text-based UUIDs
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  isBanned: boolean("is_banned").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const accounts = pgTable("accounts", {
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").$type<AdapterAccountType>().notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("providerAccountId").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
}, (account) => ({
  compoundKey: primaryKey({ columns: [account.provider, account.providerAccountId] }),
}));

export const sessions = pgTable("sessions", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable("verificationTokens", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
}, (vt) => ({
  compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
}));

// ==========================================
// 2. IDENTITY, RBAC & API ECONOMY
// ==========================================

export const roles = pgTable("roles", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(), 
  permissions: jsonb("permissions").notNull().default({}), 
  isSystem: boolean("is_system").default(false), 
});

export const userRoles = pgTable("user_roles", {
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  roleId: uuid("role_id").notNull().references(() => roles.id, { onDelete: "cascade" }),
}, (t) => ({
  pk: primaryKey({ columns: [t.userId, t.roleId] }),
}));

export const apiKeys = pgTable("api_keys", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(), // e.g., "Discord Bot Trigger"
  keyHash: text("key_hash").notNull().unique(), // Never store raw keys!
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const profiles = pgTable("profiles", {
  userId: text("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  bio: text("bio"),
  resumeUrl: text("resume_url"),
  githubUsername: text("github_username"),
  leetcodeUsername: text("leetcode_username"),
  openToWork: boolean("open_to_work").default(false),
  openToCollaborate: boolean("open_to_collaborate").default(true),
  proofOfWorkXp: integer("proof_of_work_xp").default(0), // The Gamification Engine Score
});

export const achievements = pgTable("achievements", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  badgeName: text("badge_name").notNull(),
  cryptographicHash: text("cryptographic_hash").unique().notNull(),
  issuedBy: text("issued_by").references(() => users.id),
  issuedAt: timestamp("issued_at").defaultNow().notNull(),
});

export const mentorshipPairs = pgTable("mentorship_pairs", {
  id: uuid("id").primaryKey().defaultRandom(),
  mentorId: text("mentor_id").notNull().references(() => users.id),
  menteeId: text("mentee_id").notNull().references(() => users.id),
  status: text("status").notNull().default("active"), 
});

// ==========================================
// 3. THE CHRONOSPHERE & CMS
// ==========================================

export const systemPages = pgTable("system_pages", {
  slug: text("slug").primaryKey(), // e.g., "constitution", "about-us"
  title: text("title").notNull(),
  contentMarkdown: text("content_markdown").notNull(),
  lastUpdatedBy: text("last_updated_by").references(() => users.id),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const departments = pgTable("departments", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  colorHex: text("color_hex").notNull(),
  description: text("description"),
});

export const events = pgTable("events", {
  id: uuid("id").primaryKey().defaultRandom(),
  departmentId: uuid("department_id").references(() => departments.id),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  descriptionMarkdown: text("description_markdown").notNull(),
  bannerUrl: text("banner_url"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  venue: text("venue").notNull(),
  status: text("status").notNull().default("draft"),
}, (t) => ({
  slugIdx: index("event_slug_idx").on(t.slug),
}));

export const rsvps = pgTable("rsvps", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  qrHash: text("qr_hash").notNull().unique(),
  checkedInAt: timestamp("checked_in_at"), 
}, (t) => ({
  unq: index("rsvp_user_event_idx").on(t.eventId, t.userId),
}));

// ==========================================
// 4. THE LAUNCHPAD & TREASURY
// ==========================================

export const sponsors = pgTable("sponsors", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyName: text("company_name").notNull(),
  logoUrl: text("logo_url"),
  tier: text("tier").notNull(), 
});

export const budgets = pgTable("budgets", {
  id: uuid("id").primaryKey().defaultRandom(),
  departmentId: uuid("department_id").references(() => departments.id),
  fiscalYear: integer("fiscal_year").notNull(),
  allocatedAmount: integer("allocated_amount").notNull(), 
});

export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  budgetId: uuid("budget_id").references(() => budgets.id),
  sponsorId: uuid("sponsor_id").references(() => sponsors.id),
  title: text("title").notNull(),
  amount: integer("amount").notNull(), // Paise
  receiptUrl: text("receipt_url"),
  requestedBy: text("requested_by").notNull().references(() => users.id),
  approvedBy: text("approved_by").references(() => users.id),
  status: text("status").notNull().default("pending"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const bounties = pgTable("bounties", {
  id: uuid("id").primaryKey().defaultRandom(),
  sponsorId: uuid("sponsor_id").references(() => sponsors.id),
  title: text("title").notNull(),
  rewardAmount: integer("reward_amount").notNull(),
  status: text("status").default("open"), 
});

export const interviewExperiences = pgTable("interview_experiences", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().references(() => users.id),
  companyName: text("company_name").notNull(),
  roleApplied: text("role_applied").notNull(),
  contentMarkdown: text("content_markdown").notNull(),
  isVerified: boolean("is_verified").default(false),
});

// ==========================================
// 5. THE NEURAL VAULT & AUDIT LOGS
// ==========================================

export const resources = pgTable("resources", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  fileUrl: text("file_url").notNull(),
  uploadedBy: text("uploaded_by").references(() => users.id),
});

export const resourceEmbeddings = pgTable("resource_embeddings", {
  id: uuid("id").primaryKey().defaultRandom(),
  resourceId: uuid("resource_id").notNull().references(() => resources.id, { onDelete: "cascade" }),
  contentChunk: text("content_chunk").notNull(),
  embedding: customVector("embedding"), 
});

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  actorId: text("actor_id").notNull().references(() => users.id),
  action: text("action").notNull(), 
  entity: text("entity").notNull(), 
  entityId: text("entity_id").notNull(), 
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// ==========================================
// 6. HARDWARE TELEMETRY & ASSETS
//  

export const hardwareInventory = pgTable("hardware_inventory", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(), // e.g., "Raspberry Pi 4", "System Design Interview Book"
  category: text("category").notNull(), // "microcontroller", "book", "drone"
  totalQuantity: integer("total_quantity").notNull().default(1),
  availableQuantity: integer("available_quantity").notNull().default(1),
  condition: text("condition").default("good"),
});

export const hardwareCheckouts = pgTable("hardware_checkouts", {
  id: uuid("id").primaryKey().defaultRandom(),
  itemId: uuid("item_id").notNull().references(() => hardwareInventory.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id),
  checkoutDate: timestamp("checkout_date").defaultNow().notNull(),
  expectedReturnDate: timestamp("expected_return_date").notNull(),
  actualReturnDate: timestamp("actual_return_date"),
  status: text("status").notNull().default("active"), // "active", "returned", "overdue", "lost"
});