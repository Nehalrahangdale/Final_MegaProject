import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const ParkingMap = ({ parking = [], height = "450px" }) => {
  const defaultPosition = [21.1458, 79.0882];

  return (
    <div
      style={{
        width: "100%",
        height: height || "450px",
        borderRadius: "15px",
        overflow: "hidden",
      }}
    >
      <MapContainer
        center={defaultPosition}
        zoom={12}
        scrollWheelZoom={true}
        style={{
          width: "100%",
          height: "100%",
        }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {parking.map((item) => {
          if (
            item.latitude === null ||
            item.latitude === undefined ||
            item.longitude === null ||
            item.longitude === undefined
          ) {
            return null;
          }

          return (
            <Marker
              key={item._id}
              position={[
                Number(item.latitude),
                Number(item.longitude),
              ]}
            >
              <Popup>
                <strong>{item.name}</strong>
                <br />
                {item.address}
                <br />
                {item.city}
                <br />
                ₹{item.pricePerHour}/hour
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default ParkingMap;