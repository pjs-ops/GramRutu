import { Plus, Minus, RotateCcw } from 'lucide-react';
import { useMap } from 'react-leaflet';

interface MapControlsProps {
  defaultCenter?: [number, number];
  defaultZoom?: number;
  className?: string;
}

export function MapControls({
  defaultCenter = [19.19, 73.83],
  defaultZoom = 11,
  className = '',
}: MapControlsProps) {
  const map = useMap();

  const handleZoomIn = () => {
    map.zoomIn();
  };

  const handleZoomOut = () => {
    map.zoomOut();
  };

  const handleResetView = () => {
    map.flyTo(defaultCenter, defaultZoom, {
      duration: 0.8,
    });
  };

  return (
    <div
      className={`leaflet-top leaflet-right !top-3 !right-3 z-[1000] flex flex-col gap-1.5 pointer-events-auto ${className}`}
    >
      <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-lg shadow-md overflow-hidden flex flex-col">
        <button
          type="button"
          onClick={handleZoomIn}
          title="Zoom In"
          className="w-8 h-8 flex items-center justify-center text-slate-700 hover:bg-slate-100 hover:text-slate-900 border-b border-slate-100 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          title="Zoom Out"
          className="w-8 h-8 flex items-center justify-center text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
        >
          <Minus className="w-4 h-4" />
        </button>
      </div>

      <button
        type="button"
        onClick={handleResetView}
        title="Reset View"
        className="w-8 h-8 rounded-lg bg-white/95 backdrop-blur-sm border border-slate-200 shadow-md flex items-center justify-center text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
      >
        <RotateCcw className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
