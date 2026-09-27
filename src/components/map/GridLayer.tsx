import { Rectangle, Tooltip } from 'react-leaflet';
import type { GridCell, MapLayer } from '../../types';
import type { LatLngBoundsExpression, PathOptions } from 'leaflet';
import { getLayerColor } from '../../services/weatherMapService';

interface GridLayerProps {
  cells: GridCell[];
  selectedCellId?: string;
  onCellClick?: (cell: GridCell) => void;
  colorBy?: MapLayer;
  visible?: boolean;
  subtle?: boolean; // When both Panchayat layer and grid are shown
}

function resolveGridFillColor(layer: MapLayer, cell: GridCell): string {
  switch (layer) {
    case 'temperature':
      return getLayerColor(cell.temperature, 'temperature');
    case 'rainfall':
      return getLayerColor(cell.rainfall, 'rainfall');
    case 'humidity':
      return getLayerColor(cell.humidity, 'humidity');
    case 'wind':
      return getLayerColor(cell.wind ?? cell.windSpeed, 'wind');
    case 'risk':
      return getLayerColor(0, 'risk', cell.risk ?? 'Moderate');
    case 'downscalingDiff':
      return getLayerColor(cell.downscalingDiff ?? 0, 'downscalingDiff');
    default:
      return '#94a3b8';
  }
}

export function GridLayer({
  cells,
  selectedCellId,
  onCellClick,
  colorBy = 'temperature',
  visible = true,
  subtle = false,
}: GridLayerProps) {
  if (!visible) return null;

  return (
    <>
      {cells.map((cell) => {
        const bounds: LatLngBoundsExpression = [
          [cell.bounds[0][0], cell.bounds[0][1]],
          [cell.bounds[1][0], cell.bounds[1][1]],
        ];

        const isSelected = cell.id === selectedCellId;
        const fillColor = resolveGridFillColor(colorBy, cell);

        const style: PathOptions = {
          fillColor: subtle ? fillColor : fillColor,
          fillOpacity: isSelected ? 0.65 : subtle ? 0.12 : 0.45,
          color: isSelected ? '#0f172a' : subtle ? '#475569' : '#334155',
          weight: isSelected ? 2.5 : subtle ? 1 : 1.2,
          dashArray: subtle ? '3, 4' : isSelected ? undefined : '2, 3',
        };

        return (
          <Rectangle
            key={`grid-${cell.id}-${colorBy}-${subtle}-${isSelected}`}
            bounds={bounds}
            pathOptions={style}
            eventHandlers={{
              click: () => onCellClick?.(cell),
            }}
          >
            <Tooltip sticky>
              <div className="text-xs font-sans p-0.5 min-w-[140px]">
                <div className="flex items-center justify-between pb-1 mb-1 border-b border-slate-100">
                  <span className="font-bold text-slate-800">1-km Cell {cell.id}</span>
                  <span className="text-[10px] bg-violet-50 text-violet-700 px-1 py-0.5 rounded font-mono font-medium">
                    1 km²
                  </span>
                </div>
                <div className="space-y-0.5 text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Temp:</span>
                    <span className="font-medium text-slate-800">{cell.temperature.toFixed(1)}°C</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Rainfall:</span>
                    <span className="font-medium text-slate-800">{cell.rainfall.toFixed(1)} mm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Humidity:</span>
                    <span className="font-medium text-slate-800">{cell.humidity}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Wind:</span>
                    <span className="font-medium text-slate-800">{cell.wind ?? cell.windSpeed} km/h</span>
                  </div>
                  {cell.downscalingDiff !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Δ vs Block:</span>
                      <span className="font-medium text-slate-800">
                        {cell.downscalingDiff > 0 ? '+' : ''}{cell.downscalingDiff.toFixed(1)}°C
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between pt-0.5 border-t border-slate-100">
                    <span className="text-slate-400">Elevation:</span>
                    <span className="font-medium text-slate-700">{cell.elevation} m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Model Conf:</span>
                    <span className="font-medium text-emerald-700">
                      {(cell.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            </Tooltip>
          </Rectangle>
        );
      })}
    </>
  );
}
