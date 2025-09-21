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
// Removed resizable panels import as component doesn't exist
import { BarChart3, TrendingUp, MapPin, Filter } from "lucide-react";

export default function Dashboard() {
  // todo: remove mock functionality
  const [activeTab, setActiveTab] = useState("overview");
  
  const mockLivabilityData = {
    airQuality: 72,
    waterSecurity: 65,
    greenSpace: 45,
    overall: 61
  };

  const mockMetrics = [
    {
      title: "Air Quality Index",
      value: 45,
      unit: "AQI",
      trend: "down" as const,
      trendValue: "5% ↓",
      status: "good" as const,
      description: "Good air quality",
      lastUpdated: "2 min ago"
    },
    {
      title: "Water Security",
      value: 78,
      unit: "%",
      trend: "up" as const,
      trendValue: "3% ↑",
      status: "warning" as const,
      description: "Moderate stress level",
      lastUpdated: "5 min ago"
    },
    {
      title: "Green Space Coverage",
      value: 32,
      unit: "%",
      trend: "stable" as const,
      trendValue: "0%",
      status: "danger" as const,
      description: "Below recommended level",
      lastUpdated: "1 min ago"
    }
  ];

  const handleLayerToggle = (layerId: string) => {
    console.log(`Map layer toggled: ${layerId}`);
  };

  const handleAlertDismiss = (alertId: string) => {
    console.log(`Alert dismissed: ${alertId}`);
  };

  const handleAlertAction = (alertId: string) => {
    console.log(`Alert action taken: ${alertId}`);
  };

  const handleDataSourceRefresh = (sourceId: string) => {
    console.log(`Data source refreshed: ${sourceId}`);
  };

  const handleDataSourceToggle = (sourceId: string) => {
    console.log(`Data source toggled: ${sourceId}`);
  };

  return (
    <ThemeProvider defaultTheme="light">
      <div className="h-screen flex flex-col bg-background" data-testid="dashboard-main">
        {/* Header */}
        <Header activeAlerts={2} />
        
        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex h-full w-full">
            {/* Main Map Area - 70% */}
            <div className="w-[70%] h-full flex flex-col border-r">
              {/* Quick Metrics Bar */}
              <div className="p-4 border-b bg-muted/30">
                <div className="grid grid-cols-3 gap-4">
                  {mockMetrics.map((metric, index) => (
                    <MetricCard key={index} {...metric} />
                  ))}
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
                  <LiveabilityScorecard 
                    data={mockLivabilityData} 
                    location="San Francisco Bay Area"
                  />
                  
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