/**
 * Validation Utilities
 * Zod schemas voor form & API validation
 */

import { z } from 'zod';

/**
 * Trip Validation Schema
 */
export const tripSchema = z
  .object({
    title: z
      .string()
      .min(3, 'Titel moet minimaal 3 karakters zijn')
      .max(255, 'Titel mag maximaal 255 karakters zijn'),
    description: z.string().max(1000, 'Beschrijving mag maximaal 1000 karakters zijn').optional(),
    destination: z.string().min(2, 'Bestemming is verplicht'),
    start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ongeldige datum format'),
    end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ongeldige datum format'),
    travel_style: z.enum(['adventure', 'beach', 'culture', 'nature', 'mixed']).optional(),
  })
  .refine((data) => new Date(data.end_date) >= new Date(data.start_date), {
    message: 'Einddatum moet na of op startdatum zijn',
    path: ['end_date'],
  });

export type TripInput = z.infer<typeof tripSchema>;

/**
 * Activity Validation Schema
 */
export const activitySchema = z.object({
  title: z.string().min(1, 'Titel is verplicht').max(255),
  description: z.string().max(1000).optional(),
  day_part: z.enum(['morning', 'afternoon', 'evening', 'full_day']),
  start_time: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional(),
  end_time: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional(),
  location_name: z.string().max(255).optional(),
  notes: z.string().max(1000).optional(),
});

export type ActivityInput = z.infer<typeof activitySchema>;

/**
 * Poll Validation Schema
 */
export const pollSchema = z.object({
  question: z.string().min(5, 'Vraag moet minimaal 5 karakters zijn').max(500),
  description: z.string().max(1000).optional(),
  options: z
    .array(
      z.object({
        option_text: z.string().min(1, 'Optie mag niet leeg zijn').max(500),
      })
    )
    .min(2, 'Minimaal 2 opties vereist')
    .max(10, 'Maximaal 10 opties toegestaan'),
  allow_multiple_votes: z.boolean().default(false),
});

export type PollInput = z.infer<typeof pollSchema>;

/**
 * Packing Item Validation Schema
 */
export const packingItemSchema = z.object({
  item_name: z.string().min(1, 'Item naam is verplicht').max(255),
  category: z.string().max(100).optional(),
  quantity: z.number().int().positive().default(1),
  notes: z.string().max(500).optional(),
});

export type PackingItemInput = z.infer<typeof packingItemSchema>;

/**
 * Expense Validation Schema
 */
export const expenseSchema = z.object({
  title: z.string().min(1, 'Titel is verplicht').max(255),
  description: z.string().max(1000).optional(),
  amount: z.number().positive('Bedrag moet positief zijn'),
  currency: z.string().length(3).default('EUR'),
  category: z.string().max(100).optional(),
  expense_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  split_equally: z.boolean().default(true),
});

export type ExpenseInput = z.infer<typeof expenseSchema>;

/**
 * Invite Link Validation Schema
 */
export const inviteLinkSchema = z.object({
  default_role: z.enum(['viewer', 'editor']).default('viewer'),
  expires_at: z.string().datetime().optional(),
  max_uses: z.number().int().positive().optional(),
});

export type InviteLinkInput = z.infer<typeof inviteLinkSchema>;
