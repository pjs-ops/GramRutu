import { MapContainer as LeafletMap, TileLayer } from 'react-leaflet';
import type { ReactNode } from 'react';
import 'leaflet/dist/leaflet.css';

interface MapContainerComponentProps {
  center?: [number, number];
  zoom?: number;
  children?: ReactNode;
  height?: string;
  className?: string;
}

export function MapContainerComponent({
  center = [19.19, 73.83],
  zoom = 11,
  children,
  height = '400px',
  className = '',
}: MapContainerComponentProps) {
  return (
    <div className={`border border-gray-200 rounded-md overflow-hidden ${className}`} style={{ height }}>
      <LeafletMap
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {children}
      </LeafletMap>
    </div>
  );
}
