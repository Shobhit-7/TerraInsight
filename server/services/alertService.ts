// Environmental Alert Generation Service
// Reference: javascript_openai integration for AI-powered recommendations

import OpenAI from "openai";
import type { 
  EnvironmentalAlert,
  InsertEnvironmentalAlert,
  AirQualityData,
  WaterSecurityData,
  GreenSpaceData 
} from "@shared/schema";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface AlertThresholds {
  airQuality: {
    warning: number;    // AQI threshold for warning
    danger: number;     // AQI threshold for danger
  };
  waterSecurity: {
    warning: number;    // Water stress % for warning
    danger: number;     // Water stress % for danger
  };
  greenSpace: {
    warning: number;    // Min vegetation % for warning
    danger: number;     // Min vegetation % for danger
  };
  floodRisk: {
    warning: number;    // Flood risk % for warning
    danger: number;     // Flood risk % for danger
  };
}

export interface EnvironmentalData {
  airQuality?: AirQualityData[];
  waterSecurity?: WaterSecurityData[];
  greenSpace?: GreenSpaceData[];
  location?: string;
  latitude?: number;
  longitude?: number;
}

class AlertService {
  private readonly thresholds: AlertThresholds = {
    airQuality: {
      warning: 100,  // Moderate AQI
      danger: 150    // Unhealthy AQI
    },
    waterSecurity: {
      warning: 60,   // 60% water stress
      danger: 80     // 80% water stress
    },
    greenSpace: {
      warning: 30,   // Less than 30% vegetation
      danger: 15     // Less than 15% vegetation
    },
    floodRisk: {
      warning: 40,   // 40% flood risk
      danger: 70     // 70% flood risk
    }
  };

  /**
   * Analyze environmental data and generate alerts
   */
  async generateAlerts(data: EnvironmentalData): Promise<InsertEnvironmentalAlert[]> {
    const alerts: InsertEnvironmentalAlert[] = [];

    // Analyze air quality data
    if (data.airQuality && data.airQuality.length > 0) {
      const airAlerts = await this.analyzeAirQuality(data.airQuality, data);
      alerts.push(...airAlerts);
    }

    // Analyze water security data
    if (data.waterSecurity && data.waterSecurity.length > 0) {
      const waterAlerts = await this.analyzeWaterSecurity(data.waterSecurity, data);
      alerts.push(...waterAlerts);
    }

    // Analyze green space data
    if (data.greenSpace && data.greenSpace.length > 0) {
      const greenAlerts = await this.analyzeGreenSpace(data.greenSpace, data);
      alerts.push(...greenAlerts);
    }

    return alerts;
  }

  /**
   * Analyze air quality data for alerts
   */
  private async analyzeAirQuality(
    airData: AirQualityData[], 
    context: EnvironmentalData
  ): Promise<InsertEnvironmentalAlert[]> {
    const alerts: InsertEnvironmentalAlert[] = [];
    
    // Get latest reading
    const latest = airData[0];
    
    if (latest.aqi >= this.thresholds.airQuality.danger) {
      const recommendations = await this.generateAirQualityRecommendations(latest, 'danger');
      
      alerts.push({
        type: 'danger',
        category: 'air_quality',
        title: 'Unhealthy Air Quality Detected',
        message: `AQI level of ${latest.aqi} exceeds safe limits. Immediate action recommended for sensitive individuals.`,
        latitude: context.latitude || latest.latitude,
        longitude: context.longitude || latest.longitude,
        location: context.location || `${latest.latitude.toFixed(3)}, ${latest.longitude.toFixed(3)}`,
        severity: Math.min(100, (latest.aqi / this.thresholds.airQuality.danger) * 70),
        isActive: true,
        actionable: true,
        recommendations: recommendations
      });
    } else if (latest.aqi >= this.thresholds.airQuality.warning) {
      const recommendations = await this.generateAirQualityRecommendations(latest, 'warning');
      
      alerts.push({
        type: 'warning',
        category: 'air_quality',
        title: 'Moderate Air Quality Alert',
        message: `AQI level of ${latest.aqi} may affect sensitive individuals. Consider limiting outdoor activities.`,
        latitude: context.latitude || latest.latitude,
        longitude: context.longitude || latest.longitude,
        location: context.location || `${latest.latitude.toFixed(3)}, ${latest.longitude.toFixed(3)}`,
        severity: Math.min(100, (latest.aqi / this.thresholds.airQuality.warning) * 50),
        isActive: true,
        actionable: true,
        recommendations: recommendations
      });
    }

    // Check for rapid deterioration
    if (airData.length >= 2) {
      const previous = airData[1];
      const aqiChange = latest.aqi - previous.aqi;
      
      if (aqiChange > 50) {
        alerts.push({
          type: 'warning',
          category: 'air_quality',
          title: 'Rapid Air Quality Deterioration',
          message: `Air quality index increased by ${aqiChange} points in the last reading. Monitor conditions closely.`,
          latitude: context.latitude || latest.latitude,
          longitude: context.longitude || latest.longitude,
          location: context.location || `${latest.latitude.toFixed(3)}, ${latest.longitude.toFixed(3)}`,
          severity: Math.min(100, (aqiChange / 50) * 40),
          isActive: true,
          actionable: true,
          recommendations: { trend: 'deteriorating', actions: ['Monitor air quality frequently', 'Prepare for potential restrictions'] }
        });
      }
    }

    return alerts;
  }

