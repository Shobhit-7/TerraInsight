import { sql } from "drizzle-orm";
import { pgTable, text, varchar, real, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Environmental Data Schema
export const airQualityData = pgTable("air_quality_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  aqi: real("aqi").notNull(),
  pm25: real("pm25"),
  pm10: real("pm10"),
  ozone: real("ozone"),
  no2: real("no2"),
  so2: real("so2"),
  source: text("source").notNull(), // 'nasa_omi', 'nasa_tempo', 'local'
  timestamp: timestamp("timestamp").notNull().default(sql`now()`),
  metadata: jsonb("metadata"),
});

export const waterSecurityData = pgTable("water_security_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  waterStressLevel: real("water_stress_level").notNull(), // 0-100
  precipitationLevel: real("precipitation_level"),
  groundwaterLevel: real("groundwater_level"),
  floodRisk: real("flood_risk"), // 0-100
  source: text("source").notNull(), // 'nasa_grace', 'nasa_swot', 'local_rainfall'
  timestamp: timestamp("timestamp").notNull().default(sql`now()`),
  metadata: jsonb("metadata"),
});

export const greenSpaceData = pgTable("green_space_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  ndvi: real("ndvi").notNull(), // Normalized Difference Vegetation Index
  vegetationCoverage: real("vegetation_coverage"), // percentage
  greenSpaceType: text("green_space_type"), // 'park', 'forest', 'urban_green', etc.
  source: text("source").notNull(), // 'nasa_landsat', 'nasa_modis', 'local'
  timestamp: timestamp("timestamp").notNull().default(sql`now()`),
  metadata: jsonb("metadata"),
});

export const livabilityScores = pgTable("livability_scores", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  airQualityScore: real("air_quality_score").notNull(),
  waterSecurityScore: real("water_security_score").notNull(),
  greenSpaceScore: real("green_space_score").notNull(),
  overallScore: real("overall_score").notNull(),
  location: text("location"),
  timestamp: timestamp("timestamp").notNull().default(sql`now()`),
});

export const environmentalAlerts = pgTable("environmental_alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(), // 'warning', 'danger', 'info', 'success'
  category: text("category").notNull(), // 'air_quality', 'water_security', 'green_space'
  title: text("title").notNull(),
  message: text("message").notNull(),
  latitude: real("latitude"),
  longitude: real("longitude"),
  location: text("location"),
  severity: real("severity").notNull(), // 0-100
  isActive: boolean("is_active").notNull().default(true),
  actionable: boolean("actionable").notNull().default(false),
  recommendations: jsonb("recommendations"),
  timestamp: timestamp("timestamp").notNull().default(sql`now()`),
});

// Insert Schemas
export const insertAirQualitySchema = createInsertSchema(airQualityData).omit({
  id: true,
  timestamp: true,
});

export const insertWaterSecuritySchema = createInsertSchema(waterSecurityData).omit({
  id: true,
  timestamp: true,
});

export const insertGreenSpaceSchema = createInsertSchema(greenSpaceData).omit({
  id: true,
  timestamp: true,
});

export const insertLivabilitySchema = createInsertSchema(livabilityScores).omit({
  id: true,
  timestamp: true,
});

export const insertAlertSchema = createInsertSchema(environmentalAlerts).omit({
  id: true,
  timestamp: true,
});

// Types
export type AirQualityData = typeof airQualityData.$inferSelect;
export type InsertAirQualityData = z.infer<typeof insertAirQualitySchema>;

export type WaterSecurityData = typeof waterSecurityData.$inferSelect;
export type InsertWaterSecurityData = z.infer<typeof insertWaterSecuritySchema>;

export type GreenSpaceData = typeof greenSpaceData.$inferSelect;
export type InsertGreenSpaceData = z.infer<typeof insertGreenSpaceSchema>;

export type LiveabilityScore = typeof livabilityScores.$inferSelect;
export type InsertLivabilityScore = z.infer<typeof insertLivabilitySchema>;

export type EnvironmentalAlert = typeof environmentalAlerts.$inferSelect;
export type InsertEnvironmentalAlert = z.infer<typeof insertAlertSchema>;

// Legacy user schema (keeping for compatibility)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
