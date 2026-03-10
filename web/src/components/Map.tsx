"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default marker icons in bundled environments
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

interface MapOperator {
  id: number;
  slug: string;
  name: string;
  lat: number;
  lng: number;
  rating: number | null;
}

interface MapProps {
  operators: MapOperator[];
  className?: string;
}

export default function Map({ operators, className = "" }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView([46.6, 2.2], 6);
    mapInstanceRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(map);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    if (operators.length === 0) return;

    const bounds: L.LatLngTuple[] = [];

    operators.forEach((op) => {
      const marker = L.marker([op.lat, op.lng]).addTo(map);
      bounds.push([op.lat, op.lng]);

      const ratingHtml = op.rating
        ? `<span class="text-amber-500">★</span> ${op.rating.toFixed(1)}`
        : "";

      marker.bindPopup(`
        <div class="text-sm">
          <a href="/pompes/${op.slug}" class="font-semibold text-stone-900 hover:underline">
            ${op.name}
          </a>
          ${ratingHtml ? `<div class="mt-1">${ratingHtml}</div>` : ""}
        </div>
      `);
    });

    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [30, 30], maxZoom: 14 });
    }
  }, [operators]);

  return (
    <div
      ref={mapRef}
      className={`rounded-lg border border-stone-200 ${className}`}
      style={{ minHeight: "400px" }}
    />
  );
}
