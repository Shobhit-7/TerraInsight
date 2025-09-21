// Livability Index Calculation Service
// Combines air quality, water security, and green space metrics

export interface LiveabilityMetrics {
  airQuality: number;
  waterSecurity: number;
  greenSpace: number;
}

export interface LiveabilityResult {
  airQualityScore: number;
  waterSecurityScore: number;
  greenSpaceScore: number;
  overallScore: number;
  factors: {
    airQuality: {
      weight: number;
      normalizedValue: number;
      contribution: number;
    };
    waterSecurity: {
      weight: number;
      normalizedValue: number;
      contribution: number;
    };
    greenSpace: {
      weight: number;
      normalizedValue: number;
      contribution: number;
    };
  };
}

class LiveabilityCalculator {
  // Weights for different factors (must sum to 1.0)
  private readonly weights = {
    airQuality: 0.4,     // 40% - highest weight due to immediate health impact
    waterSecurity: 0.35, // 35% - critical for sustainability
    greenSpace: 0.25     // 25% - important for quality of life
  };

  // Reference values for normalization
  private readonly referenceValues = {
    airQuality: {
      excellent: 0,    // AQI 0-50
      good: 50,        // AQI 51-100
      moderate: 100,   // AQI 101-150
      poor: 200,       // AQI 151-200
      veryPoor: 300    // AQI 201+
    },
    waterSecurity: {
      excellent: 0,    // 0-20% stress
      good: 20,        // 21-40% stress
      moderate: 40,    // 41-60% stress
      poor: 60,        // 61-80% stress
      veryPoor: 80     // 81-100% stress
    },
    greenSpace: {
      excellent: 80,   // 80%+ vegetation coverage
      good: 60,        // 60-79% coverage
      moderate: 40,    // 40-59% coverage
      poor: 20,        // 20-39% coverage
      veryPoor: 10     // <20% coverage
    }
  };

  /**
   * Calculate livability score from environmental metrics
   */
  calculateLivabilityScore(metrics: LiveabilityMetrics): LiveabilityResult {
    // Normalize each metric to 0-100 scale
    const airQualityScore = this.normalizeAirQuality(metrics.airQuality);
    const waterSecurityScore = this.normalizeWaterSecurity(metrics.waterSecurity);
    const greenSpaceScore = this.normalizeGreenSpace(metrics.greenSpace);

    // Calculate weighted contributions
    const airQualityContribution = airQualityScore * this.weights.airQuality;
    const waterSecurityContribution = waterSecurityScore * this.weights.waterSecurity;
    const greenSpaceContribution = greenSpaceScore * this.weights.greenSpace;

    // Calculate overall score
    const overallScore = Math.round(
      airQualityContribution + waterSecurityContribution + greenSpaceContribution
    );

    return {
      airQualityScore: Math.round(airQualityScore),
      waterSecurityScore: Math.round(waterSecurityScore),
      greenSpaceScore: Math.round(greenSpaceScore),
      overallScore,
      factors: {
        airQuality: {
          weight: this.weights.airQuality,
          normalizedValue: airQualityScore,
          contribution: airQualityContribution
        },
        waterSecurity: {
          weight: this.weights.waterSecurity,
          normalizedValue: waterSecurityScore,
          contribution: waterSecurityContribution
        },
        greenSpace: {
          weight: this.weights.greenSpace,
          normalizedValue: greenSpaceScore,
          contribution: greenSpaceContribution
        }
      }
    };
  }

  /**
   * Normalize Air Quality Index (AQI) to 0-100 scale
   * Lower AQI is better, so we invert the scale
   */
  private normalizeAirQuality(aqi: number): number {
    if (aqi <= this.referenceValues.airQuality.excellent) return 100;
    if (aqi <= this.referenceValues.airQuality.good) return 85;
    if (aqi <= this.referenceValues.airQuality.moderate) return 60;
    if (aqi <= this.referenceValues.airQuality.poor) return 35;
    if (aqi <= this.referenceValues.airQuality.veryPoor) return 15;
    return 5; // Very unhealthy/hazardous
  }

