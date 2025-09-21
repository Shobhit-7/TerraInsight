import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface LiveabilityData {
  airQuality: number;
  waterSecurity: number;
  greenSpace: number;
  overall: number;
}

interface LiveabilityProps {
  data: LiveabilityData;
  location?: string;
}

export default function LiveabilityScorecard({ data, location = "Current Location" }: LiveabilityProps) {
  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getProgressColor = (score: number) => {
    if (score >= 70) return "bg-green-500";
    if (score >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <Card className="w-full hover-elevate" data-testid="card-livability-scorecard">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Livability Index</span>
          <span className={`text-3xl font-bold ${getScoreColor(data.overall)}`} data-testid="text-overall-score">
            {data.overall}
          </span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">{location}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Air Quality</span>
            <span className={`text-sm font-semibold ${getScoreColor(data.airQuality)}`}>
              {data.airQuality}/100
            </span>
          </div>
          <Progress 
            value={data.airQuality} 
            className="h-2"
            data-testid="progress-air-quality"
          />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Water Security</span>
            <span className={`text-sm font-semibold ${getScoreColor(data.waterSecurity)}`}>
              {data.waterSecurity}/100
            </span>
          </div>
          <Progress 
            value={data.waterSecurity} 
            className="h-2"
            data-testid="progress-water-security"
          />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Green Space</span>
            <span className={`text-sm font-semibold ${getScoreColor(data.greenSpace)}`}>
              {data.greenSpace}/100
            </span>
          </div>
          <Progress 
            value={data.greenSpace} 
            className="h-2"
            data-testid="progress-green-space"
          />
        </div>

        <div className="pt-2 border-t">
          <div className="flex justify-center">
            <span className="text-xs text-muted-foreground">
              Last updated: {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}