import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client' // <-- Correct import
const socket = io('http://localhost:5000');




function DriverPage() {
  const navigate = useNavigate();
  const pesu_coord = [12.935434549896387, 77.53599357316021];
  const [isAvailable, setIsAvailable] = useState(false);
  const [currentLocation, setCurrentLocation] = useState({ lat: '', lng: '', place_name: '' });
  const [destination, setDestination] = useState({ lat: '', lng: '', place_name: '' });
  const myID = "mynameisron"; //Unique ID for the driver fetched from login/auth system

  useEffect(() => {
    // Get current location when component mounts
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ lat: latitude, lng: longitude, place_name: 'Getting location...' });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  const toggleAvailability = async () => {
    const newAvailabilityStatus = !isAvailable;
    setIsAvailable(newAvailabilityStatus);

    if (newAvailabilityStatus) {
      // Going online - redirect to post-available page
      // Get current location
      if (!navigator.geolocation) {
        console.log('Geolocation is not supported by your browser');
        return;
      }
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          console.log([latitude, longitude]);
          const updatedLocation = { lat: latitude, lng: longitude, place_name: '' };
          setCurrentLocation(updatedLocation);

          // Send availability status to server
          const url = `http://localhost:3000/driver/available?tocollege=true&lat=${updatedLocation.lat}&lng=${updatedLocation.lng}&dlat=${destination.lat}&dlng=${destination.lng}`;

          navigate(`/driver-online/${myID}`, {
            state: {
              driverData: {
                id: myID,
                location: `${updatedLocation.lat}, ${updatedLocation.lng}`,
                destination: destination.place_name || 'Not set',
                destinationLat: destination.lat || '0',
                destinationLng: destination.lng || '0',
                tocollege: true,
                roomId: myID
              }
            }
          });
        },
        (err) => {
          console.log(`Error: ${err.message}`);
          setIsAvailable(false); // Revert on error
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      // Going offline - just update status
      console.log(`Driver ${myID} going offline`);
      // socket.emit('driver_offline', myID);
    }
  };

  const handleDestChange = (e) => {
    setDestination({ lat: destination.lat, lng: destination.lng, place_name: e.target.value });
  };

  const pesuBtn = () => {
    setDestination({ lat: pesu_coord[0], lng: pesu_coord[1], place_name: "PES University" });
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'sans-serif'
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem', color: '#333' }}>
        Driver Dashboard
      </h1>

      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '2rem',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        textAlign: 'center',
        maxWidth: '500px',
        width: '100%'
      }}>
        <div style={{ marginBottom: '2rem' }}>
          <h3>Current Status</h3>
          <div style={{
            padding: '1rem',
            borderRadius: '50px',
            backgroundColor: isAvailable ? '#d4edda' : '#f8d7da',
            color: isAvailable ? '#155724' : '#721c24',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            marginTop: '1rem'
          }}>
            {isAvailable ? '🟢 Available for Rides' : '🔴 Unavailable'}
          </div>
        </div>


        {/* Destination Section */}
        <div style={{ marginBottom: '2rem', textAlign: 'left' }}>
          <h4 style={{ marginBottom: '1rem' }}>Destination</h4>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input
              type="text"
              value={destination.place_name}
              onChange={handleDestChange}
              placeholder="Enter destination..."
              style={{
                flex: 1,
                padding: '0.75rem',
                fontSize: '1rem',
                border: '2px solid #e1e5e9',
                borderRadius: '8px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#2563eb'}
              onBlur={(e) => e.target.style.borderColor = '#e1e5e9'}
            />
            <button
              onClick={pesuBtn}
              style={{
                padding: '0.75rem 1.5rem',
                fontSize: '1rem',
                fontWeight: 'bold',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                backgroundColor: '#2563eb',
                color: 'white',
                transition: 'background-color 0.2s',
                whiteSpace: 'nowrap'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#1d4ed8'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#2563eb'}
            >
              PESU
            </button>
          </div>
          {destination.place_name && (
            <p style={{
              fontSize: '0.9rem',
              color: '#666',
              marginTop: '0.5rem',
              fontStyle: 'italic'
            }}>
              Selected: {destination.place_name}
            </p>
          )}
        </div>

        <button
          onClick={toggleAvailability}
          style={{
            padding: '1rem 2rem',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            backgroundColor: isAvailable ? '#dc3545' : '#28a745',
            color: 'white',
            transition: 'all 0.3s ease',
            width: '100%',
            marginBottom: '2rem'
          }}
        >
          {isAvailable ? 'Go Offline' : 'Go Online'}
        </button>


        <div style={{ textAlign: 'left' }}>
          <h4 style={{ marginBottom: '1rem' }}>Location Info</h4>
          <p><strong>Latitude:</strong> {currentLocation.lat || 'Getting...'}</p>
          <p><strong>Longitude:</strong> {currentLocation.lng || 'Getting...'}</p>
          <p><strong>Address:</strong> {currentLocation.place_name || 'Loading...'}</p>
        </div>
      </div>

      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <p style={{ color: '#666', fontSize: '0.9rem' }}>
          Toggle your availability to start receiving ride requests
        </p>
      </div>
    </div>
  );
}

export default DriverPage;