import { useState } from "react";
import { ThemeProvider } from "./ThemeProvider";
import Header from "./Header";
import EnvironmentalMap from "./EnvironmentalMap";
import MetricCard from "./MetricCard";
import LiveabilityScorecard from "./LiveabilityScorecard";
import AlertPanel from "./AlertPanel";
import DataSourcePanel from "./DataSourcePanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useEnvironmentalData } from "@/hooks/useEnvironmentalData";
import { BarChart3, TrendingUp, MapPin, Filter, RefreshCw, AlertCircle } from "lucide-react";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  
  // Default location (San Francisco Bay Area)
  const [currentLocation] = useState({ latitude: 37.7749, longitude: -122.4194 });
  
  // Fetch real environmental data
  const {
    dashboardData,
    alerts,
    isDashboardLoading,
    isAlertsLoading,
    isFetchingEnvironmentalData,
    fetchEnvironmentalData,
    calculateLivability,
    generateAlerts,
    dismissAlert,
  } = useEnvironmentalData(currentLocation.latitude, currentLocation.longitude);

  // Process metrics from real data
  const processMetrics = () => {
    if (!dashboardData?.currentMetrics) {
      return [];
    }

    const metrics = [];
    
    // Air Quality Metric
    if (dashboardData.currentMetrics.airQuality) {
      const aqi = dashboardData.currentMetrics.airQuality.aqi;
      const getAQIStatus = (aqi: number) => {
        if (aqi <= 50) return { status: "good" as const, description: "Good air quality" };
        if (aqi <= 100) return { status: "warning" as const, description: "Moderate air quality" };
        return { status: "danger" as const, description: "Unhealthy air quality" };
      };

      const aqiStatus = getAQIStatus(aqi);
      metrics.push({
        title: "Air Quality Index",
        value: aqi,
        unit: "AQI",
        trend: "stable" as const,
        trendValue: "",
        status: aqiStatus.status,
        description: aqiStatus.description,
        lastUpdated: new Date(dashboardData.currentMetrics.airQuality.timestamp).toLocaleTimeString()
      });
    }

    // Water Security Metric
    if (dashboardData.currentMetrics.waterSecurity) {
      const stress = dashboardData.currentMetrics.waterSecurity.waterStressLevel;
      const getWaterStatus = (stress: number) => {
        if (stress <= 40) return { status: "good" as const, description: "Low water stress" };
        if (stress <= 70) return { status: "warning" as const, description: "Moderate water stress" };
        return { status: "danger" as const, description: "High water stress" };
      };

      const waterStatus = getWaterStatus(stress);
      metrics.push({
        title: "Water Security",
        value: Math.round(100 - stress), // Convert stress to security percentage
        unit: "%",
        trend: "stable" as const,
        trendValue: "",
        status: waterStatus.status,
        description: waterStatus.description,
        lastUpdated: new Date(dashboardData.currentMetrics.waterSecurity.timestamp).toLocaleTimeString()
      });
    }

    // Green Space Metric
    if (dashboardData.currentMetrics.greenSpace) {
      const coverage = dashboardData.currentMetrics.greenSpace.vegetationCoverage || 
                     (dashboardData.currentMetrics.greenSpace.ndvi * 100);
      const getGreenStatus = (coverage: number) => {
        if (coverage >= 60) return { status: "good" as const, description: "Excellent green coverage" };
        if (coverage >= 30) return { status: "warning" as const, description: "Moderate green coverage" };
        return { status: "danger" as const, description: "Low green coverage" };
      };

      const greenStatus = getGreenStatus(coverage);
      metrics.push({
        title: "Green Space Coverage",
        value: Math.round(coverage),
        unit: "%",
        trend: "stable" as const,
        trendValue: "",
        status: greenStatus.status,
        description: greenStatus.description,
        lastUpdated: new Date(dashboardData.currentMetrics.greenSpace.timestamp).toLocaleTimeString()
      });
    }

    return metrics;
  };

  const metrics = processMetrics();

  const handleLayerToggle = (layerId: string) => {
    console.log(`Map layer toggled: ${layerId}`);
  };

  const handleAlertDismiss = (alertId: string) => {
    dismissAlert(alertId);
  };

  const handleAlertAction = (alertId: string) => {
    console.log(`Alert action taken: ${alertId}`);
  };

  const handleDataSourceRefresh = (sourceId: string) => {
    if (sourceId === "nasa") {
      fetchEnvironmentalData();
    } else if (sourceId === "livability") {
      calculateLivability(dashboardData?.location);
    } else if (sourceId === "alerts") {
      generateAlerts(dashboardData?.location);
    }
  };

  const handleDataSourceToggle = (sourceId: string) => {
    console.log(`Data source toggled: ${sourceId}`);
  };

  return (
    <ThemeProvider defaultTheme="light">
      <div className="h-screen flex flex-col bg-background" data-testid="dashboard-main">
        {/* Header */}
        <Header activeAlerts={alerts?.length || 0} />
        
        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex h-full w-full">
            {/* Main Map Area - 70% */}
            <div className="w-[70%] h-full flex flex-col border-r">
              {/* Quick Metrics Bar */}
              <div className="p-4 border-b bg-muted/30">
                <div className="grid grid-cols-3 gap-4">
                  {isDashboardLoading ? (
                    // Loading skeletons
                    Array.from({ length: 3 }).map((_, index) => (
                      <Card key={index} className="p-4">
                        <Skeleton className="h-4 w-20 mb-2" />
                        <Skeleton className="h-8 w-16 mb-1" />
                        <Skeleton className="h-3 w-24" />
                      </Card>
                    ))
                  ) : (
                    metrics.map((metric, index) => (
                      <MetricCard key={index} {...metric} />
                    ))
                  )}
                </div>
              </div>
              
              {/* Map Container */}
              <div className="flex-1 p-4">
                <EnvironmentalMap onLayerToggle={handleLayerToggle} />
              </div>
            </div>
            
            {/* Right Panel - 30% */}
            <div className="w-[30%] h-full flex flex-col">
              {/* Panel Header */}
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Analytics
                  </h2>
                  <Button variant="ghost" size="icon" data-testid="button-filter">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Scrollable Panel Content */}
              <ScrollArea className="flex-1">
                <div className="p-4 space-y-6">
                  {/* Livability Scorecard */}
                  {isDashboardLoading ? (
                    <Card>
                      <CardHeader>
                        <Skeleton className="h-6 w-32" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-16 w-full mb-4" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-3/4" />
                        </div>
                      </CardContent>
                    </Card>
                  ) : dashboardData?.livabilityScore ? (
                    <LiveabilityScorecard 
                      data={{
                        airQuality: dashboardData.livabilityScore.airQualityScore,
                        waterSecurity: dashboardData.livabilityScore.waterSecurityScore,
                        greenSpace: dashboardData.livabilityScore.greenSpaceScore,
                        overall: dashboardData.livabilityScore.overallScore
                      }} 
                      location={dashboardData.location || "San Francisco Bay Area"}
                    />
                  ) : (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-orange-500" />
                          No Livability Data
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                          No environmental data available for livability scoring.
                        </p>
                        <Button 
                          onClick={() => fetchEnvironmentalData()} 
                          disabled={isFetchingEnvironmentalData}
                          size="sm"
                          className="w-full"
                        >
                          {isFetchingEnvironmentalData ? (
                            <>
                              <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                              Fetching Data...
                            </>
                          ) : (
                            <>
                              <RefreshCw className="h-3 w-3 mr-2" />
                              Fetch Environmental Data
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                  
                  {/* Tabbed Content */}
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
                      <TabsTrigger value="alerts" data-testid="tab-alerts">Alerts</TabsTrigger>
                      <TabsTrigger value="sources" data-testid="tab-sources">Sources</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="overview" className="space-y-4 mt-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Weekly Trends
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Air Quality</span>
                              <Badge variant="default" className="text-xs">Improving</Badge>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Water Security</span>
                              <Badge variant="secondary" className="text-xs">Stable</Badge>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Green Space</span>
                              <Badge variant="destructive" className="text-xs">Declining</Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Focus Areas
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Downtown</span>
                              <Badge variant="secondary">High Priority</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span>Industrial Zone</span>
                              <Badge variant="destructive">Critical</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span>Residential Areas</span>
                              <Badge variant="default">Monitoring</Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    <TabsContent value="alerts" className="mt-4">
                      <AlertPanel 
                        onDismiss={handleAlertDismiss}
                        onAction={handleAlertAction}
                      />
                    </TabsContent>
                    
                    <TabsContent value="sources" className="mt-4">
                      <DataSourcePanel 
                        onRefresh={handleDataSourceRefresh}
                        onToggle={handleDataSourceToggle}
                      />
                    </TabsContent>
                  </Tabs>
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}