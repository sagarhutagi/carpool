import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer } from 'react-leaflet';
import { useEffect, useState, useRef } from 'react';

const carLender = [12.924865, 77.550866];
const carPooler = [12.932375989090675, 77.55149747184085];
const destination = [12.9350833, 77.5308973];

function App() {
  const [currLocation, setCurrLocation] = useState({ lat: '', lng: '', place_name: '' });
  const [destinationText, setDestinationText] = useState(destination);
  const [error, setError] = useState(null);
  const debounceTimer = useRef(null);

  useEffect(() => {
    const getLocation = () => {
      if (!navigator.geolocation) {
        console.log('Geolocation is not supported by your browser');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log([latitude, longitude]);
          setCurrLocation({ lat: latitude, lng: longitude, place_name: '' });
        },
        (err) => {
          console.log(`Error: ${err.message}`);
          setError(err.message);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    };

    getLocation();
  }, []);

  useEffect(() => {
    if (!currLocation.lat || !currLocation.lng) return;

    // Debounce reverse geocoding
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(async () => {
      try {
        const URL = `https://nominatim.openstreetmap.org/reverse?lat=${currLocation.lat}&lon=${currLocation.lng}&format=json`;
        const res = await fetch(URL);
        const data = await res.json();
        console.log(data.display_name);
        setCurrLocation((prev) => ({
          ...prev,
          place_name: data.display_name || 'Unknown location',
        }));
      } catch (err) {
        console.log('Reverse geocoding failed:', err);
      }
    }, 3000); // 3-second debounce
  }, [currLocation.lat, currLocation.lng]);

  let inputStyle = {
    width: "500px",
    padding: "0.5rem",
    fontSize: "1.2rem",
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        minWidth: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
      }}
    >
      <div>
        Current Location: <input type="text" value={currLocation.place_name} readOnly style={inputStyle} />
      </div>
      <br />
      <MapContainer center={carPooler} zoom={14} style={{ height: '500px', width: '500px' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </MapContainer>
    </div>
  );
}

export default App;