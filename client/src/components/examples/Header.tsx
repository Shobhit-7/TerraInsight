import Header from '../Header'
import { ThemeProvider } from '../ThemeProvider'

export default function HeaderExample() {
  const handleSettings = () => {
    console.log('Settings clicked')
  }

  const handleProfile = () => {
    console.log('Profile clicked')
  }

  return (
    <ThemeProvider defaultTheme="light">
      <div className="min-h-[200px] bg-background">
        <Header 
          activeAlerts={3}
          onSettingsClick={handleSettings}
          onProfileClick={handleProfile}
        />
        <div className="p-4">
          <p className="text-muted-foreground">Header example with theme toggle and controls</p>
        </div>
      </div>
    </ThemeProvider>
  )
}