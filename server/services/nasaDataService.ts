// NASA Earth observation data integration service
// Reference: javascript_openai integration for ML analysis

export interface NASADataPoint {
  latitude: number;
  longitude: number;
  value: number;
  timestamp: string;
  quality?: number;
}

export interface AirQualityReading {
  latitude: number;
  longitude: number;
  aqi: number;
  pm25?: number;
  pm10?: number;
  ozone?: number;
  no2?: number;
  so2?: number;
  source: string;
  timestamp: string;
}

export interface WaterSecurityReading {
  latitude: number;
  longitude: number;
  waterStressLevel: number;
  precipitationLevel?: number;
  groundwaterLevel?: number;
  floodRisk?: number;
  source: string;
  timestamp: string;
}

export interface GreenSpaceReading {
  latitude: number;
  longitude: number;
  ndvi: number;
  vegetationCoverage?: number;
  greenSpaceType?: string;
  source: string;
  timestamp: string;
}

class NASADataService {
  private readonly NASA_BASE_URL = 'https://api.nasa.gov';
  private readonly EARTH_DATA_URL = 'https://appeears.earthdatacloud.nasa.gov/api';
  
  // Aura OMI (Ozone Monitoring Instrument) - Air Quality Data
  async fetchAuraOMIData(lat: number, lon: number, date?: string): Promise<AirQualityReading[]> {
    try {
      // NASA OMI provides ozone and air quality data
      // In a real implementation, this would use actual NASA APIs
      // For now, we'll simulate realistic data based on location and time
      
      const baseAQI = this.calculateBaseAQI(lat, lon);
      const timeVariation = this.getTimeBasedVariation();
      const locationFactor = this.getLocationFactor(lat, lon);
      
      return [{
        latitude: lat,
        longitude: lon,
        aqi: Math.max(0, Math.min(500, baseAQI + timeVariation + locationFactor)),
        ozone: this.simulateOzoneLevel(lat, lon),
        no2: this.simulateNO2Level(lat, lon),
        so2: this.simulateSO2Level(lat, lon),
        source: 'nasa_omi',
        timestamp: date || new Date().toISOString()
      }];
    } catch (error) {
      console.error('Error fetching Aura OMI data:', error);
      return [];
    }
  }

  // TEMPO (Tropospheric Emissions Monitoring) - High-resolution air quality
  async fetchTEMPOData(lat: number, lon: number, date?: string): Promise<AirQualityReading[]> {
    try {
      // TEMPO provides hourly air quality data over North America
      const isNorthAmerica = lat >= 25 && lat <= 70 && lon >= -180 && lon <= -40;
      
      if (!isNorthAmerica) {
        return []; // TEMPO coverage is limited to North America
      }

      const hourlyReadings: AirQualityReading[] = [];
      const currentHour = new Date().getHours();
      
      // Generate hourly data for the past 12 hours
      for (let i = 0; i < 12; i++) {
        const hour = (currentHour - i + 24) % 24;
        const timestamp = new Date();
        timestamp.setHours(hour, 0, 0, 0);
        
        hourlyReadings.push({
          latitude: lat,
          longitude: lon,
          aqi: this.calculateHourlyAQI(lat, lon, hour),
          pm25: this.simulatePM25(lat, lon, hour),
          pm10: this.simulatePM10(lat, lon, hour),
          no2: this.simulateNO2Level(lat, lon, hour),
          source: 'nasa_tempo',
          timestamp: timestamp.toISOString()
        });
      }
      
      return hourlyReadings.reverse(); // Return in chronological order
    } catch (error) {
      console.error('Error fetching TEMPO data:', error);
      return [];
    }
  }

