import AlertPanel from '../AlertPanel'

export default function AlertPanelExample() {
  const handleDismiss = (alertId: string) => {
    console.log(`Dismissed alert: ${alertId}`)
  }

  const handleAction = (alertId: string) => {
    console.log(`Action taken for alert: ${alertId}`)
  }

  return (
    <div className="p-4 max-w-2xl">
      <AlertPanel 
        onDismiss={handleDismiss}
        onAction={handleAction}
      />
    </div>
  )
}