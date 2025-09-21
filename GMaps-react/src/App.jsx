import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Polyline } from 'react-leaflet';
import { useEffect, useState } from 'react';

const OSRMMap = () => {
  const [routeCoords, setRouteCoords] = useState([]);
  const [mydata, setMyData] = useState("Welcome to Carpool");

  useEffect(() => {
    const carLender = [77.5946, 12.9716];
    const carpooler = [77.6146, 12.9352];
    const destination = [77.6476, 12.9081];

    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${carLender.join(',')};${carpooler.join(',')};${destination.join(',')}?overview=full&geometries=geojson`;

    fetch(osrmUrl)
      .then(res => res.json())
      .then(data => {
        const coords = data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
        setMyData(data);
        setRouteCoords(coords);
      });
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        minWidth: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column'
      }}
    >
      <MapContainer
        center={[12.9716, 77.5946]}
        zoom={20}
        style={{ height: '2000px', width: '2000px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Polyline positions={routeCoords} color="blue" />
      </MapContainer>
    </div>
  );
};

export default OSRMMap;