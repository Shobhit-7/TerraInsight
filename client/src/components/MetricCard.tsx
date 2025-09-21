import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend?: "up" | "down" | "stable";
  trendValue?: string;
  status: "good" | "warning" | "danger";
  description?: string;
  lastUpdated?: string;
}

const statusColors = {
  good: "bg-green-500",
  warning: "bg-yellow-500", 
  danger: "bg-red-500"
};

const statusVariants = {
  good: "default" as const,
  warning: "secondary" as const,
  danger: "destructive" as const
};

export default function MetricCard({
  title,
  value,
  unit,
  trend,
  trendValue,
  status,
  description,
  lastUpdated
}: MetricCardProps) {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  
  return (
    <Card className="hover-elevate" data-testid={`card-metric-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={`w-2 h-2 rounded-full ${statusColors[status]}`} />
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold" data-testid={`text-value-${title.toLowerCase().replace(/\s+/g, '-')}`}>
              {value}
              {unit && <span className="text-sm text-muted-foreground ml-1">{unit}</span>}
            </div>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          {trend && trendValue && (
            <div className="flex items-center gap-1">
              <TrendIcon className={`h-4 w-4 ${
                trend === "up" ? "text-red-500" : trend === "down" ? "text-green-500" : "text-gray-500"
              }`} />
              <span className="text-xs text-muted-foreground">{trendValue}</span>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between mt-2">
          <Badge variant={statusVariants[status]} className="text-xs">
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
          {lastUpdated && (
            <span className="text-xs text-muted-foreground">
              Updated {lastUpdated}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}