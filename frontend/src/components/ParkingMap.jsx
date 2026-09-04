import React, { useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { calculateDistance } from "../services/parkingService";

// Fix standard Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Custom User Location Icon
const userLocationIcon = L.divIcon({
  className: "user-gps-marker",
  html: `
    <div style="position: relative; width: 22px; height: 22px;">
      <div style="
        position: absolute;
        top: -6px;
        left: -6px;
        width: 34px;
        height: 34px;
        border-radius: 50%;
        background: rgba(37, 99, 235, 0.25);
        animation: pulse 2s infinite;
      "></div>
      <div style="
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: #2563eb;
        border: 3px solid #ffffff;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      "></div>
    </div>
  `,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

// Custom Picker Pin for Owner Dashboard
const pickerLocationIcon = L.divIcon({
  className: "picker-marker",
  html: `
    <div style="
      background: #ef4444;
      color: white;
      width: 32px;
      height: 32px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 3px solid white;
      box-shadow: 0 4px 10px rgba(0,0,0,0.35);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="transform: rotate(45deg); font-size: 14px; font-weight: bold;">P</div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// Helper to safely check if coordinates are valid numbers
const isValidCoord = (lat, lng) => {
  if (lat === null || lat === undefined || lat === "" || lng === null || lng === undefined || lng === "") {
    return false;
  }
  const nLat = Number(lat);
  const nLng = Number(lng);
  return !isNaN(nLat) && !isNaN(nLng) && Math.abs(nLat) <= 90 && Math.abs(nLng) <= 180;
};

// Auto-adjust map bounds when markers or user location change
function FitBounds({ bounds, center, isPicker }) {
  const map = useMap();

  useEffect(() => {
    // In picker mode, do not force-zoom back on every pin reposition
    if (isPicker) return;

    try {
      if (bounds && typeof bounds.isValid === "function" && bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      } else if (center && Array.isArray(center) && !isNaN(center[0]) && !isNaN(center[1])) {
        map.setView(center, 13);
      }
    } catch (err) {
      console.warn("FitBounds adjust error:", err);
    }
  }, [bounds, center, isPicker, map]);

  return null;
}

// Click listener for interactive location picker
function LocationPickerHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      if (onLocationSelect && e.latlng) {
        onLocationSelect(
          Number(e.latlng.lat.toFixed(6)),
          Number(e.latlng.lng.toFixed(6))
        );
      }
    },
  });
  return null;
}

const DEFAULT_CENTER = [21.1458, 79.0882]; // Default fallback Nagpur

const ParkingMap = ({
  parking = [],
  userLocation = null, // { lat, lng }
  height = "450px",
  isPicker = false,
  pickerLocation = null, // { lat, lng }
  onLocationSelect = null, // (lat, lng) => {}
}) => {
  const safeParking = useMemo(() => {
    return Array.isArray(parking) ? parking : [];
  }, [parking]);

  // Compute bounding box
  const bounds = useMemo(() => {
    const latLngs = [];

    if (isValidCoord(userLocation?.lat, userLocation?.lng)) {
      latLngs.push([Number(userLocation.lat), Number(userLocation.lng)]);
    }

    if (isValidCoord(pickerLocation?.lat, pickerLocation?.lng)) {
      latLngs.push([Number(pickerLocation.lat), Number(pickerLocation.lng)]);
    }

    safeParking.forEach((item) => {
      if (item && isValidCoord(item.latitude, item.longitude)) {
        latLngs.push([Number(item.latitude), Number(item.longitude)]);
      }
    });

    if (latLngs.length > 0) {
      try {
        return L.latLngBounds(latLngs);
      } catch (err) {
        console.warn("Could not generate bounds:", err);
        return null;
      }
    }
    return null;
  }, [safeParking, userLocation, pickerLocation]);

  const mapCenter = useMemo(() => {
    if (isValidCoord(pickerLocation?.lat, pickerLocation?.lng)) {
      return [Number(pickerLocation.lat), Number(pickerLocation.lng)];
    }
    if (isValidCoord(userLocation?.lat, userLocation?.lng)) {
      return [Number(userLocation.lat), Number(userLocation.lng)];
    }
    const firstValid = safeParking.find(
      (item) => item && isValidCoord(item.latitude, item.longitude)
    );
    if (firstValid) {
      return [Number(firstValid.latitude), Number(firstValid.longitude)];
    }
    return DEFAULT_CENTER;
  }, [safeParking, userLocation, pickerLocation]);

  const pickerMarkerRef = useRef(null);

  return (
    <div
      style={{
        width: "100%",
        height: height || "450px",
        borderRadius: "16px",
        overflow: "hidden",
        position: "relative",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
      }}
    >
      <MapContainer
        center={mapCenter}
        zoom={12}
        scrollWheelZoom={true}
        style={{
          width: "100%",
          height: "100%",
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Fit Bounds Controller */}
        <FitBounds bounds={bounds} center={mapCenter} isPicker={isPicker} />

        {/* Interactive Picker Listener */}
        {isPicker && onLocationSelect && (
          <LocationPickerHandler onLocationSelect={onLocationSelect} />
        )}

        {/* User GPS Location Marker */}
        {isValidCoord(userLocation?.lat, userLocation?.lng) && (
          <>
            <Marker
              position={[Number(userLocation.lat), Number(userLocation.lng)]}
              icon={userLocationIcon}
            >
              <Popup>
                <div style={{ textAlign: "center", padding: "4px" }}>
                  <strong style={{ color: "#2563eb", fontSize: "14px" }}>
                    📍 You Are Here
                  </strong>
                  <br />
                  <small style={{ color: "#64748b" }}>
                    Your current detected GPS location
                  </small>
                </div>
              </Popup>
            </Marker>
            <Circle
              center={[Number(userLocation.lat), Number(userLocation.lng)]}
              radius={300}
              pathOptions={{
                color: "#2563eb",
                fillColor: "#3b82f6",
                fillOpacity: 0.12,
                weight: 1.5,
              }}
            />
          </>
        )}

        {/* Owner Selected Location Marker in Picker Mode */}
        {isPicker && isValidCoord(pickerLocation?.lat, pickerLocation?.lng) && (
          <Marker
            ref={pickerMarkerRef}
            position={[Number(pickerLocation.lat), Number(pickerLocation.lng)]}
            icon={pickerLocationIcon}
            draggable={true}
            eventHandlers={{
              dragend: (e) => {
                try {
                  const marker = e.target || pickerMarkerRef.current;
                  if (marker && onLocationSelect) {
                    const latLng = marker.getLatLng();
                    if (latLng && !isNaN(latLng.lat) && !isNaN(latLng.lng)) {
                      onLocationSelect(
                        Number(latLng.lat.toFixed(6)),
                        Number(latLng.lng.toFixed(6))
                      );
                    }
                  }
                } catch (err) {
                  console.warn("Marker dragend error:", err);
                }
              },
            }}
          >
            <Popup>
              <div style={{ padding: "4px", textAlign: "center" }}>
                <strong style={{ color: "#ef4444" }}>Selected Parking Spot</strong>
                <br />
                <small style={{ color: "#64748b" }}>
                  Lat: {Number(pickerLocation.lat).toFixed(5)}, Lng: {Number(pickerLocation.lng).toFixed(5)}
                </small>
                <div style={{ fontSize: "11px", marginTop: "4px", color: "#10b981" }}>
                  Drag marker or click map to reposition
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Parking Lot Markers */}
        {safeParking.map((item) => {
          if (!item || !isValidCoord(item.latitude, item.longitude)) {
            return null;
          }

          const dist =
            item.distance != null
              ? item.distance
              : isValidCoord(userLocation?.lat, userLocation?.lng)
              ? calculateDistance(
                  userLocation.lat,
                  userLocation.lng,
                  item.latitude,
                  item.longitude
                )
              : null;

          const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${item.latitude},${item.longitude}`;

          return (
            <Marker
              key={item._id || `${item.latitude}-${item.longitude}`}
              position={[Number(item.latitude), Number(item.longitude)]}
            >
              <Popup>
                <div style={{ minWidth: "210px", padding: "4px 2px" }}>
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{
                        width: "100%",
                        height: "90px",
                        objectFit: "cover",
                        borderRadius: "8px",
                        marginBottom: "8px",
                      }}
                    />
                  )}
                  <h6 style={{ fontWeight: 700, margin: "0 0 4px", fontSize: "14px" }}>
                    {item.name}
                  </h6>
                  <p style={{ margin: "0 0 6px", fontSize: "12px", color: "#64748b" }}>
                    📍 {item.address ? `${item.address}, ` : ""}{item.city}
                  </p>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      margin: "6px 0",
                      fontSize: "12px",
                    }}
                  >
                    <span style={{ fontWeight: 700, color: "#2563eb" }}>
                      ₹{item.pricePerHour}/hr
                    </span>
                    <span
                      style={{
                        background: "#dcfce7",
                        color: "#15803d",
                        padding: "2px 8px",
                        borderRadius: "10px",
                        fontSize: "11px",
                        fontWeight: 600,
                      }}
                    >
                      {item.availableSlots ?? item.totalSlots ?? 0} slots
                    </span>
                  </div>

                  {dist != null && (
                    <div
                      style={{
                        margin: "4px 0 8px",
                        fontSize: "11px",
                        color: "#0284c7",
                        fontWeight: 600,
                      }}
                    >
                      🧭 {dist} km from your location
                    </div>
                  )}

                  <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
                    <Link
                      to={`/parking/${item._id}`}
                      className="btn btn-sm btn-primary"
                      style={{
                        flex: 1,
                        fontSize: "11px",
                        padding: "4px 6px",
                        textDecoration: "none",
                        textAlign: "center",
                        borderRadius: "6px",
                      }}
                    >
                      View & Book
                    </Link>
                    <a
                      href={directionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-outline-secondary"
                      style={{
                        flex: 1,
                        fontSize: "11px",
                        padding: "4px 6px",
                        textDecoration: "none",
                        textAlign: "center",
                        borderRadius: "6px",
                      }}
                    >
                      Directions ↗
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default ParkingMap;