  /**
   * Analyze water security data for alerts
   */
  private async analyzeWaterSecurity(
    waterData: WaterSecurityData[], 
    context: EnvironmentalData
  ): Promise<InsertEnvironmentalAlert[]> {
    const alerts: InsertEnvironmentalAlert[] = [];
    
    const latest = waterData[0];
    
    // Water stress alerts
    if (latest.waterStressLevel >= this.thresholds.waterSecurity.danger) {
      const recommendations = await this.generateWaterSecurityRecommendations(latest, 'danger');
      
      alerts.push({
        type: 'danger',
        category: 'water_security',
        title: 'Critical Water Stress Level',
        message: `Water stress at ${latest.waterStressLevel.toFixed(1)}% indicates severe water scarcity risk.`,
        latitude: context.latitude || latest.latitude,
        longitude: context.longitude || latest.longitude,
        location: context.location || `${latest.latitude.toFixed(3)}, ${latest.longitude.toFixed(3)}`,
        severity: Math.min(100, (latest.waterStressLevel / 100) * 80),
        isActive: true,
        actionable: true,
        recommendations: recommendations
      });
    } else if (latest.waterStressLevel >= this.thresholds.waterSecurity.warning) {
      const recommendations = await this.generateWaterSecurityRecommendations(latest, 'warning');
      
      alerts.push({
        type: 'warning',
        category: 'water_security',
        title: 'Elevated Water Stress',
        message: `Water stress level of ${latest.waterStressLevel.toFixed(1)}% requires conservation measures.`,
        latitude: context.latitude || latest.latitude,
        longitude: context.longitude || latest.longitude,
        location: context.location || `${latest.latitude.toFixed(3)}, ${latest.longitude.toFixed(3)}`,
        severity: Math.min(100, (latest.waterStressLevel / 100) * 60),
        isActive: true,
        actionable: true,
        recommendations: recommendations
      });
    }

    // Flood risk alerts
    if (latest.floodRisk && latest.floodRisk >= this.thresholds.floodRisk.danger) {
      alerts.push({
        type: 'danger',
        category: 'water_security',
        title: 'High Flood Risk Alert',
        message: `Flood risk at ${latest.floodRisk.toFixed(1)}% indicates potential flooding conditions.`,
        latitude: context.latitude || latest.latitude,
        longitude: context.longitude || latest.longitude,
        location: context.location || `${latest.latitude.toFixed(3)}, ${latest.longitude.toFixed(3)}`,
        severity: Math.min(100, (latest.floodRisk / 100) * 75),
        isActive: true,
        actionable: true,
        recommendations: { 
          emergency: true, 
          actions: ['Monitor weather conditions', 'Prepare evacuation routes', 'Secure property'] 
        }
      });
    } else if (latest.floodRisk && latest.floodRisk >= this.thresholds.floodRisk.warning) {
      alerts.push({
        type: 'warning',
        category: 'water_security',
        title: 'Moderate Flood Risk',
        message: `Flood risk at ${latest.floodRisk.toFixed(1)}% warrants preparation measures.`,
        latitude: context.latitude || latest.latitude,
        longitude: context.longitude || latest.longitude,
        location: context.location || `${latest.latitude.toFixed(3)}, ${latest.longitude.toFixed(3)}`,
        severity: Math.min(100, (latest.floodRisk / 100) * 50),
        isActive: true,
        actionable: true,
        recommendations: { 
          preparedness: true, 
          actions: ['Review emergency plans', 'Check drainage systems'] 
        }
      });
    }

    return alerts;
  }

  /**
   * Analyze green space data for alerts
   */
  private async analyzeGreenSpace(
    greenData: GreenSpaceData[], 
    context: EnvironmentalData
  ): Promise<InsertEnvironmentalAlert[]> {
    const alerts: InsertEnvironmentalAlert[] = [];
    
    const latest = greenData[0];
    const vegCoverage = latest.vegetationCoverage || (latest.ndvi * 100);
    
    if (vegCoverage <= this.thresholds.greenSpace.danger) {
      const recommendations = await this.generateGreenSpaceRecommendations(latest, 'danger');
      
      alerts.push({
        type: 'danger',
        category: 'green_space',
        title: 'Critical Green Space Deficiency',
        message: `Vegetation coverage at ${vegCoverage.toFixed(1)}% is critically low and affects air quality and livability.`,
        latitude: context.latitude || latest.latitude,
        longitude: context.longitude || latest.longitude,
        location: context.location || `${latest.latitude.toFixed(3)}, ${latest.longitude.toFixed(3)}`,
        severity: Math.min(100, ((this.thresholds.greenSpace.danger - vegCoverage) / this.thresholds.greenSpace.danger) * 70),
        isActive: true,
        actionable: true,
        recommendations: recommendations
      });
    } else if (vegCoverage <= this.thresholds.greenSpace.warning) {
      const recommendations = await this.generateGreenSpaceRecommendations(latest, 'warning');
      
      alerts.push({
        type: 'warning',
        category: 'green_space',
        title: 'Low Green Space Coverage',
        message: `Vegetation coverage at ${vegCoverage.toFixed(1)}% is below recommended levels for urban areas.`,
        latitude: context.latitude || latest.latitude,
        longitude: context.longitude || latest.longitude,
        location: context.location || `${latest.latitude.toFixed(3)}, ${latest.longitude.toFixed(3)}`,
        severity: Math.min(100, ((this.thresholds.greenSpace.warning - vegCoverage) / this.thresholds.greenSpace.warning) * 50),
        isActive: true,
        actionable: true,
        recommendations: recommendations
      });
    }

    return alerts;
  }