  // GRACE (Gravity Recovery and Climate Experiment) - Water data
  async fetchGRACEData(lat: number, lon: number, date?: string): Promise<WaterSecurityReading[]> {
    try {
      // GRACE provides groundwater and water storage data
      const groundwaterAnomaly = this.simulateGroundwaterAnomaly(lat, lon);
      const waterStress = this.calculateWaterStress(lat, lon, groundwaterAnomaly);
      
      return [{
        latitude: lat,
        longitude: lon,
        waterStressLevel: waterStress,
        groundwaterLevel: groundwaterAnomaly,
        precipitationLevel: this.simulatePrecipitation(lat, lon),
        floodRisk: this.calculateFloodRisk(lat, lon, groundwaterAnomaly),
        source: 'nasa_grace',
        timestamp: date || new Date().toISOString()
      }];
    } catch (error) {
      console.error('Error fetching GRACE data:', error);
      return [];
    }
  }

  // SWOT (Surface Water and Ocean Topography) - Surface water monitoring
  async fetchSWOTData(lat: number, lon: number, date?: string): Promise<WaterSecurityReading[]> {
    try {
      // SWOT provides surface water elevation and extent data
      const surfaceWaterLevel = this.simulateSurfaceWaterLevel(lat, lon);
      const floodRisk = this.calculateFloodRiskFromSurfaceWater(lat, lon, surfaceWaterLevel);
      
      return [{
        latitude: lat,
        longitude: lon,
        waterStressLevel: this.calculateWaterStressFromSurface(surfaceWaterLevel),
        floodRisk: floodRisk,
        source: 'nasa_swot',
        timestamp: date || new Date().toISOString()
      }];
    } catch (error) {
      console.error('Error fetching SWOT data:', error);
      return [];
    }
  }

  // Landsat - Land surface and vegetation monitoring
  async fetchLandsatData(lat: number, lon: number, date?: string): Promise<GreenSpaceReading[]> {
    try {
      // Landsat provides land surface imagery for NDVI calculation
      const ndvi = this.calculateNDVI(lat, lon);
      const vegetationCoverage = this.calculateVegetationCoverage(ndvi);
      const greenSpaceType = this.classifyGreenSpace(ndvi, lat, lon);
      
      return [{
        latitude: lat,
        longitude: lon,
        ndvi: ndvi,
        vegetationCoverage: vegetationCoverage,
        greenSpaceType: greenSpaceType,
        source: 'nasa_landsat',
        timestamp: date || new Date().toISOString()
      }];
    } catch (error) {
      console.error('Error fetching Landsat data:', error);
      return [];
    }
  }

  // MODIS - Moderate Resolution Imaging Spectroradiometer
  async fetchMODISData(lat: number, lon: number, date?: string): Promise<GreenSpaceReading[]> {
    try {
      // MODIS provides frequent vegetation monitoring
      const ndvi = this.calculateMODISNDVI(lat, lon);
      const vegetationCoverage = this.calculateVegetationCoverage(ndvi);
      
      return [{
        latitude: lat,
        longitude: lon,
        ndvi: ndvi,
        vegetationCoverage: vegetationCoverage,
        source: 'nasa_modis',
        timestamp: date || new Date().toISOString()
      }];
    } catch (error) {
      console.error('Error fetching MODIS data:', error);
      return [];
    }
  }

  // Comprehensive data fetch for a location
  async fetchAllEnvironmentalData(lat: number, lon: number, date?: string) {
    const [airQualityOMI, airQualityTEMPO, waterGRACE, waterSWOT, vegetationLandsat, vegetationMODIS] = 
      await Promise.all([
        this.fetchAuraOMIData(lat, lon, date),
        this.fetchTEMPOData(lat, lon, date),
        this.fetchGRACEData(lat, lon, date),
        this.fetchSWOTData(lat, lon, date),
        this.fetchLandsatData(lat, lon, date),
        this.fetchMODISData(lat, lon, date)
      ]);

    return {
      airQuality: [...airQualityOMI, ...airQualityTEMPO],
      waterSecurity: [...waterGRACE, ...waterSWOT],
      greenSpace: [...vegetationLandsat, ...vegetationMODIS]
    };
  }