  /**
   * Normalize Water Security (stress level) to 0-100 scale
   * Lower stress is better, so we invert the scale
   */
  private normalizeWaterSecurity(stressLevel: number): number {
    if (stressLevel <= this.referenceValues.waterSecurity.excellent) return 100;
    if (stressLevel <= this.referenceValues.waterSecurity.good) return 80;
    if (stressLevel <= this.referenceValues.waterSecurity.moderate) return 60;
    if (stressLevel <= this.referenceValues.waterSecurity.poor) return 40;
    if (stressLevel <= this.referenceValues.waterSecurity.veryPoor) return 20;
    return 10; // Extremely high stress
  }

  /**
   * Normalize Green Space coverage to 0-100 scale
   * Higher coverage is better
   */
  private normalizeGreenSpace(coverage: number): number {
    if (coverage >= this.referenceValues.greenSpace.excellent) return 100;
    if (coverage >= this.referenceValues.greenSpace.good) return 80;
    if (coverage >= this.referenceValues.greenSpace.moderate) return 60;
    if (coverage >= this.referenceValues.greenSpace.poor) return 40;
    if (coverage >= this.referenceValues.greenSpace.veryPoor) return 20;
    return 10; // Very low vegetation
  }

  /**
   * Calculate livability scores for multiple locations and compare
   */
  calculateRegionalLivability(locations: Array<{
    name: string;
    metrics: LiveabilityMetrics;
  }>): Array<{
    name: string;
    result: LiveabilityResult;
    ranking: number;
  }> {
    const results = locations.map(location => ({
      name: location.name,
      result: this.calculateLivabilityScore(location.metrics)
    }));

    // Sort by overall score (descending)
    results.sort((a, b) => b.result.overallScore - a.result.overallScore);

    // Add rankings
    return results.map((result, index) => ({
      ...result,
      ranking: index + 1
    }));
  }

  /**
   * Determine category based on overall score
   */
  getLivabilityCategory(score: number): {
    category: string;
    description: string;
    color: string;
  } {
    if (score >= 85) {
      return {
        category: 'Excellent',
        description: 'Outstanding environmental conditions',
        color: 'green'
      };
    } else if (score >= 70) {
      return {
        category: 'Good',
        description: 'Generally favorable environmental conditions',
        color: 'lightgreen'
      };
    } else if (score >= 55) {
      return {
        category: 'Moderate',
        description: 'Acceptable environmental conditions with some concerns',
        color: 'yellow'
      };
    } else if (score >= 40) {
      return {
        category: 'Poor',
        description: 'Environmental conditions need improvement',
        color: 'orange'
      };
    } else {
      return {
        category: 'Very Poor',
        description: 'Significant environmental concerns requiring action',
        color: 'red'
      };
    }
  }

  /**
   * Generate recommendations based on livability analysis
   */
  generateRecommendations(result: LiveabilityResult): string[] {
    const recommendations: string[] = [];

    // Air quality recommendations
    if (result.airQualityScore < 60) {
      recommendations.push('Implement traffic reduction measures in high-pollution areas');
      recommendations.push('Increase monitoring of industrial emissions');
      recommendations.push('Promote public transportation and electric vehicle adoption');
    }

    // Water security recommendations
    if (result.waterSecurityScore < 60) {
      recommendations.push('Improve water conservation and efficiency programs');
      recommendations.push('Invest in flood protection infrastructure');
      recommendations.push('Enhance groundwater monitoring and management');
    }

    // Green space recommendations
    if (result.greenSpaceScore < 60) {
      recommendations.push('Expand urban parks and green corridors');
      recommendations.push('Implement green building requirements');
      recommendations.push('Create community gardens and green roofs');
      recommendations.push('Protect existing natural areas from development');
    }

    // Overall recommendations based on weakest factors
    const factors = [
      { name: 'air quality', score: result.airQualityScore },
      { name: 'water security', score: result.waterSecurityScore },
      { name: 'green space', score: result.greenSpaceScore }
    ];

    const weakestFactor = factors.reduce((min, factor) => 
      factor.score < min.score ? factor : min
    );

    if (weakestFactor.score < 50) {
      recommendations.push(`Priority focus needed on ${weakestFactor.name} improvements`);
    }

    return recommendations;
  }
}

export default new LiveabilityCalculator();