  /**
   * Generate AI-powered recommendations for air quality issues
   */
  private async generateAirQualityRecommendations(
    data: AirQualityData, 
    severity: 'warning' | 'danger'
  ): Promise<object> {
    try {
      const prompt = `
        Generate actionable recommendations for air quality management.
        
        Current conditions:
        - AQI: ${data.aqi}
        - PM2.5: ${data.pm25 || 'N/A'}
        - Ozone: ${data.ozone || 'N/A'}
        - NO2: ${data.no2 || 'N/A'}
        - Severity: ${severity}
        
        Provide specific, actionable recommendations in JSON format with categories:
        - immediate: Actions for next 24 hours
        - shortTerm: Actions for next week
        - longTerm: Strategic improvements
        
        Focus on practical measures for local government and residents.
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: "You are an environmental policy expert specializing in air quality management. Provide practical, evidence-based recommendations."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" }
      });

      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      console.error('Error generating air quality recommendations:', error);
      return {
        immediate: ['Limit outdoor activities', 'Close windows', 'Use air purifiers'],
        shortTerm: ['Monitor air quality daily', 'Report to environmental authorities'],
        longTerm: ['Support clean air initiatives', 'Reduce vehicle emissions']
      };
    }
  }

  /**
   * Generate AI-powered recommendations for water security issues
   */
  private async generateWaterSecurityRecommendations(
    data: WaterSecurityData, 
    severity: 'warning' | 'danger'
  ): Promise<object> {
    try {
      const prompt = `
        Generate actionable recommendations for water security management.
        
        Current conditions:
        - Water stress level: ${data.waterStressLevel}%
        - Groundwater level: ${data.groundwaterLevel || 'N/A'}
        - Flood risk: ${data.floodRisk || 'N/A'}%
        - Severity: ${severity}
        
        Provide recommendations in JSON format with categories:
        - conservation: Water saving measures
        - infrastructure: System improvements needed
        - emergency: Preparedness actions
        
        Focus on practical measures for utilities and residents.
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: "You are a water resource management expert. Provide practical, sustainable water management recommendations."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" }
      });

      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      console.error('Error generating water security recommendations:', error);
      return {
        conservation: ['Reduce water usage', 'Fix leaks promptly', 'Install water-efficient fixtures'],
        infrastructure: ['Improve water storage', 'Upgrade distribution systems'],
        emergency: ['Prepare water reserves', 'Monitor supply levels']
      };
    }
  }

  /**
   * Generate AI-powered recommendations for green space issues
   */
  private async generateGreenSpaceRecommendations(
    data: GreenSpaceData, 
    severity: 'warning' | 'danger'
  ): Promise<object> {
    try {
      const prompt = `
        Generate actionable recommendations for green space development.
        
        Current conditions:
        - NDVI: ${data.ndvi}
        - Vegetation coverage: ${data.vegetationCoverage || 'N/A'}%
        - Green space type: ${data.greenSpaceType || 'N/A'}
        - Severity: ${severity}
        
        Provide recommendations in JSON format with categories:
        - planning: Urban planning improvements
        - community: Community-driven initiatives
        - policy: Regulatory measures needed
        
        Focus on practical measures for city planners and residents.
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: "You are an urban planning expert specializing in green infrastructure. Provide practical, sustainable recommendations."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" }
      });

      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      console.error('Error generating green space recommendations:', error);
      return {
        planning: ['Increase park space', 'Create green corridors', 'Mandate green building standards'],
        community: ['Start community gardens', 'Plant street trees', 'Create green roofs'],
        policy: ['Protect existing green space', 'Require environmental impact assessments']
      };
    }
  }

  /**
   * Update alert thresholds based on local conditions
   */
  updateThresholds(newThresholds: Partial<AlertThresholds>): void {
    Object.assign(this.thresholds, newThresholds);
  }

  /**
   * Get current alert thresholds
   */
  getThresholds(): AlertThresholds {
    return { ...this.thresholds };
  }
}

export default new AlertService();