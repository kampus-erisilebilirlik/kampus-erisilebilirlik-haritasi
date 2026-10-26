import { z } from "zod";

// View kolonları üretilen tiplerde nullable gelir; burada gerçek (NOT NULL) şekle daraltılır
export const accessScoreSchema = z.enum(["green", "yellow", "red", "unknown"]);
export const pointStatusSchema = z.enum(["working", "broken", "unknown"]);
export const pointTypeSchema = z.enum(["ramp", "elevator", "toilet", "parking", "auto_door"]);

export const buildingSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  summary: z.string(),
  score: accessScoreSchema,
  lat: z.number(),
  lng: z.number(),
  updated_at: z.string(),
});

export const pointSchema = z.object({
  id: z.string(),
  building_id: z.string().nullable(),
  type: pointTypeSchema,
  name: z.string(),
  status: pointStatusSchema,
  floor: z.number().nullable(),
  lat: z.number(),
  lng: z.number(),
  photo_path: z.string().nullable(),
  verbal_directions: z.string(),
  ramp_slope_pct: z.number().nullable(),
  ramp_width_cm: z.number().nullable(),
  ramp_has_handrail: z.boolean().nullable(),
  has_tactile_paving: z.boolean().nullable(),
  ts9111_compliant: z.boolean().nullable(),
  updated_at: z.string(),
  // Şerit metre ölçümleri (#23); v_points'e eklenince TS 9111 ihlal metni için okunur, yokken undefined
  ramp_length_cm: z.number().nullable().optional(),
  ramp_rise_cm: z.number().nullable().optional(),
  ramp_handrail_sides: z.number().nullable().optional(),
});

export const pathNodeSchema = z.object({
  id: z.string(),
  building_id: z.string().nullable(),
  point_id: z.string().nullable(),
  lat: z.number(),
  lng: z.number(),
});

export const pathEdgeSchema = z.object({
  id: z.string(),
  from_node: z.string(),
  to_node: z.string(),
  length_m: z.coerce.number(),
});

export type AccessScore = z.infer<typeof accessScoreSchema>;
export type PointStatus = z.infer<typeof pointStatusSchema>;
export type PointType = z.infer<typeof pointTypeSchema>;
export type Building = z.infer<typeof buildingSchema>;
export type Point = z.infer<typeof pointSchema>;
export type PathNode = z.infer<typeof pathNodeSchema>;
export type PathEdge = z.infer<typeof pathEdgeSchema>;
