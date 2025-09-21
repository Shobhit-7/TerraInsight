import EnvironmentalMap from '../EnvironmentalMap'

export default function EnvironmentalMapExample() {
  const handleLayerToggle = (layerId: string) => {
    console.log(`Layer toggled: ${layerId}`)
  }

  return (
    <div className="w-full h-[500px] p-4">
      <EnvironmentalMap onLayerToggle={handleLayerToggle} />
    </div>
  )
}