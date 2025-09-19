import './App.css'
import { MapContainer, TileLayer, Polyline } from 'react-leaflet';


function App() {
  const carLender = { lat: 12.9716, lng: 77.5946 };
const carpooler = { lat: 12.9352, lng: 77.6146 };
const destination = { lat: 12.9081, lng: 77.6476 };

// OSRM endpoint (public demo server)
const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${carLender.lng},${carLender.lat};${carpooler.lng},${carpooler.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson&steps=true`;

fetch(osrmUrl)
  .then(res => res.json())
  .then(data => {
    const route = data.routes[0];
    console.log("Route distance (meters):", route.distance);
    console.log("Route duration (seconds):", route.duration);
    console.log("Steps:", route.legs.map(leg => leg.steps));

    // Step 2: Redirect to Google Maps after 2 seconds
    const gmapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${carLender.lat},${carLender.lng}&destination=${destination.lat},${destination.lng}&waypoints=${carpooler.lat},${carpooler.lng}&travelmode=driving`;
    setTimeout(() => {
      // window.location.href = gmapsUrl;
    console.log("Redirecting to Google Maps:", gmapsUrl);
    }, 2000);
  })
  .catch(err => console.error("OSRM error:", err));

  return (
    <>

    </>
  )
}

export default App
