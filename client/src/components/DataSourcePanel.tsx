import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Satellite, Database, RefreshCw, ExternalLink } from "lucide-react";

interface DataSource {
  id: string;
  name: string;
  type: "nasa" | "local";
  status: "active" | "inactive" | "error";
  lastUpdate: string;
  description: string;
  coverage?: string;
}

interface DataSourcePanelProps {
  sources?: DataSource[];
  onRefresh?: (sourceId: string) => void;
  onToggle?: (sourceId: string) => void;
}

const statusColors = {
  active: "bg-green-500",
  inactive: "bg-gray-500",
  error: "bg-red-500"
};

const statusVariants = {
  active: "default" as const,
  inactive: "secondary" as const,
  error: "destructive" as const
};

export default function DataSourcePanel({
  sources = [
    {
      id: "aura-omi",
      name: "Aura OMI",
      type: "nasa",
      status: "active",
      lastUpdate: "3 min ago",
      description: "Ozone Monitoring Instrument for air quality data",
      coverage: "Global"
    },
    {
      id: "tempo",
      name: "TEMPO",
      type: "nasa", 
      status: "active",
      lastUpdate: "1 min ago",
      description: "Tropospheric Emissions Monitoring",
      coverage: "North America"
    },
    {
      id: "grace",
      name: "GRACE",
      type: "nasa",
      status: "active", 
      lastUpdate: "5 min ago",
      description: "Gravity Recovery and Climate Experiment",
      coverage: "Global"
    },
    {
      id: "landsat",
      name: "Landsat",
      type: "nasa",
      status: "active",
      lastUpdate: "2 min ago", 
      description: "Land surface imaging for vegetation analysis",
      coverage: "Global"
    },
    {
      id: "traffic-data",
      name: "Traffic Data",
      type: "local",
      status: "active",
      lastUpdate: "30 sec ago",
      description: "Real-time traffic flow and congestion data",
      coverage: "San Francisco Bay Area"
    },
    {
      id: "rainfall-data", 
      name: "Rainfall Monitoring",
      type: "local",
      status: "inactive",
      lastUpdate: "2 hours ago",
      description: "Local weather station precipitation data",
      coverage: "Regional"
    }
  ],
  onRefresh,
  onToggle
}: DataSourcePanelProps) {

  const handleRefresh = (sourceId: string) => {
    onRefresh?.(sourceId);
    console.log(`Refreshing data source: ${sourceId}`);
  };

  const handleToggle = (sourceId: string) => {
    onToggle?.(sourceId);
    console.log(`Toggling data source: ${sourceId}`);
  };

  const nasaSources = sources.filter(s => s.type === "nasa");
  const localSources = sources.filter(s => s.type === "local");

  return (
    <Card className="w-full" data-testid="card-data-sources">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Data Sources
          <Badge variant="secondary" className="ml-auto">
            {sources.filter(s => s.status === "active").length}/{sources.length} Active
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* NASA Data Sources */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Satellite className="h-4 w-4" />
            NASA Earth Observation
          </h4>
          <div className="space-y-2">
            {nasaSources.map((source) => (
              <Card key={source.id} className="hover-elevate" data-testid={`source-${source.id}`}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${statusColors[source.status]}`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm" data-testid={`text-source-name-${source.id}`}>
                            {source.name}
                          </span>
                          <Badge variant={statusVariants[source.status]} className="text-xs">
                            {source.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {source.description}
                        </p>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-xs text-muted-foreground">
                            Updated {source.lastUpdate}
                          </span>
                          {source.coverage && (
                            <span className="text-xs text-muted-foreground">
                              Coverage: {source.coverage}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRefresh(source.id)}
                        data-testid={`button-refresh-${source.id}`}
                        className="h-7 w-7"
                      >
                        <RefreshCw className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggle(source.id)}
                        data-testid={`button-toggle-${source.id}`}
                        className="h-7 w-7"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Local Data Sources */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Database className="h-4 w-4" />
            Local Datasets
          </h4>
          <div className="space-y-2">
            {localSources.map((source) => (
              <Card key={source.id} className="hover-elevate" data-testid={`source-${source.id}`}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${statusColors[source.status]}`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm" data-testid={`text-source-name-${source.id}`}>
                            {source.name}
                          </span>
                          <Badge variant={statusVariants[source.status]} className="text-xs">
                            {source.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {source.description}
                        </p>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-xs text-muted-foreground">
                            Updated {source.lastUpdate}
                          </span>
                          {source.coverage && (
                            <span className="text-xs text-muted-foreground">
                              Coverage: {source.coverage}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRefresh(source.id)}
                        data-testid={`button-refresh-${source.id}`}
                        className="h-7 w-7"
                      >
                        <RefreshCw className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggle(source.id)}
                        data-testid={`button-toggle-${source.id}`}
                        className="h-7 w-7"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}