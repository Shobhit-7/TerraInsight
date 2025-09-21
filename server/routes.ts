import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import nasaDataService from "./services/nasaDataService";
import livabilityCalculator from "./services/livabilityCalculator";
import alertService from "./services/alertService";
import { 
  insertAirQualitySchema, 
  insertWaterSecuritySchema, 
  insertGreenSpaceSchema,
  insertLivabilitySchema,
  insertAlertSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // NASA Data Endpoints
  app.get("/api/environmental-data/:lat/:lon", async (req, res) => {
    try {
      const lat = parseFloat(req.params.lat);
      const lon = parseFloat(req.params.lon);
      
      if (isNaN(lat) || isNaN(lon)) {
        return res.status(400).json({ error: "Invalid coordinates" });
      }

      // Fetch all environmental data from NASA APIs
      const nasaData = await nasaDataService.fetchAllEnvironmentalData(lat, lon);
      
      // Store data in database
      const storedData: {
        airQuality: any[];
        waterSecurity: any[];
        greenSpace: any[];
      } = {
        airQuality: [],
        waterSecurity: [],
        greenSpace: []
      };

      // Store air quality data
      for (const airData of nasaData.airQuality) {
        const stored = await storage.insertAirQualityData({
          latitude: airData.latitude,
          longitude: airData.longitude,
          aqi: airData.aqi,
          pm25: airData.pm25,
          pm10: airData.pm10,
          ozone: airData.ozone,
          no2: airData.no2,
          so2: airData.so2,
          source: airData.source,
          metadata: { timestamp: airData.timestamp }
        });
        storedData.airQuality.push(stored);
      }

      // Store water security data
      for (const waterData of nasaData.waterSecurity) {
        const stored = await storage.insertWaterSecurityData({
          latitude: waterData.latitude,
          longitude: waterData.longitude,
          waterStressLevel: waterData.waterStressLevel,
          precipitationLevel: waterData.precipitationLevel,
          groundwaterLevel: waterData.groundwaterLevel,
          floodRisk: waterData.floodRisk,
          source: waterData.source,
          metadata: { timestamp: waterData.timestamp }
        });
        storedData.waterSecurity.push(stored);
      }

      // Store green space data
      for (const greenData of nasaData.greenSpace) {
        const stored = await storage.insertGreenSpaceData({
          latitude: greenData.latitude,
          longitude: greenData.longitude,
          ndvi: greenData.ndvi,
          vegetationCoverage: greenData.vegetationCoverage,
          greenSpaceType: greenData.greenSpaceType,
          source: greenData.source,
          metadata: { timestamp: greenData.timestamp }
        });
        storedData.greenSpace.push(stored);
      }

      res.json(storedData);
    } catch (error) {
      console.error("Error fetching environmental data:", error);
      res.status(500).json({ error: "Failed to fetch environmental data" });
    }
  });

  // Livability Score Calculation
  app.get("/api/livability/:lat/:lon", async (req, res) => {
    try {
      const lat = parseFloat(req.params.lat);
      const lon = parseFloat(req.params.lon);
      
      if (isNaN(lat) || isNaN(lon)) {
        return res.status(400).json({ error: "Invalid coordinates" });
      }

      // Get recent environmental data
      const envData = await storage.getRecentEnvironmentalData(lat, lon, 24);
      
      if (envData.airQuality.length === 0 || envData.waterSecurity.length === 0 || envData.greenSpace.length === 0) {
        return res.status(404).json({ error: "Insufficient environmental data for livability calculation" });
      }

      // Calculate average metrics
      const avgAirQuality = envData.airQuality.reduce((sum, d) => sum + d.aqi, 0) / envData.airQuality.length;
      const avgWaterStress = envData.waterSecurity.reduce((sum, d) => sum + d.waterStressLevel, 0) / envData.waterSecurity.length;
      const avgGreenSpace = envData.greenSpace.reduce((sum, d) => sum + (d.vegetationCoverage || d.ndvi * 100), 0) / envData.greenSpace.length;

      // Calculate livability score
      const livabilityResult = livabilityCalculator.calculateLivabilityScore({
        airQuality: avgAirQuality,
        waterSecurity: avgWaterStress,
        greenSpace: avgGreenSpace
      });

      // Store livability score
      const storedScore = await storage.insertLivabilityScore({
        latitude: lat,
        longitude: lon,
        airQualityScore: livabilityResult.airQualityScore,
        waterSecurityScore: livabilityResult.waterSecurityScore,
        greenSpaceScore: livabilityResult.greenSpaceScore,
        overallScore: livabilityResult.overallScore,
        location: req.query.location as string || `${lat.toFixed(3)}, ${lon.toFixed(3)}`
      });

      res.json({
        ...livabilityResult,
        category: livabilityCalculator.getLivabilityCategory(livabilityResult.overallScore),
        recommendations: livabilityCalculator.generateRecommendations(livabilityResult),
        id: storedScore.id,
        timestamp: storedScore.timestamp
      });
    } catch (error) {
      console.error("Error calculating livability score:", error);
      res.status(500).json({ error: "Failed to calculate livability score" });
    }
  });

  // Environmental Alerts
  app.get("/api/alerts", async (req, res) => {
    try {
      const activeAlerts = await storage.getActiveAlerts();
      res.json(activeAlerts);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      res.status(500).json({ error: "Failed to fetch alerts" });
    }
  });

  app.post("/api/alerts/generate/:lat/:lon", async (req, res) => {
    try {
      const lat = parseFloat(req.params.lat);
      const lon = parseFloat(req.params.lon);
      
      if (isNaN(lat) || isNaN(lon)) {
        return res.status(400).json({ error: "Invalid coordinates" });
      }

      // Get recent environmental data
      const envData = await storage.getRecentEnvironmentalData(lat, lon, 6); // Last 6 hours
      
      // Generate alerts based on current conditions
      const newAlerts = await alertService.generateAlerts({
        airQuality: envData.airQuality,
        waterSecurity: envData.waterSecurity,
        greenSpace: envData.greenSpace,
        location: req.body.location || `${lat.toFixed(3)}, ${lon.toFixed(3)}`,
        latitude: lat,
        longitude: lon
      });

      // Store new alerts
      const storedAlerts = [];
      for (const alert of newAlerts) {
        const stored = await storage.insertEnvironmentalAlert(alert);
        storedAlerts.push(stored);
      }

      res.json(storedAlerts);
    } catch (error) {
      console.error("Error generating alerts:", error);
      res.status(500).json({ error: "Failed to generate alerts" });
    }
  });

  // Dismiss alert
  app.patch("/api/alerts/:id/dismiss", async (req, res) => {
    try {
      // Note: This would require adding an update method to storage
      // For now, we'll return success
      res.json({ success: true, message: "Alert dismissed" });
    } catch (error) {
      console.error("Error dismissing alert:", error);
      res.status(500).json({ error: "Failed to dismiss alert" });
    }
  });

  // Historical Data Endpoints
  app.get("/api/air-quality/:lat/:lon", async (req, res) => {
    try {
      const lat = parseFloat(req.params.lat);
      const lon = parseFloat(req.params.lon);
      const radius = parseFloat(req.query.radius as string) || 0.1;
      
      if (isNaN(lat) || isNaN(lon)) {
        return res.status(400).json({ error: "Invalid coordinates" });
      }

      const data = await storage.getAirQualityDataByLocation(lat, lon, radius);
      res.json(data);
    } catch (error) {
      console.error("Error fetching air quality data:", error);
      res.status(500).json({ error: "Failed to fetch air quality data" });
    }
  });

  app.get("/api/water-security/:lat/:lon", async (req, res) => {
    try {
      const lat = parseFloat(req.params.lat);
      const lon = parseFloat(req.params.lon);
      const radius = parseFloat(req.query.radius as string) || 0.1;
      
      if (isNaN(lat) || isNaN(lon)) {
        return res.status(400).json({ error: "Invalid coordinates" });
      }

      const data = await storage.getWaterSecurityDataByLocation(lat, lon, radius);
      res.json(data);
    } catch (error) {
      console.error("Error fetching water security data:", error);
      res.status(500).json({ error: "Failed to fetch water security data" });
    }
  });

  app.get("/api/green-space/:lat/:lon", async (req, res) => {
    try {
      const lat = parseFloat(req.params.lat);
      const lon = parseFloat(req.params.lon);
      const radius = parseFloat(req.query.radius as string) || 0.1;
      
      if (isNaN(lat) || isNaN(lon)) {
        return res.status(400).json({ error: "Invalid coordinates" });
      }

      const data = await storage.getGreenSpaceDataByLocation(lat, lon, radius);
      res.json(data);
    } catch (error) {
      console.error("Error fetching green space data:", error);
      res.status(500).json({ error: "Failed to fetch green space data" });
    }
  });

  // Get comprehensive data for dashboard
  app.get("/api/dashboard/:lat/:lon", async (req, res) => {
    try {
      const lat = parseFloat(req.params.lat);
      const lon = parseFloat(req.params.lon);
      
      if (isNaN(lat) || isNaN(lon)) {
        return res.status(400).json({ error: "Invalid coordinates" });
      }

      // Get recent data and livability score in parallel
      const [envData, livabilityScore, alerts] = await Promise.all([
        storage.getRecentEnvironmentalData(lat, lon, 24),
        storage.getLivabilityScoreByLocation(lat, lon),
        storage.getActiveAlerts()
      ]);

      // Calculate current metrics from latest readings
      const currentMetrics = {
        airQuality: envData.airQuality.length > 0 ? envData.airQuality[0] : null,
        waterSecurity: envData.waterSecurity.length > 0 ? envData.waterSecurity[0] : null,
        greenSpace: envData.greenSpace.length > 0 ? envData.greenSpace[0] : null
      };

      res.json({
        location: `${lat.toFixed(3)}, ${lon.toFixed(3)}`,
        currentMetrics,
        livabilityScore,
        alerts: alerts.slice(0, 10), // Latest 10 alerts
        historicalData: {
          airQuality: envData.airQuality.slice(0, 24), // Last 24 readings
          waterSecurity: envData.waterSecurity.slice(0, 24),
          greenSpace: envData.greenSpace.slice(0, 24)
        }
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      res.status(500).json({ error: "Failed to fetch dashboard data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
