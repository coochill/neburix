import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./HospitalMap.css";

import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

const DEFAULT_CENTER = [14.5995, 120.9842];

export default function HospitalMap() {
  const [position, setPosition] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const userMarkerRef = useRef(null);
  const circleRef = useRef(null);
  const hospitalLayerRef = useRef(null);

  async function findHospitals() {
    setError(null);
    setHospitals([]);
    setLoading(true);

    if (!navigator.geolocation) {
      setError("Geolocation not supported by your browser.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setPosition([lat, lon]);

        const query = `
          [out:json][timeout:25];
          (
            node(around:3000,${lat},${lon})[amenity=hospital];
            way(around:3000,${lat},${lon})[amenity=hospital];
            relation(around:3000,${lat},${lon})[amenity=hospital];
          );
          out center tags;`;

        try {
          const res = await fetch("https://overpass-api.de/api/interpreter", {
            method: "POST",
            body: query,
            headers: { "Content-Type": "text/plain" },
          });

          if (!res.ok) throw new Error(`Overpass error: ${res.status}`);

          const data = await res.json();

          const items = (data.elements || [])
            .map((el) => {
              const latlon =
                el.type === "node"
                  ? [el.lat, el.lon]
                  : el.center
                    ? [el.center.lat, el.center.lon]
                    : null;
              const tags = el.tags || {};

              return {
                id: `${el.type}-${el.id}`,
                name: tags.name || tags.operator || "Hospital",
                latlon,
                phone: tags.phone || tags["contact:phone"] || null,
                website: tags.website || tags.url || null,
                address:
                  [tags["addr:street"], tags["addr:city"], tags["addr:postcode"]]
                    .filter(Boolean)
                    .join(", ") || null,
              };
            })
            .filter((item) => item.latlon);

          setHospitals(items);
        } catch (err) {
          console.error(err);
          setError("Failed to fetch nearby hospitals.");
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error(err);
        setError("Failed to get your location. Permission denied or unavailable.");
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Leaflet tracks initialized containers internally; clear any stale marker before creating a new map.
    if (containerRef.current._leaflet_id) {
      delete containerRef.current._leaflet_id;
    }

    const map = L.map(containerRef.current, {
      center: DEFAULT_CENTER,
      zoom: 13,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);

    hospitalLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
      mapRef.current = null;
      userMarkerRef.current = null;
      circleRef.current = null;
      hospitalLayerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !position) return;

    map.setView(position, 14);

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng(position);
    } else {
      userMarkerRef.current = L.marker(position).addTo(map).bindPopup("You are here");
    }

    if (circleRef.current) {
      circleRef.current.setLatLng(position);
    } else {
      circleRef.current = L.circle(position, {
        radius: 1500,
        color: "#2b8",
        fillColor: "#2b8",
        fillOpacity: 0.1,
      }).addTo(map);
    }
  }, [position]);

  useEffect(() => {
    const map = mapRef.current;
    const layer = hospitalLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    hospitals.forEach((hospital) => {
      const marker = L.marker(hospital.latlon).addTo(layer);
      const phoneHtml = hospital.phone
        ? `<div>Phone: <a href="tel:${hospital.phone}">${hospital.phone}</a></div>`
        : "";
      const websiteHtml = hospital.website
        ? `<div><a href="${hospital.website}" target="_blank" rel="noreferrer">Website</a></div>`
        : "";
      const addressHtml = hospital.address ? `<div>${hospital.address}</div>` : "";
      const directions = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(hospital.latlon.join(","))}`;

      marker.bindPopup(
        `<strong>${hospital.name}</strong>${addressHtml}${phoneHtml}${websiteHtml}<div style="margin-top:6px"><a href="${directions}" target="_blank" rel="noreferrer">Get directions</a></div>`
      );
    });
  }, [hospitals]);

  return (
    <div className="hospital-map-card">
      <div className="hospital-map-controls">
        <button onClick={findHospitals} className="find-btn" aria-label="Find hospitals nearby">
          {loading ? "Searching…" : "Find hospitals near me"}
        </button>
        {error && <div className="error" role="alert">{error}</div>}
      </div>

      <div className="hospital-map-wrap" role="region" aria-label="Nearby hospitals map">
        <div ref={containerRef} className="hospital-map-canvas" />
      </div>

      <div className="hospital-list">
        {hospitals.length > 0 && <h3>Nearby hospitals</h3>}
        <ul>
          {hospitals.map((hospital) => (
            <li key={hospital.id} className="hospital-item">
              <div className="hospital-name">{hospital.name}</div>
              {hospital.address && <div className="hospital-addr">{hospital.address}</div>}
              {hospital.phone && <div>Phone: <a href={`tel:${hospital.phone}`}>{hospital.phone}</a></div>}
              <div className="hospital-actions">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(hospital.latlon.join(","))}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Directions
                </a>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
