import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Info, CheckCircle, X } from "lucide-react";

interface Alert {
  id: string;
  type: "warning" | "info" | "success" | "danger";
  title: string;
  message: string;
  timestamp: string;
  location?: string;
  actionable?: boolean;
}

interface AlertPanelProps {
  alerts?: Alert[];
  onDismiss?: (alertId: string) => void;
  onAction?: (alertId: string) => void;
}

const alertIcons = {
  warning: AlertTriangle,
  info: Info,
  success: CheckCircle,
  danger: AlertTriangle
};

const alertVariants = {
  warning: "secondary" as const,
  info: "default" as const,
  success: "default" as const,
  danger: "destructive" as const
};

export default function AlertPanel({ 
  alerts = [
    {
      id: "1",
      type: "warning",
      title: "High Air Pollution Detected",
      message: "PM2.5 levels are 2x above recommended limits in downtown area",
      timestamp: "2 min ago",
      location: "Downtown San Francisco",
      actionable: true
    },
    {
      id: "2", 
      type: "danger",
      title: "Flood Risk Alert",
      message: "Heavy rainfall expected, potential flooding in low-lying areas",
      timestamp: "15 min ago",
      location: "South Bay",
      actionable: true
    },
    {
      id: "3",
      type: "info", 
      title: "Green Space Analysis Complete",
      message: "Monthly NDVI analysis shows 5% increase in vegetation coverage",
      timestamp: "1 hour ago",
      actionable: false
    }
  ],
  onDismiss,
  onAction 
}: AlertPanelProps) {

  const handleDismiss = (alertId: string) => {
    onDismiss?.(alertId);
    console.log(`Alert dismissed: ${alertId}`);
  };

  const handleAction = (alertId: string) => {
    onAction?.(alertId);
    console.log(`Alert action triggered: ${alertId}`);
  };

  return (
    <Card className="w-full" data-testid="card-alert-panel">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
          Environmental Alerts
          <Badge variant="secondary" className="ml-auto">
            {alerts.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <p>No active alerts</p>
            <p className="text-sm">All systems operating normally</p>
          </div>
        ) : (
          alerts.map((alert) => {
            const Icon = alertIcons[alert.type];
            return (
              <Card key={alert.id} className="hover-elevate" data-testid={`alert-${alert.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Icon className={`h-5 w-5 mt-0.5 ${
                      alert.type === 'danger' ? 'text-red-500' :
                      alert.type === 'warning' ? 'text-yellow-500' :
                      alert.type === 'success' ? 'text-green-500' :
                      'text-blue-500'
                    }`} />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-sm" data-testid={`text-alert-title-${alert.id}`}>
                          {alert.title}
                        </h4>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground"
                          onClick={() => handleDismiss(alert.id)}
                          data-testid={`button-dismiss-${alert.id}`}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {alert.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant={alertVariants[alert.type]} className="text-xs">
                            {alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}
                          </Badge>
                          {alert.location && (
                            <span className="text-xs text-muted-foreground">
                              {alert.location}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {alert.timestamp}
                          </span>
                          {alert.actionable && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAction(alert.id)}
                              data-testid={`button-action-${alert.id}`}
                            >
                              Take Action
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}