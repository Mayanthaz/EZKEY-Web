import { z } from "zod";

export const ALLOWED_PLATFORMS = [
  "steam",
  "epic",
  "origin",
  "uplay",
  "gog",
  "xbox",
  "playstation",
  "nintendo",
  "battle_net",
  "other",
] as const;

export const ALLOWED_DELIVERY_TYPES = ["instant", "manual", "service"] as const;

export const ALLOWED_LISTING_STATUSES = [
  "draft",
  "active",
  "paused",
  "sold_out",
  "removed",
] as const;

export const createListingSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(120, "Title must not exceed 120 characters"),
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters")
    .max(5000, "Description must not exceed 5000 characters"),
  short_description: z.string().trim().max(250).optional(),
  price: z
    .number()
    .positive("Price must be greater than $0.00")
    .max(100000, "Price cannot exceed $100,000"),
  original_price: z
    .number()
    .positive("Original price must be greater than $0.00")
    .optional()
    .nullable(),
  category_slug: z.string().min(1, "Please select a category"),
  platform: z.enum(ALLOWED_PLATFORMS),
  region: z.string().default("global"),
  delivery_type: z.enum(ALLOWED_DELIVERY_TYPES),
  images: z
    .array(z.string().min(1))
    .min(1, "At least one product image is required"),
  initial_keys: z
    .array(z.string().trim().min(3, "License key is too short"))
    .optional(),
});

export const updateListingSchema = createListingSchema.partial().extend({
  status: z.enum(ALLOWED_LISTING_STATUSES).optional(),
});

export const addKeysSchema = z.object({
  listing_id: z.string().min(1, "Listing ID is required"),
  keys: z
    .array(z.string().trim().min(3, "Key must have at least 3 characters"))
    .min(1, "Enter at least one license key"),
});

export const fulfillOrderSchema = z.object({
  order_id: z.string().min(1, "Order ID is required"),
  keys: z
    .array(z.string().trim().min(1))
    .min(1, "Please provide the digital key(s) or access info"),
  delivery_note: z.string().trim().max(1000).optional(),
});

export const payoutRequestSchema = z.object({
  amount: z.number().min(10, "Minimum payout request is $10.00"),
  method: z.enum(["stripe", "paypal", "bank_transfer"]),
  destination: z.string().trim().min(3, "Account or email details required"),
});

export const sellerSettingsSchema = z.object({
  business_name: z
    .string()
    .trim()
    .min(2, "Store name must be at least 2 characters")
    .max(100),
  business_email: z.string().trim().email("Enter a valid business email"),
  bio: z.string().trim().max(1000).optional(),
  payout_method: z.enum(["stripe", "paypal", "bank_transfer"]),
  paypal_email: z.string().trim().email().optional().or(z.literal("")),
  bank_account_info: z.string().trim().max(200).optional(),
});

export type CreateListingInput = z.infer<typeof createListingSchema>;
export type UpdateListingInput = z.infer<typeof updateListingSchema>;
export type AddKeysInput = z.infer<typeof addKeysSchema>;
export type FulfillOrderInput = z.infer<typeof fulfillOrderSchema>;
export type PayoutRequestInput = z.infer<typeof payoutRequestSchema>;
export type SellerSettingsInput = z.infer<typeof sellerSettingsSchema>;
