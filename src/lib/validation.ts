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
const message = z.string().trim().max(1000).optional();

export const viewingSchema = z.object({
  kind: z.literal("viewing"),
  listingId: z.string().regex(/^(rent|sale)-\d+$/),
  name,
  email,
  phone,
  timing: z.enum(["now", "1m", "3m", "browsing"], { message: "Pick when you want to move" }),
  budgetEur: z.coerce.number().int().min(0).max(50_000_000).optional(),
  relocating: z.boolean().default(false),
  message,
  website: honeypot,
  utmSource: utm,
  utmCampaign: utm,
});

export const valuationSchema = z.object({
  kind: z.literal("valuation"),
  goal: z.enum(["rent", "sale"]),
  name,
  email,
  phone,
  district: z.string().regex(/^[IVX]{1,5}$/, "Pick a district"),
  sizeM2: z.coerce.number().int().min(25, "25 m² or more").max(800),
  bedrooms: z.coerce.number().int().min(0).max(10),
  view: z.enum(["premium", "standard"]),
  condition: z.enum(["new", "renovated", "good", "dated"]),
  readiness: z.enum(["now", "soon", "exploring"], { message: "Pick when it's available" }),
  wantsManagement: z.boolean().default(false),
  message,
  website: honeypot,
  utmSource: utm,
  utmCampaign: utm,
});

export const leadSchema = z.discriminatedUnion("kind", [viewingSchema, valuationSchema]);
export type ViewingLead = z.infer<typeof viewingSchema>;
export type ValuationLead = z.infer<typeof valuationSchema>;
export type Lead = z.infer<typeof leadSchema>;
