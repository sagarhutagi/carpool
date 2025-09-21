import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import { useEffect, useState } from 'react';

const osrmRouteFetch = async(from, to) => {
  const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${from.reverse().join(',')};${to.reverse().join(',')}?overview=full&geometries=geojson`;

  // https://router.project-osrm.org/route/v1/driving/77.550866,12.924865;77.54393477639849,12.930553122951068?overview=full&geometries=geojson

  const response = await fetch(osrmUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
}

// Create a larger default marker icon
const largeIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconSize: [70, 102], // width, height (default is [25, 41])
  iconAnchor: [25, 82], // point of the icon which will correspond to marker's location
  popupAnchor: [0, -82], // point from which the popup should open relative to the iconAnchor
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  shadowSize: [68, 95],
  shadowAnchor: [22, 94]
});

const carLender = [12.924865, 77.550866];
const carPooler = [12.932375989090675, 77.55149747184085];
const destination = [12.9350833, 77.5308973];

const T = 30;

const carLendersArr = [
  [12.938424, 77.550346],
  [12.943215317980076, 77.54436815172889],
  [12.947355744750512, 77.53863280862069],
  [12.947326170606349, 77.5243703151023],
  [12.93854246808602, 77.52233715113013],
  [12.930882353770603, 77.51902946646351],
  [12.91692200408026, 77.53165329045191]
  // [12.915812875108708, 77.56497097626988],
  // [12.930542269752769, 77.56351438120412],
  // [12.941662682612048, 77.56035842519388],
  // [12.91386072158737, 77.53122652353656],
  // [12.911435297147186, 77.5568383203813],
  // [12.92474526242629, 77.55107263156964],
  // [12.925455107380667, 77.550040876773]
];


const OSRMMap = () => {

  useEffect(() => {

    const getRoute = async () => {
      let dataBA = await osrmRouteFetch(carLender, carPooler);
      let dataAD = await osrmRouteFetch(carPooler, destination);
      let tBA = dataBA.routes[0].duration/60
      let tAD = dataAD.routes[0].duration/60

      console.log(`Total time: ${tBA+tAD} mins`);

    }

    const findBestRoute = async () => {
      console.log("Finding best driver...");
      let leastTime = 10000000;
      let best_driver = [];
      for(let i=0;i<carLendersArr.length;i++){
        console.log(`Checking driver ${i+1}/${carLendersArr.length}`)
        let dataBA = await osrmRouteFetch(carLendersArr[i], carPooler);
        let dataAD = await osrmRouteFetch(carPooler, destination);
        let tBA = dataBA.routes[0].duration/60;
        let tAD = dataAD.routes[0].duration/60;
        let total_time = tBA+tAD;

        if(total_time<leastTime){
          leastTime = total_time
          best_driver = carLendersArr[i];
        }
        
      }
      console.log(`Best driver is at ${best_driver} with time ${leastTime} mins`);

    }

    // getRoute();
    findBestRoute();



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
      {/* Test Map Container with raw coordinates and polyline */}
      {/* <MapContainer
        center={[12.9716, 77.5946]}
        zoom={20}
        style={{ height: '2000px', width: '2000px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Polyline positions={routeCoords} color="blue" />
      </MapContainer> */}

      {/* Open Gmaps for navigation https://www.google.com/maps/dir/?api=1&origin=LAT1,LNG1&destination=LAT2,LNG2&waypoints=LAT3,LNG3|LAT4,LNG4 */}


      <MapContainer
        center={carPooler}
        zoom={14}
        style={{ height: '600px', width: '600px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={destination}>
          <Popup>Popup for Marker</Popup>
        </Marker>
        <Marker position={carPooler}>
          <Popup>Popup for Marker</Popup>
        </Marker>
        <Marker position={carLender}>
          <Popup>Popup for Marker</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default OSRMMap;