  // Simulation methods (replace with real NASA API calls in production)
  private calculateBaseAQI(lat: number, lon: number): number {
    // Simulate AQI based on location characteristics
    const urbanFactor = this.getUrbanFactor(lat, lon);
    const industrialFactor = this.getIndustrialFactor(lat, lon);
    const geographicFactor = this.getGeographicFactor(lat, lon);
    
    return 30 + urbanFactor + industrialFactor + geographicFactor;
  }

  private getTimeBasedVariation(): number {
    const hour = new Date().getHours();
    // Higher pollution during rush hours (7-9 AM, 5-7 PM)
    if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
      return Math.random() * 20 + 10;
    }
    return Math.random() * 10 - 5;
  }

  private getLocationFactor(lat: number, lon: number): number {
    // Major city coordinates and their typical AQI offsets
    const cities = [
      { lat: 37.7749, lon: -122.4194, offset: 15 }, // San Francisco
      { lat: 34.0522, lon: -118.2437, offset: 35 }, // Los Angeles
      { lat: 40.7128, lon: -74.0060, offset: 25 }, // New York
      { lat: 41.8781, lon: -87.6298, offset: 20 }, // Chicago
    ];
    
    let minDistance = Infinity;
    let closestOffset = 0;
    
    cities.forEach(city => {
      const distance = Math.sqrt(Math.pow(lat - city.lat, 2) + Math.pow(lon - city.lon, 2));
      if (distance < minDistance) {
        minDistance = distance;
        closestOffset = city.offset * Math.exp(-distance * 10); // Exponential decay
      }
    });
    
    return closestOffset;
  }

  private getUrbanFactor(lat: number, lon: number): number {
    // Simulate urban density impact on air quality
    return Math.random() * 15;
  }

  private getIndustrialFactor(lat: number, lon: number): number {
    // Simulate industrial activity impact
    return Math.random() * 10;
  }

  private getGeographicFactor(lat: number, lon: number): number {
    // Simulate geographic factors (altitude, proximity to coast, etc.)
    return Math.random() * 8 - 4;
  }

  private simulateOzoneLevel(lat: number, lon: number): number {
    return Math.random() * 0.08 + 0.02; // ppb
  }

  private simulateNO2Level(lat: number, lon: number, hour?: number): number {
    const baseLevel = Math.random() * 30 + 10;
    const hourFactor = hour ? (hour >= 7 && hour <= 9 || hour >= 17 && hour <= 19 ? 1.5 : 1) : 1;
    return baseLevel * hourFactor;
  }

  private simulateSO2Level(lat: number, lon: number): number {
    return Math.random() * 15 + 2;
  }

  private calculateHourlyAQI(lat: number, lon: number, hour: number): number {
    const baseAQI = this.calculateBaseAQI(lat, lon);
    const hourlyVariation = this.getHourlyVariation(hour);
    return Math.max(0, Math.min(500, baseAQI + hourlyVariation));
  }

  private getHourlyVariation(hour: number): number {
    // Rush hour pollution peaks
    if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
      return Math.random() * 25 + 10;
    }
    // Night time lower pollution
    if (hour >= 22 || hour <= 5) {
      return Math.random() * 5 - 10;
    }
    return Math.random() * 10 - 5;
  }

  private simulatePM25(lat: number, lon: number, hour: number): number {
    const base = Math.random() * 20 + 5;
    const hourFactor = this.getHourlyVariation(hour) / 10;
    return Math.max(0, base + hourFactor);
  }

  private simulatePM10(lat: number, lon: number, hour: number): number {
    const base = Math.random() * 40 + 10;
    const hourFactor = this.getHourlyVariation(hour) / 5;
    return Math.max(0, base + hourFactor);
  }

  private simulateGroundwaterAnomaly(lat: number, lon: number): number {
    // Simulate groundwater level anomaly (-100 to 100)
    return Math.random() * 200 - 100;
  }

  private calculateWaterStress(lat: number, lon: number, groundwaterAnomaly: number): number {
    // Calculate water stress level (0-100)
    const baseStress = Math.random() * 40 + 20;
    const anomalyFactor = groundwaterAnomaly < 0 ? Math.abs(groundwaterAnomaly) / 2 : -groundwaterAnomaly / 4;
    return Math.max(0, Math.min(100, baseStress + anomalyFactor));
  }

  private simulatePrecipitation(lat: number, lon: number): number {
    // Simulate monthly precipitation in mm
    return Math.random() * 150 + 20;
  }

  private calculateFloodRisk(lat: number, lon: number, groundwaterAnomaly: number): number {
    const baseTerrain = this.getTerrainFloodRisk(lat, lon);
    const waterFactor = groundwaterAnomaly > 50 ? groundwaterAnomaly / 2 : 0;
    return Math.max(0, Math.min(100, baseTerrain + waterFactor));
  }

  private simulateSurfaceWaterLevel(lat: number, lon: number): number {
    return Math.random() * 10 - 5; // meters above/below normal
  }

  private calculateFloodRiskFromSurfaceWater(lat: number, lon: number, waterLevel: number): number {
    const baseTerrain = this.getTerrainFloodRisk(lat, lon);
    const waterFactor = waterLevel > 0 ? waterLevel * 10 : 0;
    return Math.max(0, Math.min(100, baseTerrain + waterFactor));
  }

  private calculateWaterStressFromSurface(waterLevel: number): number {
    if (waterLevel < -2) return Math.random() * 30 + 50; // High stress if very low water
    if (waterLevel > 2) return Math.random() * 20 + 10; // Low stress if high water
    return Math.random() * 40 + 30; // Moderate stress
  }

  private getTerrainFloodRisk(lat: number, lon: number): number {
    // Simulate terrain-based flood risk
    return Math.random() * 30 + 10;
  }

  private calculateNDVI(lat: number, lon: number): number {
    // Simulate NDVI calculation (-1 to 1, typically 0.2-0.8 for vegetation)
    const urbanFactor = this.getUrbanDensity(lat, lon);
    const seasonalFactor = this.getSeasonalVegetation();
    const baseNDVI = Math.random() * 0.6 + 0.2;
    
    return Math.max(-1, Math.min(1, baseNDVI - urbanFactor + seasonalFactor));
  }

  private calculateMODISNDVI(lat: number, lon: number): number {
    // MODIS typically has slightly different resolution/timing than Landsat
    return this.calculateNDVI(lat, lon) + (Math.random() * 0.1 - 0.05);
  }

  private calculateVegetationCoverage(ndvi: number): number {
    // Convert NDVI to vegetation coverage percentage
    if (ndvi < 0.1) return Math.random() * 5;
    if (ndvi < 0.3) return Math.random() * 25 + 5;
    if (ndvi < 0.6) return Math.random() * 40 + 30;
    return Math.random() * 30 + 70;
  }

  private classifyGreenSpace(ndvi: number, lat: number, lon: number): string {
    if (ndvi < 0.2) return 'urban_sparse';
    if (ndvi < 0.4) return 'urban_green';
    if (ndvi < 0.6) return 'park';
    return 'forest';
  }

  private getUrbanDensity(lat: number, lon: number): number {
    // Simulate urban density factor (reduces NDVI)
    return Math.random() * 0.3;
  }

  private getSeasonalVegetation(): number {
    const month = new Date().getMonth();
    // Northern hemisphere seasonal variation
    if (month >= 2 && month <= 5) return Math.random() * 0.2; // Spring growth
    if (month >= 6 && month <= 8) return Math.random() * 0.1 + 0.1; // Summer peak
    if (month >= 9 && month <= 11) return -Math.random() * 0.2; // Fall decline
    return -Math.random() * 0.3; // Winter dormancy
  }
}

export default new NASADataService();