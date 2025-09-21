import MetricCard from '../MetricCard'

export default function MetricCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
      <MetricCard
        title="Air Quality Index"
        value={45}
        unit="AQI"
        trend="down"
        trendValue="5% ↓"
        status="good"
        description="Good air quality"
        lastUpdated="2 min ago"
      />
      <MetricCard
        title="Water Security"
        value={78}
        unit="%"
        trend="up"
        trendValue="3% ↑"
        status="warning"
        description="Moderate stress level"
        lastUpdated="5 min ago"
      />
      <MetricCard
        title="Green Space"
        value={32}
        unit="%"
        trend="stable"
        trendValue="0%"
        status="danger"
        description="Below recommended level"
        lastUpdated="1 min ago"
      />
    </div>
  )
}