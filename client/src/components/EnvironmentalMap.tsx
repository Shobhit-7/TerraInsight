import { useEffect, useRef, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Layers, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

// Import Leaflet dynamically to avoid SSR issues
import L from 'leaflet';

interface MapLayer {
  id: string;
  name: string;
  active: boolean;
  color: string;
}

interface EnvironmentalMapProps {
  layers?: MapLayer[];
  onLayerToggle?: (layerId: string) => void;
}

export default function EnvironmentalMap({ 
  layers = [
    { id: 'air-quality', name: 'Air Quality', active: true, color: 'bg-blue-500' },
    { id: 'water-stress', name: 'Water Stress', active: true, color: 'bg-cyan-500' },
    { id: 'green-space', name: 'Green Space', active: false, color: 'bg-green-500' },
    { id: 'traffic', name: 'Traffic Data', active: false, color: 'bg-orange-500' }
  ],
  onLayerToggle
}: EnvironmentalMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [selectedLayers, setSelectedLayers] = useState(layers);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize Leaflet map
    const map = L.map(mapRef.current).setView([37.7749, -122.4194], 10);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Add some sample markers for demonstration
    // todo: remove mock functionality
    const sampleData = [
      { lat: 37.7749, lng: -122.4194, type: 'air-quality', value: 45 },
      { lat: 37.7849, lng: -122.4094, type: 'water-stress', value: 78 },
      { lat: 37.7649, lng: -122.4294, type: 'green-space', value: 32 }
    ];

    sampleData.forEach(point => {
      const marker = L.circleMarker([point.lat, point.lng], {
        radius: 8,
        fillColor: point.type === 'air-quality' ? '#3b82f6' : 
                   point.type === 'water-stress' ? '#06b6d4' : '#10b981',
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
      }).addTo(map);

      marker.bindPopup(`
        <div class="p-2">
          <div class="font-semibold">${point.type.replace('-', ' ').toUpperCase()}</div>
          <div>Value: ${point.value}</div>
        </div>
      `);
    });

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const handleLayerToggle = (layerId: string) => {
    const updatedLayers = selectedLayers.map(layer =>
      layer.id === layerId ? { ...layer, active: !layer.active } : layer
    );
    setSelectedLayers(updatedLayers);
    onLayerToggle?.(layerId);
    console.log(`Layer ${layerId} toggled`);
  };

  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    }
  };

  const handleReset = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([37.7749, -122.4194], 10);
    }
  };

  return (
    <Card className="w-full h-full relative" data-testid="card-environmental-map">
      {/* Map Container */}
      <div 
        ref={mapRef} 
        className="w-full h-full min-h-[400px] rounded-lg"
        data-testid="map-container"
      />
      
      {/* Layer Controls */}
      <div className="absolute top-4 left-4 z-[1000]">
        <Card className="p-3 shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <Layers className="h-4 w-4" />
            <span className="text-sm font-medium">Layers</span>
          </div>
          <div className="space-y-2">
            {selectedLayers.map(layer => (
              <div key={layer.id} className="flex items-center gap-2">
                <Button
                  variant={layer.active ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleLayerToggle(layer.id)}
                  data-testid={`button-layer-${layer.id}`}
                  className="justify-start w-full"
                >
                  <div className={`w-3 h-3 rounded ${layer.color} mr-2`} />
                  {layer.name}
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={handleZoomIn}
          data-testid="button-zoom-in"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleZoomOut}
          data-testid="button-zoom-out"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleReset}
          data-testid="button-reset-view"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* Status Bar */}
      <div className="absolute bottom-4 left-4 z-[1000]">
        <Badge variant="secondary" className="bg-background/90 backdrop-blur">
          NASA Earth Data • Live Updates
        </Badge>
      </div>
    </Card>
  );
}