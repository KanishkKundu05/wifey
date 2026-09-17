import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  invitations: defineTable({
    email: v.string(),
    token: v.string(),
    address: v.optional(v.string()),
  }).index("by_token", ["token"]),
});
