import { useState, useEffect } from 'react';
import { MapContainer as LeafletMap, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import type { Panchayat, PanchayatWeather, GridCell, MapLayer } from '../../types';
import { MapToolbar } from './MapToolbar';
import { WeatherLayerControl } from './WeatherLayerControl';
import { PanchayatBoundaryLayer } from './PanchayatLayer';
import { GridLayer } from './GridLayer';
import { MapLegend } from './MapLegend';
import { MapControls } from './MapControls';
import { SelectedPanchayatMarker } from './SelectedPanchayatMarker';
import {
  fetchPanchayats,
  fetchPanchayatWeatherData,
  fetchGridCells,
  getBlockWeatherSummary,
} from '../../services/weatherMapService';

interface WeatherMapProps {
  initialLayer?: MapLayer;
  initialShowGrid?: boolean;
  initialShowPanchayats?: boolean;
  selectedPanchayatId?: string;
  onPanchayatSelect?: (panchayat: Panchayat | null) => void;
  height?: string;
  className?: string;
}

const DEFAULT_CENTER: [number, number] = [19.19, 73.83];
const DEFAULT_ZOOM = 11;

export function WeatherMap({
  initialLayer = 'temperature',
  initialShowGrid = true,
  initialShowPanchayats = true,
  selectedPanchayatId,
  onPanchayatSelect,
  height = '580px',
  className = '',
}: WeatherMapProps) {
  // Required application state
  const [selectedLayer, setSelectedLayer] = useState<MapLayer>(initialLayer);
  const [showGrid, setShowGrid] = useState<boolean>(initialShowGrid);
  const [showPanchayatBoundaries, setShowPanchayatBoundaries] =
    useState<boolean>(initialShowPanchayats);
  const [selectedPanchayat, setSelectedPanchayat] = useState<Panchayat | null>(null);

  // Data state loaded via clean service layer
  const [panchayats, setPanchayats] = useState<Panchayat[]>([]);
  const [weatherData, setWeatherData] = useState<Record<string, PanchayatWeather>>({});
  const [gridCells, setGridCells] = useState<GridCell[]>([]);
  const [loading, setLoading] = useState(true);

  const blockSummary = getBlockWeatherSummary();

  // Load mock data through service layer
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [panchayatList, weatherMap, cells] = await Promise.all([
          fetchPanchayats(),
          fetchPanchayatWeatherData(),
          fetchGridCells(),
        ]);
        if (!isMounted) return;
        setPanchayats(panchayatList);
        setWeatherData(weatherMap);
        setGridCells(cells);

        // Auto select if id provided
        if (selectedPanchayatId) {
          const found = panchayatList.find((p) => p.id === selectedPanchayatId);
          if (found) setSelectedPanchayat(found);
        }
      } catch (err) {
        console.error('Failed to load weather map data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [selectedPanchayatId]);

  // Derive effective selected panchayat
  const activePanchayat = selectedPanchayatId
    ? (panchayats.find((p) => p.id === selectedPanchayatId) ?? selectedPanchayat)
    : selectedPanchayat;

  const handleSelectPanchayat = (p: Panchayat) => {
    setSelectedPanchayat(p);
    onPanchayatSelect?.(p);
  };

  const handleClearSelection = () => {
    setSelectedPanchayat(null);
    onPanchayatSelect?.(null);
  };

  const selectedWeather = activePanchayat ? weatherData[activePanchayat.id] : null;

  return (
    <div
      className={`border border-slate-200 rounded-lg shadow-sm bg-white overflow-hidden flex flex-col ${className}`}
    >
      {/* 1. Map Toolbar (Visual story: BLOCK -> 1-KM GRID -> PANCHAYAT) */}
      <MapToolbar
        selectedLayer={selectedLayer}
        selectedPanchayat={activePanchayat}
        selectedWeather={selectedWeather}
        onClearSelection={handleClearSelection}
        blockName={blockSummary.block}
        blockTemperature={blockSummary.temperature}
      />

      {/* 2. Master Map Area (Dominant 75–80% visual surface) */}
      <div className="relative w-full overflow-hidden" style={{ height }}>
        {loading ? (
          <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-400 text-sm">
            <span>Loading advanced weather map layers...</span>
          </div>
        ) : (
          <LeafletMap
            center={DEFAULT_CENTER}
            zoom={DEFAULT_ZOOM}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
            zoomControl={false} // Using custom MapControls
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Custom Unobtrusive Controls */}
            <MapControls defaultCenter={DEFAULT_CENTER} defaultZoom={DEFAULT_ZOOM} />

            {/* 3. 1-km Grid Layer */}
            <GridLayer
              cells={gridCells}
              colorBy={selectedLayer}
              visible={showGrid}
              subtle={showPanchayatBoundaries}
            />

            {/* 4. Panchayat Boundaries Layer */}
            <PanchayatBoundaryLayer
              panchayats={panchayats}
              weatherData={weatherData}
              selectedId={activePanchayat?.id}
              onSelect={handleSelectPanchayat}
              activeLayer={selectedLayer}
              visible={showPanchayatBoundaries}
            />

            {/* 5. Selected Panchayat Highlight Marker */}
            {activePanchayat && showPanchayatBoundaries && (
              <SelectedPanchayatMarker
                panchayat={activePanchayat}
                weather={selectedWeather}
                activeLayer={selectedLayer}
              />
            )}
          </LeafletMap>
        )}

        {/* 6. Floating Left Panel: Weather Layer Control + Spatial Overlays */}
        {!loading && (
          <div className="absolute top-3 left-3 z-[900] pointer-events-auto">
            <WeatherLayerControl
              selectedLayer={selectedLayer}
              onLayerChange={setSelectedLayer}
              showGrid={showGrid}
              onToggleGrid={setShowGrid}
              showPanchayatBoundaries={showPanchayatBoundaries}
              onTogglePanchayatBoundaries={setShowPanchayatBoundaries}
            />
          </div>
        )}

        {/* 7. Floating Right Panel: Dynamic Map Legend */}
        {!loading && (
          <div className="absolute bottom-4 right-3 z-[900] pointer-events-auto max-w-xs">
            <MapLegend layer={selectedLayer} />
          </div>
        )}
      </div>
    </div>
  );
}
