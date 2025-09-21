import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export interface EnvironmentalMetrics {
  airQuality: {
    id: string;
    aqi: number;
    pm25?: number;
    pm10?: number;
    ozone?: number;
    no2?: number;
    so2?: number;
    timestamp: string;
    latitude: number;
    longitude: number;
    source: string;
  } | null;
  waterSecurity: {
    id: string;
    waterStressLevel: number;
    precipitationLevel?: number;
    groundwaterLevel?: number;
    floodRisk?: number;
    timestamp: string;
    latitude: number;
    longitude: number;
    source: string;
  } | null;
  greenSpace: {
    id: string;
    ndvi: number;
    vegetationCoverage?: number;
    greenSpaceType?: string;
    timestamp: string;
    latitude: number;
    longitude: number;
    source: string;
  } | null;
}

export interface LivabilityScore {
  id: string;
  airQualityScore: number;
  waterSecurityScore: number;
  greenSpaceScore: number;
  overallScore: number;
  location: string;
  timestamp: string;
  category?: {
    category: string;
    description: string;
    color: string;
  };
  recommendations?: string[];
}

export interface EnvironmentalAlert {
  id: string;
  type: "info" | "warning" | "danger";
  category: "air_quality" | "water_security" | "green_space";
  title: string;
  message: string;
  latitude: number;
  longitude: number;
  location: string;
  severity: number;
  isActive: boolean;
  actionable: boolean;
  recommendations?: any;
  timestamp: string;
}

export interface DashboardData {
  location: string;
  currentMetrics: EnvironmentalMetrics;
  livabilityScore: LivabilityScore | null;
  alerts: EnvironmentalAlert[];
  historicalData: {
    airQuality: any[];
    waterSecurity: any[];
    greenSpace: any[];
  };
}

/**
 * Hook for managing environmental data for a specific location
 */
export function useEnvironmentalData(latitude: number, longitude: number) {
  const queryClient = useQueryClient();

  // Fetch comprehensive dashboard data
  const {
    data: dashboardData,
    isLoading: isDashboardLoading,
    error: dashboardError,
    refetch: refetchDashboard
  } = useQuery<DashboardData>({
    queryKey: ["/api/dashboard", latitude, longitude],
    enabled: !!(latitude && longitude),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch fresh environmental data from NASA APIs
  const fetchEnvironmentalDataMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("GET", `/api/environmental-data/${latitude}/${longitude}`);
      return await response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch dashboard data
      queryClient.invalidateQueries({ 
        queryKey: ["/api/dashboard", latitude, longitude] 
      });
    },
  });

  // Calculate livability score
  const calculateLivabilityMutation = useMutation({
    mutationFn: async (location?: string) => {
      const url = `/api/livability/${latitude}/${longitude}${location ? `?location=${encodeURIComponent(location)}` : ''}`;
      const response = await apiRequest("GET", url);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/dashboard", latitude, longitude] 
      });
    },
  });

  // Generate alerts for current location
  const generateAlertsMutation = useMutation({
    mutationFn: async (location?: string) => {
      const response = await apiRequest("POST", `/api/alerts/generate/${latitude}/${longitude}`, { location });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/dashboard", latitude, longitude] 
      });
    },
  });

  // Fetch active alerts
  const {
    data: alerts,
    isLoading: isAlertsLoading,
    refetch: refetchAlerts
  } = useQuery<EnvironmentalAlert[]>({
    queryKey: ["/api/alerts"],
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  });

  // Dismiss alert
  const dismissAlertMutation = useMutation({
    mutationFn: async (alertId: string) => {
      const response = await apiRequest("PATCH", `/api/alerts/${alertId}/dismiss`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
    },
  });

  return {
    // Data
    dashboardData,
    alerts,
    
    // Loading states
    isDashboardLoading,
    isAlertsLoading,
    isFetchingEnvironmentalData: fetchEnvironmentalDataMutation.isPending,
    isCalculatingLivability: calculateLivabilityMutation.isPending,
    isGeneratingAlerts: generateAlertsMutation.isPending,
    
    // Errors
    dashboardError,
    fetchEnvironmentalDataError: fetchEnvironmentalDataMutation.error,
    calculateLivabilityError: calculateLivabilityMutation.error,
    generateAlertsError: generateAlertsMutation.error,
    
    // Actions
    fetchEnvironmentalData: () => fetchEnvironmentalDataMutation.mutate(),
    calculateLivability: (location?: string) => calculateLivabilityMutation.mutate(location),
    generateAlerts: (location?: string) => generateAlertsMutation.mutate(location),
    dismissAlert: (alertId: string) => dismissAlertMutation.mutate(alertId),
    refetchDashboard,
    refetchAlerts,
  };
}