import { z } from "zod";

const name = z.string().trim().min(2, "Tell us your name").max(80);
const email = z.string().trim().toLowerCase().email("Use a valid email so we can reply");
const phone = z
  .string()
  .trim()
  .max(30)
  .refine((v) => v === "" || /^[+\d][\d\s()-]{6,}$/.test(v), "Use digits, spaces and an optional +")
  .optional()
  .transform((v) => (v ? v : undefined));
const honeypot = z.string().max(0).optional().or(z.string().transform(() => "spam"));
const utm = z.string().trim().max(80).optional();

export const viewingSchema = z.object({
  kind: z.literal("viewing"),
  listingId: z.string().uuid(),
  name,
  email,
  phone,
  moveIn: z.enum(["asap", "1m", "3m", "later"], { message: "Pick when you want to move" }),
  leaseMonths: z.coerce.number().int().refine((n) => [6, 12, 24].includes(n), "Pick a lease length"),
  occupants: z.coerce.number().int().min(1, "At least one person").max(8),
  pets: z.coerce.boolean().default(false),
  budgetHuf: z.coerce.number().int().min(0).max(5_000_000).optional(),
  message: z.string().trim().max(1000).optional(),
  website: honeypot,
  utmSource: utm,
  utmCampaign: utm,
});

export const ownerSchema = z.object({
  kind: z.literal("owner"),
  name,
  email,
  phone,
  district: z.string().regex(/^[IVX]{1,5}$/, "Pick a district"),
  sizeM2: z.coerce.number().int().min(15, "15 m² or more").max(400, "400 m² or less"),
  furnished: z.enum(["furnished", "partly", "unfurnished"]),
  condition: z.enum(["new", "renovated", "good", "dated"]),
  elevator: z.coerce.boolean().default(false),
  balcony: z.coerce.boolean().default(false),
  readiness: z.enum(["now", "soon", "exploring"], { message: "Pick when the flat is free" }),
  wantsManagement: z.coerce.boolean().default(false),
  message: z.string().trim().max(1000).optional(),
  website: honeypot,
  utmSource: utm,
  utmCampaign: utm,
});

export const leadSchema = z.discriminatedUnion("kind", [viewingSchema, ownerSchema]);

export type ViewingLead = z.infer<typeof viewingSchema>;
export type OwnerLead = z.infer<typeof ownerSchema>;
export type Lead = z.infer<typeof leadSchema>;
