// Reference: javascript_database integration
import { 
  type User, 
  type InsertUser,
  type AirQualityData,
  type InsertAirQualityData,
  type WaterSecurityData,
  type InsertWaterSecurityData,
  type GreenSpaceData,
  type InsertGreenSpaceData,
  type LiveabilityScore,
  type InsertLivabilityScore,
  type EnvironmentalAlert,
  type InsertEnvironmentalAlert,
  users,
  airQualityData,
  waterSecurityData,
  greenSpaceData,
  livabilityScores,
  environmentalAlerts
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte } from "drizzle-orm";

// Environmental data storage interface
export interface IStorage {
  // Legacy user methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Environmental data methods
  insertAirQualityData(data: InsertAirQualityData): Promise<AirQualityData>;
  insertWaterSecurityData(data: InsertWaterSecurityData): Promise<WaterSecurityData>;
  insertGreenSpaceData(data: InsertGreenSpaceData): Promise<GreenSpaceData>;
  insertLivabilityScore(score: InsertLivabilityScore): Promise<LiveabilityScore>;
  insertEnvironmentalAlert(alert: InsertEnvironmentalAlert): Promise<EnvironmentalAlert>;
  
  // Query methods
  getAirQualityDataByLocation(lat: number, lon: number, radius?: number): Promise<AirQualityData[]>;
  getWaterSecurityDataByLocation(lat: number, lon: number, radius?: number): Promise<WaterSecurityData[]>;
  getGreenSpaceDataByLocation(lat: number, lon: number, radius?: number): Promise<GreenSpaceData[]>;
  getLivabilityScoreByLocation(lat: number, lon: number): Promise<LiveabilityScore | undefined>;
  getActiveAlerts(): Promise<EnvironmentalAlert[]>;
  getRecentEnvironmentalData(lat: number, lon: number, hours?: number): Promise<{
    airQuality: AirQualityData[];
    waterSecurity: WaterSecurityData[];
    greenSpace: GreenSpaceData[];
  }>;
}

export class DatabaseStorage implements IStorage {
  // Legacy user methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Environmental data methods
  async insertAirQualityData(data: InsertAirQualityData): Promise<AirQualityData> {
    const [result] = await db
      .insert(airQualityData)
      .values(data)
      .returning();
    return result;
  }

  async insertWaterSecurityData(data: InsertWaterSecurityData): Promise<WaterSecurityData> {
    const [result] = await db
      .insert(waterSecurityData)
      .values(data)
      .returning();
    return result;
  }

  async insertGreenSpaceData(data: InsertGreenSpaceData): Promise<GreenSpaceData> {
    const [result] = await db
      .insert(greenSpaceData)
      .values(data)
      .returning();
    return result;
  }

  async insertLivabilityScore(score: InsertLivabilityScore): Promise<LiveabilityScore> {
    const [result] = await db
      .insert(livabilityScores)
      .values(score)
      .returning();
    return result;
  }

  async insertEnvironmentalAlert(alert: InsertEnvironmentalAlert): Promise<EnvironmentalAlert> {
    const [result] = await db
      .insert(environmentalAlerts)
      .values(alert)
      .returning();
    return result;
  }

  // Query methods with geospatial calculations
  async getAirQualityDataByLocation(lat: number, lon: number, radius: number = 0.1): Promise<AirQualityData[]> {
    return await db
      .select()
      .from(airQualityData)
      .where(
        and(
          gte(airQualityData.latitude, lat - radius),
          lte(airQualityData.latitude, lat + radius),
          gte(airQualityData.longitude, lon - radius),
          lte(airQualityData.longitude, lon + radius)
        )
      )
      .orderBy(desc(airQualityData.timestamp));
  }

  async getWaterSecurityDataByLocation(lat: number, lon: number, radius: number = 0.1): Promise<WaterSecurityData[]> {
    return await db
      .select()
      .from(waterSecurityData)
      .where(
        and(
          gte(waterSecurityData.latitude, lat - radius),
          lte(waterSecurityData.latitude, lat + radius),
          gte(waterSecurityData.longitude, lon - radius),
          lte(waterSecurityData.longitude, lon + radius)
        )
      )
      .orderBy(desc(waterSecurityData.timestamp));
  }

  async getGreenSpaceDataByLocation(lat: number, lon: number, radius: number = 0.1): Promise<GreenSpaceData[]> {
    return await db
      .select()
      .from(greenSpaceData)
      .where(
        and(
          gte(greenSpaceData.latitude, lat - radius),
          lte(greenSpaceData.latitude, lat + radius),
          gte(greenSpaceData.longitude, lon - radius),
          lte(greenSpaceData.longitude, lon + radius)
        )
      )
      .orderBy(desc(greenSpaceData.timestamp));
  }

  async getLivabilityScoreByLocation(lat: number, lon: number): Promise<LiveabilityScore | undefined> {
    const [score] = await db
      .select()
      .from(livabilityScores)
      .where(
        and(
          gte(livabilityScores.latitude, lat - 0.01),
          lte(livabilityScores.latitude, lat + 0.01),
          gte(livabilityScores.longitude, lon - 0.01),
          lte(livabilityScores.longitude, lon + 0.01)
        )
      )
      .orderBy(desc(livabilityScores.timestamp))
      .limit(1);
    return score || undefined;
  }

  async getActiveAlerts(): Promise<EnvironmentalAlert[]> {
    return await db
      .select()
      .from(environmentalAlerts)
      .where(eq(environmentalAlerts.isActive, true))
      .orderBy(desc(environmentalAlerts.severity), desc(environmentalAlerts.timestamp));
  }

  async getRecentEnvironmentalData(lat: number, lon: number, hours: number = 24) {
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - hours);

    const [airQuality, waterSecurity, greenSpace] = await Promise.all([
      this.getAirQualityDataByLocation(lat, lon),
      this.getWaterSecurityDataByLocation(lat, lon),
      this.getGreenSpaceDataByLocation(lat, lon)
    ]);

    return {
      airQuality: airQuality.filter(d => new Date(d.timestamp) >= cutoffTime),
      waterSecurity: waterSecurity.filter(d => new Date(d.timestamp) >= cutoffTime),
      greenSpace: greenSpace.filter(d => new Date(d.timestamp) >= cutoffTime)
    };
  }
}

export const storage = new DatabaseStorage();
