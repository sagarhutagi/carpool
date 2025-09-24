import 'leaflet/dist/leaflet.css';
import { MapContainer, Marker, TileLayer, Popup } from 'react-leaflet';
import { useEffect, useState, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import DriverInfoCard from '../components/driverInfoCard';

// Using a placeholder for the socket connection to avoid errors.
// In a real application, you would ensure the server is running and accessible.
// try {
//   const socket = io('http://localhost:3000');
// }
// catch {
//   console.log("Error connecting to server!")
// }

const carPooler = [12.932375989090675, 77.55149747184085];

function App() {
  const pesu_coord = [12.935434549896387, 77.53599357316021];
  const [currLocation, setCurrLocation] = useState({ lat: '', lng: '', place_name: '' });
  const [destination, setDestination] = useState({ lat: '', lng: '', place_name: '' });
  const [error, setError] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const debounceTimer = useRef(null);
  const [drivers, setDrivers] = useState([]);
  const [isFindingDriver, setIsFindingDriver] = useState(false);

  const handleDestChange = (e) => {
    setDestination({ lat: destination.lat, lng: destination.lng, place_name: e.target.value });
  }

  const pesuBtn = () => {
    setDestination({ lat: pesu_coord[0], lng: pesu_coord[1], place_name: "PES University" });
  }

  const findDriver = async() => {
    // Start the loading state
    setIsFindingDriver(true);

    try {
      const url = `http://localhost:3000/finddrivers?tocollege=true&lat=${currLocation.lat}&lng=${currLocation.lng}`;
      const response = await fetch(url);
      const data = await response.json();
      console.log(data);
      setDrivers(data);
    } catch (err) {
      console.error("Failed to fetch drivers:", err);
      setDrivers([]);
    } finally {
      // End the loading state, regardless of success or failure
      setIsFindingDriver(false);
    }
  }

  // Gets the current location corrdinates
  useEffect(() => {
    const getLocation = () => {
      if (!navigator.geolocation) {
        console.log('Geolocation is not supported by your browser');
        return;
      }
      setPageLoading(true)
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

  // Reverse geocoding, set page loading false after data fetched.
  useEffect(() => {
    if (!currLocation.lat || !currLocation.lng) return;

    // Debounce reverse geocoding
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(async () => {
      setPageLoading(true)
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
      } finally {
        setPageLoading(false)
      }
    }, 5000); // 5-second debounce
  }, [currLocation.lat, currLocation.lng]);

  let inputStyle = {
    width: "500px",
    padding: "0.5rem",
    fontSize: "1.2rem",
  }

  if (pageLoading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundImage: 'linear-gradient(to bottom right, #3b82f6, #1d4ed8)',
        color: '#fff',
        fontFamily: 'sans-serif'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: "100vw"
        }}>
          <div style={{
            position: 'relative',
            width: '6rem',
            height: '6rem'
          }}>
            <svg style={{
              animation: 'spin-slow 3s linear infinite',
              width: '100%',
              height: '100%'
            }} viewBox="0 0 100 100">
              {/* The main outer ring */}
              <circle
                style={{ opacity: 0.3 }}
                cx="50"
                cy="50"
                r="45"
                stroke="#fff"
                strokeWidth="5"
                fill="none"
              />
              {/* The animated path */}
              <path
                style={{ stroke: 'currentColor' }}
                d="M 50 5 a 45 45 0 0 1 45 45"
                stroke="#fff"
                strokeWidth="5"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)'
            }}>
              <svg style={{ height: '2.5rem', width: '2.5rem', color: '#fff' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
          </div>
          <h1 style={{
            fontSize: '2.25rem',
            fontWeight: '800',
            letterSpacing: '-0.025em',
            color: '#fff'
          }}>
            Getting your location...
          </h1>
          <p style={{
            fontSize: '1.125rem',
            fontWeight: '300',
            opacity: 0.8,
            textAlign: 'center',
            maxWidth: '28rem'
          }}>
            Please wait while we pinpoint your exact coordinates.
          </p>
        </div>
        <style>
          {`
          @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
        </style>
      </div>
    );
  }

  return (
    <>
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
        <div>
          Destination: <input type="text" value={destination.place_name} onChange={handleDestChange} style={inputStyle} />
          <button onClick={pesuBtn}>PESU</button>
          <button onClick={findDriver} disabled={isFindingDriver}>
            {isFindingDriver ? 'Finding Drivers...' : 'Find Driver!'}
          </button>
        </div>
        <br />

        <div style={{
          backgroundColor: "red",
          display: "flex"
        }}>
          <MapContainer center={[currLocation.lat, currLocation.lng]} zoom={14} style={{ height: '500px', width: '500px' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[currLocation.lat, currLocation.lng]}> <Popup>Your Location.</Popup> </Marker>
            {destination.lat && <Marker position={[destination.lat, destination.lng]}> <Popup>Destination</Popup></Marker>}
          </MapContainer>
        </div>
        <br />

        <div style={{ marginBottom: "100px" }}>
          {isFindingDriver ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
              <Loader2 className="animate-spin" style={{ marginRight: '10px' }} />
              <p>Searching for drivers...</p>
            </div>
          ) : (
            drivers.length > 0 ? (
              drivers.map((driver) => (
                <DriverInfoCard
                  key={driver._id}
                  name={driver.name}
                  rating={driver.rating}
                  distance={(driver.distance/1000).toFixed(1)}
                  eta={(driver.eta/60).toFixed(1)}
                />
              ))
            ) : (
              <p>No drivers found matching your criteria.</p>
            )
          )}
        </div>
      </div>
    </>
  );
}

export default App;
