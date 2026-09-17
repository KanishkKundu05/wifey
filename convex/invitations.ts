import { mutation } from "./_generated/server";
import { ConvexError, v } from "convex/values";

function validateToken(token: string) {
  if (!/^[a-f0-9]{64}$/.test(token)) throw new ConvexError("Invalid submission.");
}

export const submit = mutation({
  args: { email: v.string(), token: v.string() },
  handler: async (ctx, { email, token }) => {
    validateToken(token);
    email = email.trim().toLowerCase();
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new ConvexError("Please enter a valid email address.");
    }
    const existing = await ctx.db.query("invitations")
      .withIndex("by_token", (q) => q.eq("token", token)).unique();
    if (existing) {
      if (existing.email !== email) throw new ConvexError("Please refresh and try again.");
      return;
    }
    await ctx.db.insert("invitations", { email, token });
  },
});

export const saveAddress = mutation({
  args: { token: v.string(), address: v.string() },
  handler: async (ctx, { token, address }) => {
    validateToken(token);
    address = address.trim();
    if (!address || address.length > 2000) {
      throw new ConvexError("Please enter an address under 2,000 characters.");
    }
    const invitation = await ctx.db.query("invitations")
      .withIndex("by_token", (q) => q.eq("token", token)).unique();
    if (!invitation) throw new ConvexError("Please submit your email first.");
    await ctx.db.patch(invitation._id, { address });
  },
});
