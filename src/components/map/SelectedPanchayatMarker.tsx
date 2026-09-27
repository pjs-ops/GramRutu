import { CircleMarker, Tooltip } from 'react-leaflet';
import type { Panchayat, PanchayatWeather, MapLayer } from '../../types';
import { formatLayerValue } from '../../services/weatherMapService';

interface SelectedPanchayatMarkerProps {
  panchayat: Panchayat | null;
  weather?: PanchayatWeather | null;
  activeLayer?: MapLayer;
}

export function SelectedPanchayatMarker({
  panchayat,
  weather,
  activeLayer = 'temperature',
}: SelectedPanchayatMarkerProps) {
  if (!panchayat || !panchayat.centroid) return null;

  const [lat, lng] = panchayat.centroid;

  return (
    <>
      {/* Outer subtle pulse ring */}
      <CircleMarker
        center={[lat, lng]}
        radius={18}
        pathOptions={{
          color: '#10b981',
          fillColor: '#10b981',
          fillOpacity: 0.15,
          weight: 1.5,
          dashArray: '3, 3',
        }}
      />
      {/* Core marker */}
      <CircleMarker
        center={[lat, lng]}
        radius={7}
        pathOptions={{
          color: '#0f172a',
          fillColor: '#10b981',
          fillOpacity: 0.95,
          weight: 2,
        }}
      >
        <Tooltip permanent direction="top" offset={[0, -8]}>
          <div className="text-center font-sans">
            <span className="font-bold text-xs text-slate-800 block">
              {panchayat.name}
            </span>
            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded font-semibold inline-block mt-0.5">
              {formatLayerValue(activeLayer, weather)}
            </span>
          </div>
        </Tooltip>
      </CircleMarker>
    </>
  );
}
