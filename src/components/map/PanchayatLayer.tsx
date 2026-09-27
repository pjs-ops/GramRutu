import { GeoJSON, Tooltip } from 'react-leaflet';
import type { Panchayat, PanchayatWeather, MapLayer } from '../../types';
import type { Feature, Polygon } from 'geojson';
import type { PathOptions, LeafletMouseEvent, Layer } from 'leaflet';
import { getLayerColor, computeSimpleRisk } from '../../services/weatherMapService';

interface PanchayatLayerProps {
  panchayats: Panchayat[];
  weatherData?: Record<string, PanchayatWeather>;
  selectedId?: string;
  onSelect?: (panchayat: Panchayat) => void;
  activeLayer?: MapLayer;
  visible?: boolean;
}

function resolveFillColor(layer: MapLayer, weather?: PanchayatWeather): string {
  if (!weather) return '#94a3b8';
  switch (layer) {
    case 'temperature':
      return getLayerColor(weather.temperature, 'temperature');
    case 'rainfall':
      return getLayerColor(weather.rainfall, 'rainfall');
    case 'humidity':
      return getLayerColor(weather.humidity, 'humidity');
    case 'wind':
      return getLayerColor(weather.wind ?? weather.windSpeed, 'wind');
    case 'risk':
      return getLayerColor(0, 'risk', weather.risk ?? computeSimpleRisk(weather));
    case 'downscalingDiff':
      return getLayerColor(weather.downscalingDiff ?? 0, 'downscalingDiff');
    default:
      return '#94a3b8';
  }
}

export function PanchayatLayer({
  panchayats,
  weatherData,
  selectedId,
  onSelect,
  activeLayer = 'temperature',
  visible = true,
}: PanchayatLayerProps) {
  if (!visible) return null;

  return (
    <>
      {panchayats.map((p) => {
        const feature: Feature<Polygon> = {
          type: 'Feature',
          geometry: p.geometry as Polygon,
          properties: { id: p.id, name: p.name },
        };

        const weather = weatherData?.[p.id];
        const isSelected = p.id === selectedId;
        const fillColor = resolveFillColor(activeLayer, weather);

        const defaultStyle: PathOptions = {
          fillColor,
          fillOpacity: isSelected ? 0.8 : 0.55,
          color: isSelected ? '#0f172a' : '#334155',
          weight: isSelected ? 3 : 1.5,
          dashArray: isSelected ? undefined : undefined,
        };

        const onEachFeature = (_feat: Feature, layer: Layer) => {
          layer.on({
            mouseover: (e) => {
              const target = e.target;
              target.setStyle({
                weight: isSelected ? 3.5 : 2.5,
                color: isSelected ? '#020617' : '#0f172a',
                fillOpacity: isSelected ? 0.88 : 0.72,
              });
              if (!target._map) return;
              target.bringToFront();
            },
            mouseout: (e) => {
              const target = e.target;
              target.setStyle(defaultStyle);
            },
          });
        };

        return (
          <GeoJSON
            key={`${p.id}-${activeLayer}-${isSelected}-${visible}`}
            data={feature}
            style={defaultStyle}
            onEachFeature={onEachFeature}
            eventHandlers={{
              click: (_e: LeafletMouseEvent) => onSelect?.(p),
            }}
          >
            <Tooltip sticky>
              <div className="text-xs font-sans min-w-[150px] p-0.5">
                <div className="flex items-center justify-between pb-1 mb-1 border-b border-slate-100">
                  <span className="font-bold text-slate-800 text-[13px]">{p.name}</span>
                  {weather?.crop && (
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                      {weather.crop}
                    </span>
                  )}
                </div>
                {weather && (
                  <div className="space-y-1 text-slate-600">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Temperature:</span>
                      <span className="font-semibold text-slate-800">{weather.temperature}°C</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Rainfall:</span>
                      <span className="font-semibold text-slate-800">{weather.rainfall} mm</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Humidity:</span>
                      <span className="font-semibold text-slate-800">{weather.humidity}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Wind:</span>
                      <span className="font-semibold text-slate-800">
                        {weather.wind ?? weather.windSpeed} km/h
                      </span>
                    </div>
                    {weather.downscalingDiff !== undefined && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Δ vs IMD Block:</span>
                        <span
                          className={`font-semibold ${
                            weather.downscalingDiff > 0
                              ? 'text-orange-600'
                              : weather.downscalingDiff < 0
                              ? 'text-blue-600'
                              : 'text-slate-700'
                          }`}
                        >
                          {weather.downscalingDiff > 0 ? '+' : ''}
                          {weather.downscalingDiff.toFixed(1)}°C
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                      <span className="text-slate-400">Risk Assessment:</span>
                      <span
                        className={`font-bold px-1 rounded text-[11px] ${
                          (weather.risk ?? computeSimpleRisk(weather)) === 'Severe'
                            ? 'text-red-700 bg-red-50'
                            : (weather.risk ?? computeSimpleRisk(weather)) === 'High'
                            ? 'text-orange-700 bg-orange-50'
                            : (weather.risk ?? computeSimpleRisk(weather)) === 'Moderate'
                            ? 'text-amber-700 bg-amber-50'
                            : 'text-emerald-700 bg-emerald-50'
                        }`}
                      >
                        {weather.risk ?? computeSimpleRisk(weather)}
                      </span>
                    </div>
                  </div>
                )}
                <p className="text-[10px] text-slate-400 mt-1.5 italic text-center">
                  Click to select Panchayat
                </p>
              </div>
            </Tooltip>
          </GeoJSON>
        );
      })}
    </>
  );
}

export { PanchayatLayer as PanchayatBoundaryLayer };
