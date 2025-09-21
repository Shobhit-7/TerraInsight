import DataSourcePanel from '../DataSourcePanel'

export default function DataSourcePanelExample() {
  const handleRefresh = (sourceId: string) => {
    console.log(`Refreshing source: ${sourceId}`)
  }

  const handleToggle = (sourceId: string) => {
    console.log(`Toggling source: ${sourceId}`)
  }

  return (
    <div className="p-4 max-w-lg">
      <DataSourcePanel 
        onRefresh={handleRefresh}
        onToggle={handleToggle}
      />
    </div>
  )
}