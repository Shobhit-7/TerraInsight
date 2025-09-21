import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "./ThemeProvider";
import { Sun, Moon, Satellite, AlertTriangle, Settings, User } from "lucide-react";

interface HeaderProps {
  activeAlerts?: number;
  onSettingsClick?: () => void;
  onProfileClick?: () => void;
}

export default function Header({ 
  activeAlerts = 2, 
  onSettingsClick,
  onProfileClick 
}: HeaderProps) {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleSettings = () => {
    onSettingsClick?.();
    console.log("Settings clicked");
  };

  const handleProfile = () => {
    onProfileClick?.();
    console.log("Profile clicked");
  };

  return (
    <header className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50" data-testid="header-main">
      <div className="flex h-14 items-center justify-between px-4">
        {/* Logo and Title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Satellite className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold" data-testid="text-app-title">EarthWatch</h1>
          </div>
          <Badge variant="secondary" className="text-xs">
            Live Monitoring
          </Badge>
        </div>

        {/* Status and Controls */}
        <div className="flex items-center gap-2">
          {/* Active Alerts Indicator */}
          {activeAlerts > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              data-testid="button-alerts"
            >
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <span className="text-sm">{activeAlerts}</span>
              <Badge variant="destructive" className="text-xs px-1">
                Active
              </Badge>
            </Button>
          )}

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            data-testid="button-theme-toggle"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>

          {/* Settings */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSettings}
            data-testid="button-settings"
            aria-label="Settings"
          >
            <Settings className="h-4 w-4" />
          </Button>

          {/* Profile */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleProfile}
            data-testid="button-profile"
            aria-label="Profile"
          >
            <User className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Sub-header with quick stats */}
      <div className="border-t bg-muted/50 px-4 py-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-6">
            <span>Last Update: {new Date().toLocaleTimeString()}</span>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span>All Systems Operational</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span>6 Data Sources Active</span>
            <span>Real-time Monitoring</span>
          </div>
        </div>
      </div>
    </header>
  );
}