import LiveabilityScorecard from '../LiveabilityScorecard'

export default function LiveabilityScorecardExample() {
  // todo: remove mock functionality 
  const mockData = {
    airQuality: 72,
    waterSecurity: 65,
    greenSpace: 45,
    overall: 61
  }

  return (
    <div className="p-4 max-w-sm">
      <LiveabilityScorecard 
        data={mockData} 
        location="San Francisco, CA"
      />
    </div>
  )
}