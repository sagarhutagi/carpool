import 'leaflet/dist/leaflet.css';
import { MapContainer, Marker, TileLayer, Popup } from 'react-leaflet';
import { useEffect, useState, useRef } from 'react';
import { Loader2 } from 'lucide-react';
// import DriverInfoCard from '../components/DriverInfoCard.jsx';
import DriverInfoCard from '../components/driverInfoCard';


try {
  const socket = io('http://localhost:3000');
}
catch {
  console.log("Error connecting to server!")
}
// const carLender = [12.924865, 77.550866];
// const carPooler = [12.932375989090675, 77.55149747184085];
// const destination = [12.9350833, 77.5308973];

function App() {
  const pesu_coord = [12.935434549896387, 77.53599357316021];
  const someDrivers = [{
    "name": "Alex",
    "rating": "4.9",
    "distance": "0.5 mi",
    "eta": "3 min",
  },
  {
    "name": "Ben",
    "rating": "4.7",
    "distance": "1.2 mi",
    "eta": "7 min"
  },
  {
    "name": "Chris",
    "rating": "4.8",
    "distance": "0.8 mi",
    "eta": "5 min"
  },
  {
    "name": "David",
    "rating": "5.0",
    "distance": "2.1 mi",
    "eta": "10 min"
  },
  {
    "name": "Ethan",
    "rating": "4.6",
    "distance": "0.6 mi",
    "eta": "4 min"
  }];

  const [currLocation, setCurrLocation] = useState({ lat: '', lng: '', place_name: '' });
  const [destination, setDestination] = useState({ lat: '', lng: '', place_name: '' });
  const [error, setError] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const debounceTimer = useRef(null);
  const [drivers, setDrivers] = useState([]);


  const handleDestChange = (e) => {
    setDestination({ lat: destination.lat, lng: destination.lng, place_name: e.target.value });
  }

  const pesuBtn = () => {
    setDestination({ lat: pesu_coord[0], lng: pesu_coord[1], place_name: "PES University" });
  }

  const findDriver = () => {

    //  Send API request to backend with currLocation and destination
    //  Display top 5 drivers around rider, along with their ratings and everything

    //Appending raw data now:
    setDrivers(someDrivers);

  }

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
    }, 5000); // 3-second debounce
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
          <button onClick={findDriver}>Find Driver!</button>
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
            <Marker position={[destination.lat, destination.lng]}> <Popup>Destination</Popup></Marker>
          </MapContainer>

        </div>
        <br />




        <div style={{
          marginBottom: "100px"
        }}>

          {drivers.map((driver, index) => (
            <DriverInfoCard
              name={driver.name}
              rating={driver.rating}
              distance={driver.distance}
              eta={driver.eta}
            />
          ))}
        </div>
      </div>
    </>
  );
}

export default App;