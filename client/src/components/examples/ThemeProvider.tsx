import { ThemeProvider } from '../ThemeProvider'
import { Button } from "@/components/ui/button"
import { useTheme } from '../ThemeProvider'

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  
  return (
    <Button
      variant="outline"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      data-testid="button-theme-toggle"
    >
      {theme === "dark" ? "☀️" : "🌙"} Toggle Theme
    </Button>
  )
}

export default function ThemeProviderExample() {
  return (
    <ThemeProvider defaultTheme="light">
      <div className="p-4 bg-background text-foreground min-h-[200px]">
        <h3 className="text-lg font-semibold mb-4">Theme Provider Example</h3>
        <ThemeToggle />
        <p className="mt-4 text-muted-foreground">
          Click the button to toggle between light and dark themes.
        </p>
      </div>
    </ThemeProvider>
  )
}